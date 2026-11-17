// (C) 2026 GoodData Corporation

import { type Data, type Node, type Parent, type Root, type RootContent, type Text } from "mdast";
import { type Options as MarkdownOptions } from "react-markdown";
// remark-parse registers the parser's extension types on unified's processor data.
import type {} from "remark-parse";
import { type Data as ProcessorData } from "unified";

type FromMarkdownExtension = Exclude<NonNullable<ProcessorData["fromMarkdownExtensions"]>[number], unknown[]>;
type Handle = NonNullable<NonNullable<FromMarkdownExtension["exit"]>[string]>;
type CompileContext = ThisParameterType<Handle>;
type Token = Parameters<Handle>[0];
type ToHastOptions = NonNullable<MarkdownOptions["remarkRehypeOptions"]>;
type TextHandler = NonNullable<NonNullable<ToHastOptions["handlers"]>["text"]>;
type HastText = Extract<ReturnType<TextHandler>, { type: "text" }>;

const BLANK_LINE_CLASS = "gd-rich-text-blank-line";

interface IBlankLineData extends Data {
    hName?: string;
    hProperties?: { className: string[] };
}

// One blank line beyond the first of a run between blocks, which CommonMark would merge into a
// single block break.
interface IBlankLine extends Node {
    type: "blankLine";
    data?: IBlankLineData;
}

declare module "mdast" {
    // eslint-disable-next-line @typescript-eslint/naming-convention
    interface BlockContentMap {
        blankLine: IBlankLine;
    }

    // eslint-disable-next-line @typescript-eslint/naming-convention
    interface RootContentMap {
        blankLine: IBlankLine;
    }
}

// Blank lines between list items would have to sit inside the list, which holds only items.
const BLANK_LINE_PARENTS = new Set(["root", "blockquote", "listItem"]);

function blankLine(): IBlankLine {
    return { type: "blankLine", data: { hName: "div", hProperties: { className: [BLANK_LINE_CLASS] } } };
}

function isParent(node: Node): node is Parent {
    return "children" in node && Array.isArray(node.children);
}

function blankLinesBetween(previous: Node, next: Node): number {
    const end = previous.position?.end.line;
    const start = next.position?.start.line;
    return end === undefined || start === undefined ? 0 : start - end - 1;
}

// Between blocks, the first blank line is the gap every block keeps from the one before it. Above the
// first block there is no such gap, so every line is kept, but only in the document itself: a quote's
// or a list item's first block starts on its marker's own line.
function keptBlankLines(parent: Parent, child: Node, previous: Node | undefined): number {
    if (previous !== undefined) {
        return blankLinesBetween(previous, child) - 1;
    }
    const start = child.position?.start.line;
    return parent.type === "root" && start !== undefined ? start - 1 : 0;
}

// After the last block of the text every typed line is a line of its own, as it is in text of blank
// lines alone. Text with nothing typed ends on line 1 too; only its offset tells it from a line of spaces.
function trailingBlankLines(root: Parent): number {
    const end = root.position?.end;
    if (end === undefined || end.offset === 0) {
        return 0;
    }
    const last = root.children.at(-1);
    if (last === undefined) {
        return end.line;
    }
    const lastLine = last.position?.end.line;
    return lastLine === undefined ? 0 : end.line - lastLine;
}

function withBlankLines(parent: Parent): void {
    if (!BLANK_LINE_PARENTS.has(parent.type)) {
        return;
    }
    // The parent types above hold block content, which the blank line is declared part of.
    const children = parent.children as RootContent[];
    const trailing = parent.type === "root" ? trailingBlankLines(parent) : 0;
    parent.children = [
        ...children.flatMap((child, index) => {
            const extra = keptBlankLines(parent, child, children[index - 1]);
            return extra > 0 ? [...Array.from({ length: extra }, blankLine), child] : [child];
        }),
        ...Array.from({ length: trailing }, blankLine),
    ];
}

function indented(paragraph: Parent, indent: string): void {
    const [first] = paragraph.children;
    if (first?.type === "text") {
        first.value = indent + first.value;
    } else {
        paragraph.children.unshift({ type: "text", value: indent } satisfies Text);
    }
}

function visitParents(node: Node, visit: (parent: Parent) => void): void {
    if (!isParent(node)) {
        return;
    }
    visit(node);
    node.children.forEach((child) => visitParents(child, visit));
}

// The default handler trims the spaces around every line ending, which is the indentation kept.
const untrimmedText: TextHandler = (state, node: Text) => {
    const result: HastText = { type: "text", value: node.value };
    state.patch(node, result);
    return state.applyData(node, result);
};

export const TYPED_WHITESPACE_TO_HAST: ToHastOptions = { handlers: { text: untrimmedText } };

export function typedWhitespace(): FromMarkdownExtension {
    // Indentation in front of a paragraph's first line is read before the paragraph opens, so it is
    // kept by the offset the paragraph will start at.
    const firstLineIndents = new Map<number, string>();

    return {
        exit: {
            linePrefix(this: CompileContext, token: Token) {
                // The indentation of a setext heading's underline is not heading text; the parser
                // flags the line it reads the underline from.
                if (this.data.setextHeadingSlurpLineEnding) {
                    return;
                }
                const node = this.stack[this.stack.length - 1];
                if (node?.type === "paragraph" || node?.type === "heading") {
                    // Read as text, the way a line ending inside a paragraph is.
                    this.config.enter["data"]?.call(this, token);
                    this.config.exit["data"]?.call(this, token);
                    return;
                }
                firstLineIndents.set(token.end.offset, this.sliceSerialize(token));
            },
        },
        transforms: [
            (tree: Root) => {
                visitParents(tree, (parent) => {
                    const indent =
                        parent.type === "paragraph" && parent.position?.start.offset !== undefined
                            ? firstLineIndents.get(parent.position.start.offset)
                            : undefined;
                    if (indent !== undefined) {
                        indented(parent, indent);
                    }
                    withBlankLines(parent);
                });
                firstLineIndents.clear();
            },
        ],
    };
}
