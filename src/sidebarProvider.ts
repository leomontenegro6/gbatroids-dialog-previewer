import * as vscode from 'vscode';
import * as path from 'path';

export class SidebarProvider implements vscode.WebviewViewProvider {
    public static readonly viewType = 'dialogPreviewer';

    private _view?: vscode.WebviewView;

    constructor(
        private readonly _extensionUri: vscode.Uri,
        private readonly _extensionContext: vscode.ExtensionContext
    ) {}

    private _getZoomLevel(): number {
        // Try workspace configuration first, fallback to globalState
        const config = vscode.workspace.getConfiguration('gbaMetroidsDialogPreviewer');
        let value = config.get<number>('zoomLevel');
        
        if (value === undefined) {
            // Fallback to globalState if config not set
            value = this._extensionContext.globalState.get('previewZoom', 2);
        }
        
        return value;
    }

    private _setZoomLevel(zoom: number): void {
        // Set both workspace config and globalState for reliability
        const config = vscode.workspace.getConfiguration('gbaMetroidsDialogPreviewer');
        config.update('zoomLevel', zoom, vscode.ConfigurationTarget.Global);
        this._extensionContext.globalState.update('previewZoom', zoom);
    }

    private _getGameType(): string {
        // Try workspace configuration first, fallback to globalState
        const config = vscode.workspace.getConfiguration('gbaMetroidsDialogPreviewer');
        let value = config.get<string>('gameType');
        
        if (value === undefined) {
            // Fallback to globalState if config not set
            value = this._extensionContext.globalState.get('gameType', 'mzm-vanilla');
        }
        
        return value;
    }

    private _setGameType(game: string): void {
        // Set both workspace config and globalState for reliability
        const config = vscode.workspace.getConfiguration('gbaMetroidsDialogPreviewer');
        config.update('gameType', game, vscode.ConfigurationTarget.Global);
        this._extensionContext.globalState.update('gameType', game);
    }

    private _getDialogType(): string {
        // Try workspace configuration first, fallback to globalState
        const config = vscode.workspace.getConfiguration('gbaMetroidsDialogPreviewer');
        let value = config.get<string>('dialogType');
        
        if (value === undefined) {
            // Fallback to globalState if config not set
            value = this._extensionContext.globalState.get('dialogType', 'twolines');
        }
        
        return value;
    }

    private _setDialogType(dialogType: string): void {
        // Set both workspace config and globalState for reliability
        const config = vscode.workspace.getConfiguration('gbaMetroidsDialogPreviewer');
        config.update('dialogType', dialogType, vscode.ConfigurationTarget.Global);
        this._extensionContext.globalState.update('dialogType', dialogType);
    }

    public resolveWebviewView(
        webviewView: vscode.WebviewView,
        context: vscode.WebviewViewResolveContext,
        _token: vscode.CancellationToken,
    ) {
        this._view = webviewView;

        webviewView.webview.options = {
            // Allow scripts in the webview
            enableScripts: true,
            localResourceRoots: [
                this._extensionUri,
                vscode.Uri.joinPath(this._extensionUri, 'assets')
            ]
        };

        webviewView.webview.html = this._getHtmlForWebview(webviewView.webview);

        // Handle messages from webview
        webviewView.webview.onDidReceiveMessage((message) => {
            switch (message.type) {
                case 'getZoom':
                    const zoomValue = this._getZoomLevel();
                    webviewView.webview.postMessage({
                        type: 'zoomLevel',
                        data: zoomValue
                    });
                    break;
                case 'setZoom':
                    this._setZoomLevel(message.zoom);
                    break;
                case 'getGame':
                    const gameValue = this._getGameType();
                    webviewView.webview.postMessage({
                        type: 'gameType',
                        data: gameValue
                    });
                    break;
                case 'setGame':
                    this._setGameType(message.data);
                    // Send updated font sprite URIs to webview without full reload
                    this._sendUpdatedFontUris(webviewView.webview, message.data);
                    break;
                case 'getDialogType':
                    const dialogValue = this._getDialogType();
                    webviewView.webview.postMessage({
                        type: 'dialogType',
                        data: dialogValue
                    });
                    break;
                case 'setDialogType':
                    this._setDialogType(message.data);
                    // Send updated window URIs to webview without full reload
                    this._sendUpdatedWindowUris(webviewView.webview, message.data);
                    break;
            }
        });

        // Listen for file changes
        this._setupFileListeners();
        
        // Setup auto-reload for webview files during development
        this._setupWebviewAutoReload();
    }

