// (C) 2026 GoodData Corporation

// Adapted from monaco-languageclient 2.1.0 (lib/monaco-converter), Copyright (c) 2018-2022 TypeFox GmbH,
// MIT License. Only the conversions the MAQL editor uses are kept, and the protocol types come from
// vscode-languageserver-types: monaco-languageclient 2.x imports vscode-languageserver-protocol without
// declaring it, so consumers with a newer copy hoisted hit its exports map and their builds fail.

import type * as monaco from "monaco-editor/editor/editor.api.js";
import {
    Command,
    type CompletionItem,
    CompletionItemKind,
    CompletionItemLabelDetails,
    type CompletionList,
    type Diagnostic,
    type DiagnosticRelatedInformation,
    type DiagnosticSeverity,
    type FormattingOptions,
    type Hover,
    InsertReplaceEdit,
    InsertTextFormat,
    type InsertTextMode,
    type MarkedString,
    MarkupContent,
    MarkupKind,
    type Position,
    Range,
    type TextEdit,
} from "vscode-languageserver-types";

type RecursivePartial<T> = {
    [P in keyof T]?: RecursivePartial<T[P]>;
};

/**
 * A Monaco completion item that remembers the protocol details the server sent, so the resolve
 * round trip can hand them back.
 */
export interface IProtocolCompletionItem extends monaco.languages.CompletionItem {
    data?: unknown;
    fromEdit?: boolean;
    documentationFormat?: string;
    originalItemKind?: CompletionItemKind;
    deprecated?: boolean;
    insertTextMode?: InsertTextMode;
}

function isProtocolCompletionItem(item: unknown): item is IProtocolCompletionItem {
    return typeof item === "object" && item !== null && "data" in item;
}

type RangeReplace = { insert: monaco.IRange; replace: monaco.IRange };

function isRangeReplace(value: Partial<monaco.IRange> | RangeReplace): value is RangeReplace {
    return (value as RangeReplace).insert !== undefined;
}

function isString(value: unknown): value is string {
    return typeof value === "string" || value instanceof String;
}

function isNumber(value: unknown): value is number {
    return typeof value === "number" || value instanceof Number;
}

function isStringArray(value: unknown): value is string[] {
    return Array.isArray(value) && value.every(isString);
}

/**
 * Converts Monaco editor structures to the language server protocol ones.
 */
export class MonacoToProtocolConverter {
    public constructor(protected readonly _monaco: typeof monaco) {}

    asPosition(lineNumber: number, column: number): Position;
    asPosition(lineNumber: number | undefined | null, column: number | undefined | null): Partial<Position>;
    asPosition(lineNumber: number | undefined | null, column: number | undefined | null): Partial<Position> {
        const line = lineNumber === undefined || lineNumber === null ? undefined : lineNumber - 1;
        const character = column === undefined || column === null ? undefined : column - 1;
        return { line, character };
    }

    asRange(range: monaco.IRange | RangeReplace): Range;
    asRange(
        range: Partial<monaco.IRange> | RangeReplace | undefined | null,
    ): RecursivePartial<Range> | undefined | null;
    asRange(
        range: Partial<monaco.IRange> | RangeReplace | undefined | null,
    ): RecursivePartial<Range> | undefined | null {
        if (range === undefined) {
            return undefined;
        }
        if (range === null) {
            return null;
        }
        if (isRangeReplace(range)) {
            return this.asRange(range.insert);
        }
        const start = this.asPosition(range.startLineNumber, range.startColumn);
        const end = this.asPosition(range.endLineNumber, range.endColumn);
        return { start, end };
    }

