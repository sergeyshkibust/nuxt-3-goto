'use strict';

import {
    HoverProvider as vsHoverProvider,
    TextDocument,
    Position,
    ProviderResult,
    Hover,
    workspace,
    MarkdownString,
    Uri
} from "vscode";

import { existsSync, readFileSync } from "fs";

export default class HoverProvider implements vsHoverProvider {
    provideHover(doc: TextDocument, pos: Position): ProviderResult<Hover> {

        let linkRange = doc.getWordRangeAtPosition(pos);
        if (!linkRange) { return; }

        const workspaceFolder = workspace.getWorkspaceFolder(doc.uri);
        const componentsFilePath = '.nuxt/components.d.ts';
        const componentsFile = `${workspaceFolder?.uri.fsPath}/${componentsFilePath}`;
        if (existsSync(componentsFile)) {
            const componentsDeclaration = readFileSync(componentsFile, 'utf-8');
            const regex = new RegExp(`'${doc.getText(linkRange)}': typeof import\\("../(.*)"\\)\\['default'\\]`);
            const match = componentsDeclaration.match(regex);
            if (match && match[1]) {
                let text: string = "Nuxt 3 component: \n";
                text += ` [${match[1]}] \r`;
                return new Hover(new MarkdownString(text));
            }
        }

        return null;
    }
}