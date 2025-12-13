const esbuild = require("esbuild");

const production = process.argv.includes('--production');
const watch = process.argv.includes('--watch');

/**
 * @type {import('esbuild').Plugin}
 */
const esbuildProblemMatcherPlugin = {
	name: 'esbuild-problem-matcher',

	setup(build) {
		build.onStart(() => {
			console.log('[watch] build started');
		});
		build.onEnd((result) => {
			result.errors.forEach(({ text, location }) => {
				console.error(`✘ [ERROR] ${text}`);
				console.error(`    ${location.file}:${location.line}:${location.column}:`);
			});
			console.log('[watch] build finished');
		});
	},
};

async function main() {
	// Build extension
	const extensionCtx = await esbuild.context({
		entryPoints: [
			'src/extension.ts'
		],
		bundle: true,
		format: 'cjs',
		minify: production,
		sourcemap: !production,
		sourcesContent: false,
		platform: 'node',
		outfile: 'dist/extension.js',
		external: ['vscode'],
		logLevel: 'silent',
		plugins: [
			esbuildProblemMatcherPlugin,
		],
	});

	// Build webview
	const webviewCtx = await esbuild.context({
		entryPoints: [
			'webview/index.tsx'
		],
		bundle: true,
		format: 'iife',
		minify: production,
		sourcemap: !production,
		sourcesContent: false,
		platform: 'browser',
		outfile: 'dist/webview.js',
		logLevel: 'silent',
		plugins: [
			esbuildProblemMatcherPlugin,
		],
		jsx: 'automatic',
		jsxDev: !production,
	});

	// Copy CSS file and setup watcher
	const fs = require('fs');
	const path = require('path');
	
	// Ensure dist directory exists
	if (!fs.existsSync('dist')) {
		fs.mkdirSync('dist');
	}
	
	// Function to copy CSS
	const copyCss = () => {
		fs.copyFileSync('webview/styles.css', 'dist/styles.css');
		console.log('[css] copied styles.css');
	};
	
	// Initial CSS copy
	copyCss();

	if (watch) {
		// Setup CSS file watcher
		fs.watchFile('webview/styles.css', (curr, prev) => {
			if (curr.mtime !== prev.mtime) {
				copyCss();
			}
		});
		
		await Promise.all([
			extensionCtx.watch(),
			webviewCtx.watch()
		]);
	} else {
		await Promise.all([
			extensionCtx.rebuild(),
			webviewCtx.rebuild()
		]);
		await extensionCtx.dispose();
		await webviewCtx.dispose();
	}
}

main().catch(e => {
	console.error(e);
	process.exit(1);
});
