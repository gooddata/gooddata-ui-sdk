// (C) 2026 GoodData Corporation

import { type Nodes } from "mdast";
import remarkParse from "remark-parse";
import { unified } from "unified";

import { type RichTextFeature, remarkMarkdownFeatures } from "../plugins/remark-markdown-features.js";

/**
 * @internal
 */
export interface IRichTextRange {
    start: number;
    end: number;
}

/**
 * @internal
 */
export interface IRichTextFormatsInRange {
    strong: boolean;
    emphasis: boolean;
    orderedList: boolean;
    bulletList: boolean;
}

/**
 * A character of the source that renders as text, with the formats it renders in.
 *
 * @internal
 */
export interface IRichTextCharacter extends IRichTextFormatsInRange {
    offset: number;

    /**
     * How many list items the character is nested in, 0 outside any list.
     */
    listDepth: number;
}

/**
 * The source of a bold or italic span: `start` to `contentStart` and `contentEnd` to `end` are its
 * markers.
 *
 * @internal
 */
export interface IRichTextEmphasisSpan {
    format: "strong" | "emphasis";
    start: number;
    end: number;
    contentStart: number;
    contentEnd: number;
}

/**
 * The source of a link, a highlight or a strikethrough: `start` to `contentStart` and `contentEnd` to `end`
 * are its markup, a link's destination and title included.
 *
 * @internal
 */
export interface IRichTextElementSpan {
    element: "link" | "highlight" | "strikethrough";
    start: number;
    end: number;
    contentStart: number;
    contentEnd: number;
}

/**
 * An entity the rich text decodes, such as `&nbsp;`, with the text it draws.
 *
 * @internal
 */
export interface IRichTextEntity {
    start: number;
    end: number;
    text: string;
}

/**
 * @internal
 */
export interface IRichTextCharacters {
    characters: IRichTextCharacter[];
    spans: IRichTextEmphasisSpan[];
    elements: IRichTextElementSpan[];
    entities: IRichTextEntity[];
}

type RichTextFormat = keyof IRichTextFormatsInRange;

const ELEMENTS: Partial<Record<Nodes["type"], IRichTextElementSpan["element"]>> = {
    link: "link",
    highlight: "highlight",
    delete: "strikethrough",
};

const WHITESPACE = /\s/;

const WHITESPACE_ONLY = /^\s+$/;

function innerScope(node: Nodes, scope: ReadonlySet<RichTextFormat>): ReadonlySet<RichTextFormat> {
    switch (node.type) {
        case "strong":
            return new Set([...scope, "strong"]);
        case "emphasis":
            return new Set([...scope, "emphasis"]);
        case "list": {
            // A nested list decides the kind of its own items.
            const outer = [...scope].filter((format) => format !== "orderedList" && format !== "bulletList");
            return new Set([...outer, node.ordered ? "orderedList" : "bulletList"]);
        }
        default:
            return scope;
    }
}

interface IScope {
    formats: ReadonlySet<RichTextFormat>;
    listDepth: number;
}

function collect(node: Nodes, scope: IScope, found: IRichTextCharacters): void {
    const start = node.position?.start.offset;
    const end = node.position?.end.offset;
    if (node.type === "text") {
        for (let offset = start ?? 0; offset < (end ?? 0); offset += 1) {
            found.characters.push({
                offset,
                strong: scope.formats.has("strong"),
                emphasis: scope.formats.has("emphasis"),
                orderedList: scope.formats.has("orderedList"),
                bulletList: scope.formats.has("bulletList"),
                listDepth: scope.listDepth,
            });
        }
        return;
    }
    if (!("children" in node)) {
        return;
    }
    const first = node.children[0]?.position?.start.offset;
    const last = node.children[node.children.length - 1]?.position?.end.offset;
    if (
        (node.type === "strong" || node.type === "emphasis") &&
        start !== undefined &&
        end !== undefined &&
        first !== undefined &&
        last !== undefined
    ) {
        found.spans.push({ format: node.type, start, end, contentStart: first, contentEnd: last });
    }
    const element = ELEMENTS[node.type];
    if (
        element !== undefined &&
        start !== undefined &&
        end !== undefined &&
        first !== undefined &&
        last !== undefined
    ) {
        found.elements.push({ element, start, end, contentStart: first, contentEnd: last });
    }
    const inner: IScope = {
        formats: innerScope(node, scope.formats),
        listDepth: scope.listDepth + (node.type === "listItem" ? 1 : 0),
    };
    for (const child of node.children) {
        collect(child, inner, found);
    }
}

/**
 * Every source character that renders as text, in source order, the bold and italic spans, the links,
 * highlights and strikethroughs, and the entities it decodes.
 *
 * @remarks
 * Read with the parser the rich text renders with, so it matches what is drawn. A text character is any
 * source character inside a text node, the backslash of an escape and the whole of an entity included.
 *
 * @internal
 */
export function getRichTextCharacters(
    value: string,
    features: readonly RichTextFeature[],
): IRichTextCharacters {
    const processor = unified().use(remarkParse).use(remarkMarkdownFeatures(features));
    const found: IRichTextCharacters = { characters: [], spans: [], elements: [], entities: [] };
    collect(processor.parse(value), { formats: new Set(), listDepth: 0 }, found);
    const text = new Set(found.characters.map(({ offset }) => offset));
    found.entities = [...value.matchAll(ESCAPE_OR_ENTITY)].flatMap(({ index, 0: entity }) => {
        if (entity.startsWith("\\")) {
            return [];
        }
        const isText = Array.from(entity, (_, at) => index + at).every((offset) => text.has(offset));
        const decoded = isText ? decodedText(processor.parse(entity)) : entity;
        return decoded === entity ? [] : [{ start: index, end: index + entity.length, text: decoded }];
    });
    return found;
}

// An escape comes first, so an ampersand it escapes starts no entity.
const ESCAPE_OR_ENTITY = /\\[\x21-\x2f\x3a-\x40\x5b-\x60\x7b-\x7e]|&(?:#\d+|#x[\da-f]+|[a-z][\da-z]*);/gi;

// The text the parser reads, as it draws it.
function decodedText(node: Nodes): string {
    if (node.type === "text") {
        return node.value;
    }
    return "children" in node ? node.children.map(decodedText).join("") : "";
}

/**
 * Whether every character of text in the range renders bold, italic, in a numbered list item, or in a
 * bulleted one.
 *
 * @remarks
 * Read with the parser the rich text renders with, so the answer matches what is drawn. Markup in the
 * range does not count, nor does whitespace, including an entity such as `&nbsp;` that draws as
 * whitespace: a range with no other character renders none of them.
 * Text in a nested list counts as an item of that list alone.
 *
 * @internal
 */
export function getRichTextFormatsInRange(
    value: string,
    range: IRichTextRange,
    features: readonly RichTextFeature[],
): IRichTextFormatsInRange {
    const { characters, entities } = getRichTextCharacters(value, features);
    const blankEntities = entities.filter(({ text }) => WHITESPACE_ONLY.test(text));
    const isBlank = (offset: number) =>
        WHITESPACE.test(value.charAt(offset)) ||
        blankEntities.some(({ start, end }) => start <= offset && offset < end);
    const inRange = characters.filter(
        ({ offset }) => offset >= range.start && offset < range.end && !isBlank(offset),
    );
    const covers = (format: RichTextFormat) =>
        inRange.length > 0 && inRange.every((character) => character[format]);
    return {
        strong: covers("strong"),
        emphasis: covers("emphasis"),
        orderedList: covers("orderedList"),
        bulletList: covers("bulletList"),
    };
}