    asCompletionItem(item: monaco.languages.CompletionItem): CompletionItem {
        const result: CompletionItem = { label: item.label as string };
        const protocolItem = isProtocolCompletionItem(item) ? item : undefined;
        if (item.detail) {
            result.detail = item.detail;
        }
        if (item.documentation) {
            if (typeof item.documentation === "string") {
                result.documentation = item.documentation;
            } else {
                result.documentation = this.asDocumentation(
                    protocolItem?.documentationFormat ?? MarkupKind.Markdown,
                    item.documentation,
                );
            }
        }
        if (item.filterText) {
            result.filterText = item.filterText;
        }
        this.fillPrimaryInsertText(result, item as IProtocolCompletionItem);
        if (isNumber(item.kind)) {
            result.kind = this.asCompletionItemKind(item.kind, protocolItem?.originalItemKind);
        }
        if (item.sortText) {
            result.sortText = item.sortText;
        }
        if (item.additionalTextEdits) {
            result.additionalTextEdits = this.asTextEdits(item.additionalTextEdits);
        }
        if (item.commitCharacters) {
            result.commitCharacters = item.commitCharacters.slice();
        }
        if (item.command) {
            result.command = this.asCommand(item.command);
        }
        if (item.preselect === true || item.preselect === false) {
            result.preselect = item.preselect;
        }
        if (protocolItem) {
            if (protocolItem.data !== undefined) {
                result.data = protocolItem.data;
            }
            if (protocolItem.deprecated === true || protocolItem.deprecated === false) {
                result.deprecated = protocolItem.deprecated;
            }
        }
        if (item.tags) {
            result.tags = item.tags.slice();
        }
        return result;
    }

    asFormattingOptions(options: monaco.languages.FormattingOptions): FormattingOptions {
        return { tabSize: options.tabSize, insertSpaces: options.insertSpaces };
    }

    asTextEdit(edit: monaco.editor.ISingleEditOperation): TextEdit {
        return {
            range: this.asRange(edit.range),
            newText: edit.text || "",
        };
    }

    asTextEdits(items: monaco.editor.ISingleEditOperation[] | undefined | null): TextEdit[] | undefined {
        if (!items) {
            return undefined;
        }
        return items.map((item) => this.asTextEdit(item));
    }

    asCommand(item: monaco.languages.Command | undefined | null): Command | undefined {
        if (item) {
            const args = item.arguments || [];
            return Command.create(item.title, item.id, ...args);
        }
        return undefined;
    }

    protected asCompletionItemKind(
        value: monaco.languages.CompletionItemKind,
        original: CompletionItemKind | undefined,
    ): CompletionItemKind {
        if (original !== undefined) {
            return original;
        }
        const kinds = this._monaco.languages.CompletionItemKind;
        switch (value) {
            case kinds.Method:
                return CompletionItemKind.Method;
            case kinds.Function:
                return CompletionItemKind.Function;
            case kinds.Constructor:
                return CompletionItemKind.Constructor;
            case kinds.Field:
                return CompletionItemKind.Field;
            case kinds.Variable:
                return CompletionItemKind.Variable;
            case kinds.Class:
                return CompletionItemKind.Class;
            case kinds.Struct:
                return CompletionItemKind.Struct;
            case kinds.Interface:
                return CompletionItemKind.Interface;
            case kinds.Module:
                return CompletionItemKind.Module;
            case kinds.Property:
                return CompletionItemKind.Property;
            case kinds.Event:
                return CompletionItemKind.Event;
            case kinds.Operator:
                return CompletionItemKind.Operator;
            case kinds.Unit:
                return CompletionItemKind.Unit;
            case kinds.Value:
                return CompletionItemKind.Value;
            case kinds.Constant:
                return CompletionItemKind.Constant;
            case kinds.Enum:
                return CompletionItemKind.Enum;
            case kinds.EnumMember:
                return CompletionItemKind.EnumMember;
            case kinds.Keyword:
                return CompletionItemKind.Keyword;
            case kinds.Text:
                return CompletionItemKind.Text;
            case kinds.Color:
                return CompletionItemKind.Color;
            case kinds.File:
                return CompletionItemKind.File;
            case kinds.Reference:
                return CompletionItemKind.Reference;
            case kinds.Customcolor:
                return CompletionItemKind.Color;
            case kinds.Folder:
                return CompletionItemKind.Folder;
            case kinds.TypeParameter:
                return CompletionItemKind.TypeParameter;
            case kinds.Snippet:
                return CompletionItemKind.Snippet;
            default:
                return (value + 1) as CompletionItemKind;
        }
    }

