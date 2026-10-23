// (C) 2021-2026 GoodData Corporation

import { type MutableRefObject, useCallback, useEffect, useRef } from "react";

import * as monaco from "monaco-editor/editor/editor.api.js";
import { ProtocolToMonacoConverter } from "monaco-languageclient/monaco-converter";
import { type TextDocument } from "vscode-languageserver-textdocument";

import { type IDecoration, type MaqlLanguageService } from "@gooddata/sdk-maql-language-server";

//more info in README.md
import { type IStandaloneCodeEditor } from "../../monaco/MonacoEditor.js";
import { Decorators } from "../../monaco/MonacoEditor.styles.js";
import { createDocument } from "../utils.js";

export function useDecoration(
    languageService: MaqlLanguageService | undefined,
    decorators: boolean,
): (editor: IStandaloneCodeEditor | null) => void {
    const decoratorsCollection = useRef<monaco.editor.IEditorDecorationsCollection | null>(null);
    const editorRef = useRef<IStandaloneCodeEditor | null>(null);

    // Apply decorations in an effect to ensure proper timing with React 18
    useEffect(() => {
        if (editorRef.current) {
            doDecorate(
                languageService,
                getDocument(editorRef.current),
                editorRef.current,
                decoratorsCollection,
                decorators,
            );
        }

        // Capture the current value of decoratorsCollection.current to use in cleanup
        const currentCollection = decoratorsCollection.current;

        // Cleanup function to clear decorations when component unmounts
        return () => {
            if (currentCollection) {
                currentCollection.clear();
            }
        };
    }, [languageService, decorators]);

    return useCallback(
        (editor) => {
            if (editor) {
                editorRef.current = editor;
                doDecorate(languageService, getDocument(editor), editor, decoratorsCollection, decorators);
            }
        },
        [decorators, languageService],
    );
}

function getDocument(editor: IStandaloneCodeEditor) {
    const model = editor?.getModel();

    return model ? createDocument(model) : null;
}

function doDecorate(
    languageService: MaqlLanguageService | undefined,
    document: TextDocument | null,
    editor: IStandaloneCodeEditor,
    decoratorsCollection: MutableRefObject<monaco.editor.IEditorDecorationsCollection | null>,
    state: boolean,
): void {
    const p2m = new ProtocolToMonacoConverter(monaco);

    if (!languageService || !document) {
        return;
    }

    if (!decoratorsCollection.current) {
        decoratorsCollection.current = editor.createDecorationsCollection([]);
    }

    //decorators are turned off
    if (!state) {
        decoratorsCollection.current.clear();
        return;
    }

    //decorators are turned on
    languageService.doDecoration(document).then((lspDecorations: IDecoration[]) => {
        // Check if the collection still exists before setting decorations
        if (decoratorsCollection.current) {
            decoratorsCollection.current.set(asDecorations(p2m, lspDecorations));
        }
    });
}

function asDecorations(
    p2m: ProtocolToMonacoConverter,
    decorations: IDecoration[],
): monaco.editor.IModelDeltaDecoration[] {
    return decorations.map((decoration) => {
        const def = Decorators[decoration.options.type] || Decorators["default"];

        return {
            range: p2m.asRange(decoration.range),
            options: {
                hoverMessage: decoration.options.hoverMessage,
                inlineClassName: def.decoratorItem.join(" "),
                before: {
                    inlineClassName: def.decorator.join(" "),
                    inlineClassNameAffectsLetterSpacing: true,
                    //NOTE: Keep space before and after to simulate padding
                    content: ` ${decoration.options.label} `,
                },
            },
        };
    });
}
