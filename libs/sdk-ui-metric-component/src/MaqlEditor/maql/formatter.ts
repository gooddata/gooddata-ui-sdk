// (C) 2022-2026 GoodData Corporation

import * as monaco from "monaco-editor/editor/editor.api.js";
import { type TextDocument } from "vscode-languageserver-textdocument";

import { type MaqlLanguageService } from "@gooddata/sdk-maql-language-server";

//more info in README.md
import { type FormattingOptions, type Range } from "../monaco/MonacoEditor.js";

import { MonacoToProtocolConverter, ProtocolToMonacoConverter } from "./monacoConverter.js";

export function formatDocument(
    languageService: MaqlLanguageService,
    document: TextDocument,
    options: FormattingOptions,
    range?: Range,
): Promise<monaco.languages.TextEdit[]> {
    const m2p = new MonacoToProtocolConverter(monaco);
    const p2m = new ProtocolToMonacoConverter(monaco);

    const formattingOptions = m2p.asFormattingOptions(options);

    if (range) {
        return languageService
            .doFormatRange(document, m2p.asRange(range), formattingOptions)
            .then((edits) => p2m.asTextEdits(edits));
    }

    return languageService.doFormat(document, formattingOptions).then((edits) => p2m.asTextEdits(edits));
}
