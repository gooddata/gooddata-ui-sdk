// (C) 2021-2026 GoodData Corporation

import { useMemo } from "react";

import * as monaco from "monaco-editor/editor/editor.api.js";
import { type Diagnostic } from "vscode-languageserver";
import { type TextDocument } from "vscode-languageserver-textdocument";

import { type MaqlLanguageService } from "@gooddata/sdk-maql-language-server";

//more info in README.md
import { type IMarkerData, type IStandaloneCodeEditor, type Monaco } from "../../monaco/MonacoEditor.js";
import { ProtocolToMonacoConverter } from "../monacoConverter.js";
import { createDocument } from "../utils.js";

// pending validations are stored here, so we don't run multiple validations on same document
const pendingValidationRequests = new Map<string, number>();

export function useValidation(
    languageService: MaqlLanguageService | undefined,
): (editor: IStandaloneCodeEditor, monaco: Monaco) => void {
    return useMemo(() => {
        const p2m = new ProtocolToMonacoConverter(monaco);

        // validate function should be called with some debounce
        function validate(editor: IStandaloneCodeEditor, monaco: Monaco): void {
            const model = editor?.getModel();
            if (model) {
                const document = createDocument(model);
                cleanPendingValidation(document);
                pendingValidationRequests.set(
                    document.uri,
                    window.setTimeout(() => {
                        // validations are stored as timeouts, so we can cancel the promise easily
                        doValidate(document, editor, monaco);
                        pendingValidationRequests.delete(document.uri);
                    }),
                );
            }
        }

        function cleanPendingValidation(document: TextDocument): void {
            const request = pendingValidationRequests.get(document.uri);
            if (request !== undefined) {
                clearTimeout(request);
                pendingValidationRequests.delete(document.uri);
            }
        }

        function doValidate(document: TextDocument, editor: IStandaloneCodeEditor, monaco: Monaco): void {
            if (document.getText().length === 0) {
                setModelMarkers([], editor, monaco);
                return;
            }

            if (languageService) {
                languageService
                    .doValidation(document)
                    .then((diagnostics: Diagnostic[]) => {
                        const markers = p2m.asDiagnostics(diagnostics);
                        setModelMarkers(markers, editor, monaco);
                    })
                    .catch((_reason) => {
                        setModelMarkers([], editor, monaco); // validation failed - clear previous diagnostics
                    });
            }
        }

        function setModelMarkers(
            markers: IMarkerData[],
            editor: IStandaloneCodeEditor,
            monaco: Monaco,
        ): void {
            const model = editor?.getModel();
            if (model) {
                monaco?.editor.setModelMarkers(model, "default", markers);
            }
        }

        return validate;
    }, [languageService]);
}
