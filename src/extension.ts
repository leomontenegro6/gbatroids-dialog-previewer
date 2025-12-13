// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import { SidebarProvider } from './sidebarProvider';

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {

	// Use the console to output diagnostic information (console.log) and errors (console.error)
	// This line of code will only be executed once when your extension is activated
	console.log('GBA Metroids Dialog Previewer extension is now active!');

	// Create and register the sidebar provider
	const provider = new SidebarProvider(context.extensionUri, context);
	
	const disposableWebview = vscode.window.registerWebviewViewProvider(
		SidebarProvider.viewType, 
		provider
	);

	// Register refresh command
	const disposableRefresh = vscode.commands.registerCommand('dialogPreviewer.refresh', () => {
		// This will be handled by the webview provider
		vscode.window.showInformationMessage('Dialog Previewer refreshed!');
	});

	context.subscriptions.push(disposableWebview, disposableRefresh);
}

// This method is called when your extension is deactivated
export function deactivate() {}