    private _setupFileListeners() {
        // Listen for text editor selection changes
        vscode.window.onDidChangeTextEditorSelection((event) => {
            if (this._view && event.textEditor) {
                const editor = event.textEditor;
                const document = editor.document;
                const selection = editor.selection;
                const position = selection.active;
                
                const fileName = path.basename(document.fileName);
                const blockInfo = this._extractBlockStrings(document, position.line);
                
                this._view.webview.postMessage({
                    type: 'cursorChange',
                    data: {
                        fileName: fileName,
                        lineNumber: position.line + 1, // 1-based line numbers
                        column: position.character + 1, // 1-based column numbers
                        blockName: blockInfo.blockName,
                        strings: blockInfo.strings,
                        timestamp: new Date().toISOString()
                    }
                });
            }
        });
    }

    private _setupWebviewAutoReload() {
        // Watch for changes in compiled output only
        const distWatcher = vscode.workspace.createFileSystemWatcher(
            new vscode.RelativePattern(this._extensionUri, 'dist/**/*.{js,css}')
        );
        
        // Watch for changes in webview TypeScript source files only (CSS handled via dist)
        const webviewWatcher = vscode.workspace.createFileSystemWatcher(
            new vscode.RelativePattern(this._extensionUri, 'webview/**/*.{tsx,ts}')
        );

        const reloadWebview = () => {
            if (this._view) {
                // Small delay to ensure file is fully written
                setTimeout(() => {
                    if (this._view) {
                        // Try to reload gracefully by sending a message first
                        this._view.webview.postMessage({ type: 'reload' });
                        
                        // If that doesn't work, do a full HTML reload as fallback
                        setTimeout(() => {
                            if (this._view) {
                                this._view.webview.html = this._getHtmlForWebview(this._view.webview);
                            }
                        }, 50);
                    }
                }, 100);
            }
        };

        // Reload on compiled output changes (for immediate feedback)
        distWatcher.onDidChange(reloadWebview);
        distWatcher.onDidCreate(reloadWebview);
        
        // Reload on source file changes (backup, in case esbuild is slow)
        webviewWatcher.onDidChange(reloadWebview);
        webviewWatcher.onDidCreate(reloadWebview);

        // Cleanup watchers when extension is disposed
        this._extensionContext.subscriptions.push(distWatcher, webviewWatcher);
    }

    private _sendUpdatedFontUris(webview: vscode.Webview, gameType: string) {
        // Send only the updated font sprite URI for the selected game
        const gameKey = gameType.replace(/-/g, '_');
        const fontSpriteUri = webview.asWebviewUri(vscode.Uri.joinPath(this._extensionUri, 'assets', gameType.replace('-', '/'), 'font-sprite.png'));
        
        webview.postMessage({
            type: 'updateFontUri',
            data: {
                gameType: gameType,
                fontSpriteUri: fontSpriteUri.toString()
            }
        });
    }

    private _sendUpdatedWindowUris(webview: vscode.Webview, dialogType: string) {
        // Send only the updated window URI for the selected dialog type
        const windowUri = webview.asWebviewUri(vscode.Uri.joinPath(this._extensionUri, 'assets', `window-${dialogType}.png`));
        
        webview.postMessage({
            type: 'updateWindowUri',
            data: {
                dialogType: dialogType,
                windowUri: windowUri.toString()
            }
        });
    }

    private _extractBlockStrings(document: vscode.TextDocument, currentLine: number): { blockName: string | null, strings: string[] } {
        const totalLines = document.lineCount;
        let blockName: string | null = null;
        const strings: string[] = [];

        // Find the block start by going backwards
        let blockStartLine = -1;
        for (let i = currentLine; i >= 0; i--) {
            const line = document.lineAt(i).text.trim();
            if (line.match(/^block_\d+_str_\d+:$/)) {
                blockStartLine = i;
                blockName = line.replace(':', '');
                break;
            }
        }

        // If we found a block start, find strings until we hit the end marker
        if (blockStartLine !== -1) {
            for (let i = blockStartLine + 1; i < totalLines; i++) {
                const line = document.lineAt(i).text.trim();
                
                // Check for end of block
                if (line === 'db 0x00, 0xFF') {
                    break;
                }
                
                // Check for start of next block
                if (line.match(/^block_\d+_str_\d+:$/)) {
                    break;
                }
                
                // Extract .stringn content
                const stringMatch = line.match(/\.stringn\s+"(.+)"/);
                if (stringMatch) {
                    strings.push(stringMatch[1]);
                }
            }
        }

        return { blockName, strings };
    }

