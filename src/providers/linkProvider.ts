'use strict';

import {
    DocumentLinkProvider as vsDocumentLinkProvider,
    TextDocument,
    ProviderResult,
    DocumentLink,
    workspace,
    Position,
    Range,
    Uri,
    TextLine
} from "vscode";

import { readFileSync } from "fs";

export default class LinkProvider implements vsDocumentLinkProvider {
    public provideDocumentLinks(doc: TextDocument): ProviderResult<DocumentLink[]> {
        let documentLinks: Array<DocumentLink> = [];
        let config = { quickJump: true, maxLinesCount: 666 };

        if (config.quickJump) {
            let exception = 'a|abbr|acronym|address|applet|area|article|aside|audio|b|base|basefont|bdi|bdo|bgsound|big|blink|blockquote|body|br|button|canvas|caption|center|cite|code|col|colgroup|command|content|data|datalist|dd|del|details|dfn|dialog|dir|div|dl|dt|element|em|embed|fieldset|figcaption|figure|font|footer|form|frame|frameset|h1|h2|h3|h4|h5|h6|head|header|hgroup|hr|html|i|iframe|image|img|input|ins|isindex|kbd|keygen|label|legend|li|link|listing|main|map|mark|marquee|menu|menuitem|meta|meter|multicol|nav|nobr|noembed|noframes|noscript|object|ol|optgroup|option|output|p|param|plaintext|pre|progress|q|rp|rt|rtc|ruby|s|samp|script|section|select|shadow|slot|small|source|spacer|span|strike|strong|style|sub|summary|sup|table|tbody|td|template|textarea|tfoot|th|thead|time|title|tr|track|tt|u|ul|var|video|wbr|xmp';
            let reg = new RegExp(`<((?!\/?(${exception})).+?)(\\s+[^>]*?)?\/?>`, 'g');
            let linesCount = doc.lineCount <= config.maxLinesCount ? doc.lineCount : config.maxLinesCount;
            let index = 0;
            const workspaceFolder = workspace.getWorkspaceFolder(doc.uri);
            const componentsFilePath = '.nuxt/components.d.ts';
            const componentsFile = `${workspaceFolder?.uri.fsPath}/${componentsFilePath}`;

            let tags: Array<{ tag: string, line: TextLine }> = [];

            while (index < linesCount) {
                let line = doc.lineAt(index);
                let match;
                while ((match = reg.exec(line.text)) !== null) {
                    let tagName = match[1];
                    if (!tagName.startsWith('/')) {
                        tags.push({ tag: tagName, line: line });
                    }
                }
                index++;
            }

            if (tags.length) {
                tags.forEach(item => {
                    const componentsDeclaration = readFileSync(componentsFile, 'utf-8');
                    const regex = new RegExp(`'${item.tag}': typeof import\\("../(.*)"\\)\\['default'\\]`);
                    const match = componentsDeclaration.match(regex);
                    if (match && match[1]) {
                        let start = new Position(item.line.lineNumber, item.line.text.indexOf(item.tag));
                        let end = start.translate(0, item.tag.length);
                        let documentlink = new DocumentLink(new Range(start, end), Uri.file(`${workspaceFolder?.uri.fsPath}/${match[1]}`));
                        documentLinks.push(documentlink);
                    };
                });
            }
        }

        return documentLinks;
    }
}