    protected asDocumentation(
        format: string,
        documentation: string | monaco.IMarkdownString,
    ): string | MarkupContent {
        switch (format) {
            case MarkupKind.PlainText:
                return { kind: format, value: documentation as string };
            case MarkupKind.Markdown:
                return { kind: format, value: (documentation as monaco.IMarkdownString).value };
            default:
                return `Unsupported Markup content received. Kind is: ${format}`;
        }
    }

    protected fillPrimaryInsertText(target: CompletionItem, source: IProtocolCompletionItem): void {
        // insertTextRules is a bit set; the snippet flag is tested with a bitmask, as upstream does.
        const snippetRule = this._monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet;
        const hasSnippetRule =
            source.insertTextRules !== undefined && (source.insertTextRules & snippetRule) !== 0;
        const format: InsertTextFormat =
            source.insertTextRules !== undefined && !hasSnippetRule
                ? InsertTextFormat.Snippet
                : InsertTextFormat.PlainText;
        target.insertTextFormat = format;

        const text = source.insertText;
        const range = source.range ? this.asRange(source.range) : undefined;
        if (source.fromEdit && text && range) {
            target.textEdit = { newText: text, range };
        } else {
            target.insertText = text;
        }
        target.insertTextMode = source.insertTextMode;
    }
}

/**
 * Converts language server protocol structures to the Monaco editor ones.
 */
export class ProtocolToMonacoConverter {
    public constructor(protected readonly _monaco: typeof monaco) {}

    asTextEdit(edit: TextEdit): monaco.languages.TextEdit {
        return {
            range: this.asRange(edit.range),
            text: edit.newText,
        };
    }

    asTextEdits(items: TextEdit[]): monaco.languages.TextEdit[];
    asTextEdits(items: TextEdit[] | undefined | null): monaco.languages.TextEdit[] | undefined;
    asTextEdits(items: TextEdit[] | undefined | null): monaco.languages.TextEdit[] | undefined {
        if (!items) {
            return undefined;
        }
        return items.map((item) => this.asTextEdit(item));
    }

    asCommand(command: Command | undefined): monaco.languages.Command | undefined {
        if (!command) {
            return undefined;
        }
        return {
            id: command.command,
            title: command.title,
            arguments: command.arguments,
        };
    }

    asHover(hover: Hover | undefined | null): monaco.languages.Hover | undefined {
        if (!hover) {
            return undefined;
        }
        return {
            contents: this.asHoverContent(hover.contents),
            range: this.asRange(hover.range),
        };
    }

    asHoverContent(contents: MarkedString | MarkedString[] | MarkupContent): monaco.IMarkdownString[] {
        if (Array.isArray(contents)) {
            return contents.map((content) => this.asMarkdownString(content));
        }
        return [this.asMarkdownString(contents)];
    }

    asDocumentation(value: string | MarkupContent): string | monaco.IMarkdownString {
        if (isString(value)) {
            return value;
        }
        if (value.kind === MarkupKind.PlainText) {
            return value.value;
        }
        return this.asMarkdownString(value);
    }

    asMarkdownString(content: MarkedString | MarkupContent): monaco.IMarkdownString {
        if (MarkupContent.is(content)) {
            return { value: content.value };
        }
        if (isString(content)) {
            return { value: content };
        }
        const { language, value } = content;
        return { value: "```" + language + "\n" + value + "\n```" };
    }

