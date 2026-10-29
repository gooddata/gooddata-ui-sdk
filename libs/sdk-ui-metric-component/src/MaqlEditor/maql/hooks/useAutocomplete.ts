// (C) 2021-2026 GoodData Corporation

import { useEffect } from "react";

import * as monaco from "monaco-editor/editor/editor.api.js";
//more info in README.md
import { type CompletionList, type InitializeResult, TextEdit } from "vscode-languageserver";
import { type Command } from "vscode-languageserver-types";

import { type MaqlLanguageService } from "@gooddata/sdk-maql-language-server";

import { MonacoToProtocolConverter, ProtocolToMonacoConverter } from "../monacoConverter.js";
import { createDocument } from "../utils.js";

const triggerSuggestCommand: Command = {
    title: "trigger suggestion",
    command: "editor.action.triggerSuggest",
};

let completionRequestCounter = 0;

export function useAutocomplete(
    languageId: string,
    languageService: MaqlLanguageService | undefined,
    initializeData: InitializeResult | undefined,
    onList: (list: CompletionList) => void,
): void {
    useEffect(() => {
        if (!languageService || !initializeData) {
            return;
        }

        const m2p = new MonacoToProtocolConverter(monaco);
        const p2m = new ProtocolToMonacoConverter(monaco);

        const disposeCompletion = monaco.languages.registerCompletionItemProvider(languageId, {
            triggerCharacters: initializeData.capabilities.completionProvider?.triggerCharacters,
            provideCompletionItems: (model, position) => {
                const document = createDocument(model);
                const wordUntil = model.getWordUntilPosition(position);
                const defaultRange = new monaco.Range(
                    position.lineNumber,
                    wordUntil.startColumn,
                    position.lineNumber,
                    wordUntil.endColumn,
                );
                onList({ isIncomplete: false, items: [] });
                ++completionRequestCounter;
                return languageService
                    ?.doCompletion(document, m2p.asPosition(position.lineNumber, position.column))
                    .then((list: CompletionList) => {
                        const modifiedList: CompletionList = {
                            isIncomplete: list.isIncomplete,
                            items: list.items.map((item) => {
                                return {
                                    ...item,
                                    textEdit: TextEdit.is(item.textEdit) ? item.textEdit : undefined,
                                    command: triggerSuggestCommand,
                                };
                            }),
                        };
                        if (completionRequestCounter == 1) {
                            onList(modifiedList);
                        }
                        return p2m.asCompletionResult(modifiedList, defaultRange);
                    })
                    .finally(() => --completionRequestCounter);
            },
            resolveCompletionItem: (item) =>
                languageService.doCompletionResolve(m2p.asCompletionItem(item)).then((result) => {
                    const protocolItem = p2m.asCompletionItem(result, item.range);
                    return {
                        ...item,
                        ...protocolItem,
                    };
                }),
        });

        return () => {
            disposeCompletion.dispose();
        };
    }, [languageId, languageService, initializeData, onList]);
}
