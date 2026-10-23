// (C) 2021-2026 GoodData Corporation

import { type Connection, TextDocuments } from "vscode-languageserver";
import { TextDocument } from "vscode-languageserver-textdocument";

import { MaqlLanguageService } from "./maqlLanguageService.js";
import { type IMetadataInterface } from "./metadata/types.js";

export function startServer(connection: Connection, metadataService?: IMetadataInterface) {
    const languageService = new MaqlLanguageService("en-us", metadataService);
    const documents: TextDocuments<TextDocument> = new TextDocuments(TextDocument);

    documents.listen(connection);

    connection.onInitialize((params) => {
        connection.tracer.log("initialize");
        if (params.locale) {
            languageService.locale = params.locale;
        }
        return languageService.initialize();
    });

    connection.onInitialized(() => {});

    documents.onDidOpen(() => {});

    documents.onDidClose(() => {});

    documents.onDidChangeContent((params) => {
        languageService
            .doValidation(params.document)
            .then((diagnostics) => {
                connection.tracer.log(`validateTextDocument uri=${params.document.uri}`);
                void connection.sendDiagnostics({
                    uri: params.document.uri,
                    diagnostics: diagnostics,
                });
            })
            .catch((reason) => {
                connection.console.error(`FAILED validateTextDocument uri=${params.document.uri} ${reason}`);
                // clear diagnostics, because no diagnostics is better than false diagnostics
                void connection.sendDiagnostics({
                    uri: params.document.uri,
                    diagnostics: [],
                });
            });
    });

    documents.onDidSave(() => {});

    connection.onCompletion((params) => {
        const document = documents.get(params.textDocument.uri);
        if (!document) {
            return null;
        }
        return languageService.doCompletion(document, params.position);
    });

    connection.onCompletionResolve((item) => languageService.doCompletionResolve(item));

    connection.languages.semanticTokens.on(async (params) => {
        const document = documents.get(params.textDocument.uri);
        if (!document) {
            return {
                data: [] as number[],
            };
        }
        return await languageService.doSemanticTokens(document);
    });

    connection.onHover((params) => {
        const document = documents.get(params.textDocument.uri);
        if (!document) {
            return null;
        }
        return languageService.doHover(document, params.position);
    });

    connection.onDocumentFormatting((params) => {
        const document = documents.get(params.textDocument.uri);
        if (!document) {
            return null;
        }
        return languageService.doFormat(document, params.options);
    });

    connection.onDocumentRangeFormatting((params) => {
        const document = documents.get(params.textDocument.uri);
        if (!document) {
            return null;
        }
        return languageService.doFormatRange(document, params.range, params.options);
    });

    connection.listen();
}