    asSeverity(severity?: DiagnosticSeverity): monaco.MarkerSeverity {
        if (severity === 1) {
            return this._monaco.MarkerSeverity.Error;
        }
        if (severity === 2) {
            return this._monaco.MarkerSeverity.Warning;
        }
        if (severity === 3) {
            return this._monaco.MarkerSeverity.Info;
        }
        return this._monaco.MarkerSeverity.Hint;
    }

    asDiagnostics(diagnostics: Diagnostic[]): monaco.editor.IMarkerData[];
    asDiagnostics(diagnostics: Diagnostic[] | undefined): monaco.editor.IMarkerData[] | undefined;
    asDiagnostics(diagnostics: Diagnostic[] | undefined): monaco.editor.IMarkerData[] | undefined {
        if (!diagnostics) {
            return undefined;
        }
        return diagnostics.map((diagnostic) => this.asDiagnostic(diagnostic));
    }

    asDiagnostic(diagnostic: Diagnostic): monaco.editor.IMarkerData {
        return {
            code: typeof diagnostic.code === "number" ? diagnostic.code.toString() : diagnostic.code,
            severity: this.asSeverity(diagnostic.severity),
            message: diagnostic.message,
            source: diagnostic.source,
            startLineNumber: diagnostic.range.start.line + 1,
            startColumn: diagnostic.range.start.character + 1,
            endLineNumber: diagnostic.range.end.line + 1,
            endColumn: diagnostic.range.end.character + 1,
            relatedInformation: this.asRelatedInformations(diagnostic.relatedInformation),
            tags: diagnostic.tags,
        };
    }

    asRelatedInformations(
        relatedInformation?: DiagnosticRelatedInformation[],
    ): monaco.editor.IRelatedInformation[] | undefined {
        if (!relatedInformation) {
            return undefined;
        }
        return relatedInformation.map((item) => this.asRelatedInformation(item));
    }

    asRelatedInformation(
        relatedInformation: DiagnosticRelatedInformation,
    ): monaco.editor.IRelatedInformation {
        return {
            resource: this._monaco.Uri.parse(relatedInformation.location.uri),
            startLineNumber: relatedInformation.location.range.start.line + 1,
            startColumn: relatedInformation.location.range.start.character + 1,
            endLineNumber: relatedInformation.location.range.end.line + 1,
            endColumn: relatedInformation.location.range.end.character + 1,
            message: relatedInformation.message,
        };
    }

    asCompletionResult(
        result: CompletionItem[] | CompletionList | null | undefined,
        defaultMonacoRange: monaco.IRange,
    ): monaco.languages.CompletionList {
        if (!result) {
            return { incomplete: false, suggestions: [] };
        }
        if (Array.isArray(result)) {
            return {
                incomplete: false,
                suggestions: result.map((item) => this.asCompletionItem(item, defaultMonacoRange)),
            };
        }
        const defaultRange = this.getCompletionItemDefaultRange(result);
        return {
            incomplete: result.isIncomplete,
            suggestions: result.items.map((item) =>
                this.asCompletionItem(item, defaultMonacoRange, defaultRange, result.itemDefaults),
            ),
        };
    }

