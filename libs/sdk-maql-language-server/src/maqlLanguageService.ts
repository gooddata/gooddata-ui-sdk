// (C) 2021-2026 GoodData Corporation

import {
    type CompletionItem,
    type CompletionList,
    type Diagnostic,
    type FormattingOptions,
    type InitializeResult,
    type SemanticTokens,
    TextDocumentSyncKind,
    type TextEdit,
} from "vscode-languageserver";
import { type Position, type Range, type TextDocument } from "vscode-languageserver-textdocument";

import { complete, resolve } from "./completions/complete.js";
import { type IDecoration, decorate } from "./decorations.js";
import { validate } from "./diagnostics.js";
import { type Locale, docsIndex, locales } from "./docs/index.js";
import { format, formatRange } from "./format.js";
import { convertToSemanticTokens } from "./highlight/convert.js";
import { type HighlightToken, semanticTokensLegend, semanticsFull } from "./highlight/semanticsHighlight.js";
import { type HoverWithData, hover } from "./hover.js";
import { type LabelElementsFunc, type LdmObjects } from "./metadata/model.js";
import { type IMetadataInterface } from "./metadata/types.js";

export interface ILanguageService {
    initialize(): InitializeResult;

    doValidation(textDocument: TextDocument): Promise<Diagnostic[]>;

    doCompletion(textDocument: TextDocument, position: Position): Promise<CompletionList>;

    doCompletionResolve(item: CompletionItem): Promise<CompletionItem>;

    doHighlightTokens(textDocument: TextDocument): Promise<HighlightToken[]>;

    doSemanticTokens(textDocument: TextDocument): Promise<SemanticTokens>;

    doDecoration(textDocument: TextDocument): Promise<IDecoration[]>;

    doFormat(textDocument: TextDocument, options: FormattingOptions): Promise<TextEdit[]>;

    doFormatRange(textDocument: TextDocument, range: Range, options: FormattingOptions): Promise<TextEdit[]>;
}

/**
 * MAQL Language Service class
 * A service to manage the capabilities of the MAQL language server
 * Can be supplied by Metadata API credentials to automatically
 * retrieve typed ldmObjects from the Logical Data Model (LDM)
 */
export class MaqlLanguageService implements ILanguageService {
    constructor(locale: Locale = "en-us", metadataService?: IMetadataInterface) {
        this._locale = locale;
        this.metadataService = metadataService;
        this.setMetadataServiceMethods();
    }

    private _locale: Locale;
    get locale(): Locale {
        return this._locale;
    }

    set locale(locale: string) {
        const lowercaseLocale = locale.toLowerCase();
        if (this.isValidLocale(lowercaseLocale)) {
            this._locale = lowercaseLocale;
        }
    }

    private metadataService?: IMetadataInterface;
    private ldmObjects: Promise<LdmObjects | void> = Promise.resolve();
    private labelElementsFunc?: Promise<LabelElementsFunc | void>;
    private docs = docsIndex;

    private isValidLocale(locale: string): locale is Locale {
        return locales.includes(locale as Locale);
    }

    private setMetadataServiceMethods() {
        if (this.metadataService) {
            this.ldmObjects = this.metadataService
                .getLdmObjects()
                .catch((reason) => this.handleMetadataServiceError(reason));
            this.labelElementsFunc = this.metadataService
                .getLabelElementsFunction()
                .catch((reason) => this.handleMetadataServiceError(reason));
        }
    }

    /**
     * A method to get information about the capabilities of the service
     */
    initialize(): InitializeResult {
        return {
            capabilities: {
                textDocumentSync: TextDocumentSyncKind.Full,
                completionProvider: {
                    resolveProvider: true,
                    triggerCharacters: [" ", "(", "/", "{"],
                },
                semanticTokensProvider: {
                    legend: semanticTokensLegend,
                    full: true,
                    range: false,
                },
                hoverProvider: true,
                documentFormattingProvider: true,
                documentRangeFormattingProvider: true,
            },
        };
    }

    async doCompletion(textDocument: TextDocument, position: Position): Promise<CompletionList> {
        return complete(
            textDocument.getText(),
            textDocument.offsetAt(position),
            (await this.ldmObjects) || undefined,
            (await this.labelElementsFunc) || undefined,
        );
    }

    async doCompletionResolve(item: CompletionItem): Promise<CompletionItem> {
        return resolve(item, (resolveTag: string) =>
            Promise.resolve(
                (this.docs as unknown as Record<string, Record<string, string | undefined>>)[this._locale][
                    resolveTag
                ],
            ),
        );
    }

    doHighlightTokens(textDocument: TextDocument): Promise<HighlightToken[]> {
        return Promise.resolve(semanticsFull(textDocument.getText()));
    }

    async doSemanticTokens(textDocument: TextDocument): Promise<SemanticTokens> {
        return convertToSemanticTokens(await this.doHighlightTokens(textDocument));
    }

    async doValidation(textDocument: TextDocument): Promise<Diagnostic[]> {
        return validate(
            textDocument.getText(),
            (await this.ldmObjects) || undefined,
            (await this.labelElementsFunc) || undefined,
        );
    }

    async doDecoration(textDocument: TextDocument): Promise<IDecoration[]> {
        return decorate(textDocument.getText(), (await this.ldmObjects) || undefined);
    }

    async doHover(textDocument: TextDocument, position: Position): Promise<HoverWithData | null> {
        return hover(textDocument.getText(), position, (await this.ldmObjects) || undefined);
    }

    doFormat(textDocument: TextDocument, options: FormattingOptions): Promise<TextEdit[]> {
        return Promise.resolve(format(textDocument.getText(), options));
    }

    doFormatRange(textDocument: TextDocument, range: Range, options: FormattingOptions): Promise<TextEdit[]> {
        return Promise.resolve(formatRange(textDocument.getText(), range, options));
    }

    private handleMetadataServiceError(_reason: any) {
        // TODO: log failures (dependent on environment - web/node)
    }
}
