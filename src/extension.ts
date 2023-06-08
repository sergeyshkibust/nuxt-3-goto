import { languages, ExtensionContext } from 'vscode';
import LinkProvider from './providers/linkProvider.js';
import HoverProvider from './providers/hoverProvider.js';

export function activate(context: ExtensionContext) {

	const hover = languages.registerHoverProvider('vue', new HoverProvider());
	let link = languages.registerDocumentLinkProvider(['vue'], new LinkProvider());

	context.subscriptions.push(hover, link);

}