    asCompletionItem(
        item: CompletionItem,
        defaultMonacoRange: monaco.IRange | RangeReplace,
        defaultRange?: monaco.IRange | RangeReplace,
        itemDefaults?: CompletionList["itemDefaults"],
    ): IProtocolCompletionItem {
        const result = { label: this.asCompletionItemLabel(item) } as IProtocolCompletionItem;
        if (item.detail) {
            result.detail = item.detail;
        }
        if (item.documentation) {
            result.documentation = this.asDocumentation(item.documentation);
            result.documentationFormat = isString(item.documentation) ? undefined : item.documentation.kind;
        }
        if (item.filterText) {
            result.filterText = item.filterText;
        }
        const insertText = this.asCompletionInsertText(item, defaultRange, itemDefaults?.insertTextFormat);
        result.insertText = insertText.insertText;
        result.range = insertText.range ?? defaultMonacoRange;
        result.fromEdit = insertText.fromEdit;
        if (insertText.isSnippet) {
            result.insertTextRules = this._monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet;
        }
        if (isNumber(item.kind)) {
            const [itemKind, original] = this.asCompletionItemKind(item.kind);
            result.kind = itemKind;
            if (original) {
                result.originalItemKind = original;
            }
        }
        if (item.sortText) {
            result.sortText = item.sortText;
        }
        if (item.additionalTextEdits) {
            result.additionalTextEdits = this.asTextEdits(item.additionalTextEdits);
        }
        if (isStringArray(item.commitCharacters)) {
            result.commitCharacters = item.commitCharacters.slice();
        }
        if (item.command) {
            result.command = this.asCommand(item.command);
        }
        if (item.deprecated === true || item.deprecated === false) {
            result.deprecated = item.deprecated;
        }
        if (item.preselect === true || item.preselect === false) {
            result.preselect = item.preselect;
        }
        const data = item.data ?? itemDefaults?.data;
        if (data !== undefined) {
            result.data = data;
        }
        const insertTextMode = item.insertTextMode ?? itemDefaults?.insertTextMode;
        if (insertTextMode) {
            result.insertTextMode = insertTextMode;
        }
        if (item.tags) {
            result.tags = item.tags;
        }
        return result;
    }

    getCompletionItemDefaultRange(list: CompletionList): monaco.Range | RangeReplace | undefined {
        const rangeDefaults = list.itemDefaults?.editRange;
        if (Range.is(rangeDefaults)) {
            return this.asRange(rangeDefaults);
        }
        return rangeDefaults === undefined
            ? undefined
            : { insert: this.asRange(rangeDefaults.insert), replace: this.asRange(rangeDefaults.replace) };
    }

    asCompletionItemLabel(item: CompletionItem): monaco.languages.CompletionItemLabel | string {
        if (CompletionItemLabelDetails.is(item.labelDetails)) {
            return {
                label: item.label,
                detail: item.labelDetails.detail,
                description: item.labelDetails.description,
            };
        }
        return item.label;
    }

    asCompletionItemKind(
        value: CompletionItemKind,
    ): [monaco.languages.CompletionItemKind, CompletionItemKind | undefined] {
        const kinds = this._monaco.languages.CompletionItemKind;
        if (CompletionItemKind.Text <= value && value <= CompletionItemKind.TypeParameter) {
            switch (value) {
                case CompletionItemKind.Text:
                    return [kinds.Text, undefined];
                case CompletionItemKind.Method:
                    return [kinds.Method, undefined];
                case CompletionItemKind.Function:
                    return [kinds.Function, undefined];
                case CompletionItemKind.Constructor:
                    return [kinds.Constructor, undefined];
                case CompletionItemKind.Field:
                    return [kinds.Field, undefined];
                case CompletionItemKind.Variable:
                    return [kinds.Variable, undefined];
                case CompletionItemKind.Class:
                    return [kinds.Class, undefined];
                case CompletionItemKind.Interface:
                    return [kinds.Interface, undefined];
                case CompletionItemKind.Module:
                    return [kinds.Module, undefined];
                case CompletionItemKind.Property:
                    return [kinds.Property, undefined];
                case CompletionItemKind.Unit:
                    return [kinds.Unit, undefined];
                case CompletionItemKind.Value:
                    return [kinds.Value, undefined];
                case CompletionItemKind.Enum:
                    return [kinds.Enum, undefined];
                case CompletionItemKind.Keyword:
                    return [kinds.Keyword, undefined];
                case CompletionItemKind.Snippet:
                    return [kinds.Snippet, undefined];
                case CompletionItemKind.Color:
                    return [kinds.Color, undefined];
                case CompletionItemKind.File:
                    return [kinds.File, undefined];
                case CompletionItemKind.Reference:
                    return [kinds.Reference, undefined];
                case CompletionItemKind.Folder:
                    return [kinds.Folder, undefined];
                case CompletionItemKind.EnumMember:
                    return [kinds.EnumMember, undefined];
                case CompletionItemKind.Constant:
                    return [kinds.Constant, undefined];
                case CompletionItemKind.Struct:
                    return [kinds.Struct, undefined];
                case CompletionItemKind.Event:
                    return [kinds.Event, undefined];
                case CompletionItemKind.Operator:
                    return [kinds.Operator, undefined];
                case CompletionItemKind.TypeParameter:
                    return [kinds.TypeParameter, undefined];
                default:
                    return [value - 1, undefined];
            }
        }
        return [CompletionItemKind.Text, value];
    }