    private _getHtmlForWebview(webview: vscode.Webview) {
        // Get the local path to main script run in the webview, then convert it to a uri we can use in the webview.
        const scriptUri = webview.asWebviewUri(vscode.Uri.joinPath(this._extensionUri, 'dist', 'webview.js'));

        // Do the same for the stylesheet.
        const styleResetUri = webview.asWebviewUri(vscode.Uri.joinPath(this._extensionUri, 'media', 'reset.css'));
        const styleVSCodeUri = webview.asWebviewUri(vscode.Uri.joinPath(this._extensionUri, 'media', 'vscode.css'));
        const styleCustomUri = webview.asWebviewUri(vscode.Uri.joinPath(this._extensionUri, 'dist', 'styles.css'));

        // Get assets URIs for all game variants
        const fontSpriteUri_mzm_vanilla = webview.asWebviewUri(vscode.Uri.joinPath(this._extensionUri, 'assets', 'mzm', 'vanilla', 'font-sprite.png'));
        const fontSpriteUri_mzm_projectzm = webview.asWebviewUri(vscode.Uri.joinPath(this._extensionUri, 'assets', 'mzm', 'projectzm', 'font-sprite.png'));
        const fontSpriteUri_mf_vanilla = webview.asWebviewUri(vscode.Uri.joinPath(this._extensionUri, 'assets', 'mf', 'vanilla', 'font-sprite.png'));
        const fontSpriteUri_mf_mzmlike = webview.asWebviewUri(vscode.Uri.joinPath(this._extensionUri, 'assets', 'mf', 'mzmlike', 'font-sprite.png'));
        
        // Get dialog window URIs
        const window_mfdialog_Uri = webview.asWebviewUri(vscode.Uri.joinPath(this._extensionUri, 'assets', 'window-mfdialog.png'));
        const window_multilines_black_Uri = webview.asWebviewUri(vscode.Uri.joinPath(this._extensionUri, 'assets', 'window-multilines-black.png'));
        const window_multilines_elevator_Uri = webview.asWebviewUri(vscode.Uri.joinPath(this._extensionUri, 'assets', 'window-multilines-elevator.png'));
        const window_multilines_zerosuit_Uri = webview.asWebviewUri(vscode.Uri.joinPath(this._extensionUri, 'assets', 'window-multilines-zerosuit.png'));
        const window_twolines_Uri = webview.asWebviewUri(vscode.Uri.joinPath(this._extensionUri, 'assets', 'window-twolines.png'));

        // Use a nonce to only allow a specific script to be run.
        const nonce = getNonce();

        return `<!DOCTYPE html>
            <html lang="en">
            <head>
                <meta charset="UTF-8">
                
                <!--
                    Use a content security policy to only allow loading images from https or from our extension directory,
                    and only allow scripts that have a specific nonce.
                -->
                <meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src ${webview.cspSource}; script-src 'nonce-${nonce}'; img-src ${webview.cspSource};">
                
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                
                <link href="${styleResetUri}" rel="stylesheet">
                <link href="${styleVSCodeUri}" rel="stylesheet">
                <link href="${styleCustomUri}" rel="stylesheet">
                
                <title>Dialog Previewer</title>
            </head>
            <body>
                <div id="root"></div>
                <script nonce="${nonce}">
                    window.fontSpriteUri_mzm_vanilla = "${fontSpriteUri_mzm_vanilla}";
                    window.fontSpriteUri_mzm_projectzm = "${fontSpriteUri_mzm_projectzm}";
                    window.fontSpriteUri_mf_vanilla = "${fontSpriteUri_mf_vanilla}";
                    window.fontSpriteUri_mf_mzmlike = "${fontSpriteUri_mf_mzmlike}";
                    window.window_mfdialog_Uri = "${window_mfdialog_Uri}";
                    window.window_multilines_black_Uri = "${window_multilines_black_Uri}";
                    window.window_multilines_elevator_Uri = "${window_multilines_elevator_Uri}";
                    window.window_multilines_zerosuit_Uri = "${window_multilines_zerosuit_Uri}";
                    window.window_twolines_Uri = "${window_twolines_Uri}";
                </script>
                <script nonce="${nonce}" src="${scriptUri}"></script>
            </body>
            </html>`;
    }
}

function getNonce() {
    let text = '';
    const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    for (let i = 0; i < 32; i++) {
        text += possible.charAt(Math.floor(Math.random() * possible.length));
    }
    return text;
}