    asCompletionInsertText(
        item: CompletionItem,
        defaultRange?: monaco.IRange | RangeReplace,
        defaultInsertTextFormat?: InsertTextFormat,
    ): { insertText: string; range?: monaco.IRange | RangeReplace; fromEdit: boolean; isSnippet: boolean } {
        const insertTextFormat = item.insertTextFormat ?? defaultInsertTextFormat;
        const isSnippet = insertTextFormat === InsertTextFormat.Snippet;
        if (item.textEdit !== undefined || defaultRange !== undefined) {
            const [range, newText] =
                item.textEdit === undefined
                    ? [defaultRange, item.textEditText ?? item.label]
                    : this.getCompletionRangeAndText(item.textEdit);
            return { insertText: newText, range, fromEdit: true, isSnippet };
        }
        if (item.insertText) {
            return { isSnippet, insertText: item.insertText, fromEdit: false, range: defaultRange };
        }
        return { insertText: item.label, range: defaultRange, fromEdit: false, isSnippet: false };
    }

    getCompletionRangeAndText(value: TextEdit | InsertReplaceEdit): [monaco.Range | RangeReplace, string] {
        if (InsertReplaceEdit.is(value)) {
            return [
                { insert: this.asRange(value.insert), replace: this.asRange(value.replace) },
                value.newText,
            ];
        }
        return [this.asRange(value.range), value.newText];
    }

    asRange(range: Range): monaco.Range;
    asRange(range: Range | undefined): monaco.Range | undefined;
    asRange(
        range: RecursivePartial<Range> | undefined | null,
    ): monaco.Range | Partial<monaco.IRange> | undefined | null;
    asRange(
        range: RecursivePartial<Range> | undefined | null,
    ): monaco.Range | Partial<monaco.IRange> | undefined | null {
        if (range === undefined) {
            return undefined;
        }
        if (range === null) {
            return null;
        }
        const start = this.asPosition(range.start);
        const end = this.asPosition(range.end);
        if (start instanceof this._monaco.Position && end instanceof this._monaco.Position) {
            return new this._monaco.Range(start.lineNumber, start.column, end.lineNumber, end.column);
        }
        return {
            startLineNumber: start?.lineNumber,
            startColumn: start?.column,
            endLineNumber: end?.lineNumber,
            endColumn: end?.column,
        };
    }

    asPosition(position: Position): monaco.Position;
    asPosition(
        position: Partial<Position> | undefined | null,
    ): monaco.Position | Partial<monaco.IPosition> | undefined | null;
    asPosition(
        position: Partial<Position> | undefined | null,
    ): monaco.Position | Partial<monaco.IPosition> | undefined | null {
        if (position === undefined) {
            return undefined;
        }
        if (position === null) {
            return null;
        }
        const { line, character } = position;
        const lineNumber = line === undefined ? undefined : line + 1;
        const column = character === undefined ? undefined : character + 1;
        if (lineNumber !== undefined && column !== undefined) {
            return new this._monaco.Position(lineNumber, column);
        }
        return { lineNumber, column };
    }
}
