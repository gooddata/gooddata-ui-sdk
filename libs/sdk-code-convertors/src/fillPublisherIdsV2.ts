// (C) 2026 GoodData Corporation

import {
    type Document,
    LineCounter,
    Pair,
    Scalar,
    type YAMLMap,
    isMap,
    isScalar,
    isSeq,
    parseDocument,
    visit,
} from "yaml";

import { newPublisherPageIdV2, newPublisherSectionIdV2, newPublisherWidgetIdV2 } from "@gooddata/sdk-model";

function isKey(pair: Pair, key: string): boolean {
    return isScalar(pair.key) ? pair.key.value === key : pair.key === key;
}

function isMissingId(node: YAMLMap): boolean {
    const id: unknown = node.get("id");
    return id === undefined || id === null || id === "";
}

function takenIds(nodes: YAMLMap[]): Set<string> {
    return new Set(nodes.filter((node) => !isMissingId(node)).map((node) => String(node.get("id"))));
}

function drawId(generate: () => string, taken: Set<string>): string {
    let id = generate();
    while (taken.has(id)) {
        id = generate();
    }
    taken.add(id);
    return id;
}

/** An `id` key already written keeps its place and its comment; a new one goes after `after`, or first. */
function placeId(node: YAMLMap, id: string, after?: string): void {
    const written = node.items.find((item) => isKey(item, "id"));
    if (written !== undefined && isScalar(written.value)) {
        written.value.value = id;
        written.value.type = Scalar.PLAIN;
        return;
    }
    if (written !== undefined) {
        written.value = new Scalar(id);
        return;
    }
    const position = after === undefined ? 0 : node.items.findIndex((item) => isKey(item, after)) + 1;
    node.items.splice(position, 0, new Pair(new Scalar("id"), new Scalar(id)));
}

function maps(value: unknown): YAMLMap[] {
    return isSeq(value) ? value.items.filter((item): item is YAMLMap => isMap(item)) : [];
}

function layoutNodes(node: unknown): YAMLMap[] {
    if (!isMap(node)) {
        return [];
    }
    const type: unknown = node.get("type");
    return type === "row" || type === "column" ? maps(node.get("children")).flatMap(layoutNodes) : [node];
}

interface IFillOptions {
    generate: () => string;
    taken: Set<string>;
    after?: string;
}

function fillMissing(nodes: YAMLMap[], { generate, taken, after }: IFillOptions): boolean {
    const missing = nodes.filter(isMissingId);
    for (const node of missing) {
        placeId(node, drawId(generate, taken), after);
    }
    return missing.length > 0;
}

function fillWidgetIds(layout: unknown): boolean {
    const widgets = layoutNodes(layout);
    return fillMissing(widgets, {
        generate: newPublisherWidgetIdV2,
        taken: takenIds(widgets),
        after: "type",
    });
}

function fillContentIds(type: unknown, content: unknown): boolean {
    if (!isMap(content)) {
        return false;
    }
    if (type === "page_template") {
        return fillWidgetIds(content.get("layout"));
    }
    if (type !== "document" && type !== "document_template") {
        return false;
    }
    const sections = maps(content.get("sections"));
    const pages = [
        ...maps(content.get("pages")),
        ...sections.flatMap((section) => maps(section.get("pages"))),
    ];
    const taken = takenIds([...sections, ...pages]);
    const filledSections = fillMissing(sections, { generate: newPublisherSectionIdV2, taken });
    const filledPages = fillMissing(pages, { generate: newPublisherPageIdV2, taken });
    const filledWidgets = pages.map((page) => fillWidgetIds(page.get("layout"))).some(Boolean);
    return filledSections || filledPages || filledWidgets;
}

/** The indent width the source uses: how far a block map's keys sit right of their parent key. */
function indentOf(document: Document, lineCounter: LineCounter): number {
    let indent: number | undefined;
    visit(document, {
        Pair(_, pair) {
            const [first] = isMap(pair.value) && !pair.value.flow ? pair.value.items : [];
            if (
                indent === undefined &&
                isScalar(pair.key) &&
                pair.key.range &&
                isScalar(first?.key) &&
                first.key.range
            ) {
                indent =
                    lineCounter.linePos(first.key.range[0]).col - lineCounter.linePos(pair.key.range[0]).col;
            }
        },
    });
    return indent !== undefined && indent > 0 ? indent : 2;
}

/** True when block sequence items are written at their parent key's column (`key:` then `- item`). */
function hasUnindentedSequences(document: Document, lineCounter: LineCounter): boolean {
    let unindented = false;
    visit(document, {
        Pair(_, pair) {
            if (
                isScalar(pair.key) &&
                isSeq(pair.value) &&
                !pair.value.flow &&
                pair.key.range &&
                pair.value.range
            ) {
                const keyColumn = lineCounter.linePos(pair.key.range[0]).col;
                unindented ||= keyColumn === lineCounter.linePos(pair.value.range[0]).col;
            }
        },
    });
    return unindented;
}

/** The first line break decides which one the whole output uses. */
function usesCrlf(content: string): boolean {
    const firstBreak = content.indexOf("\n");
    return firstBreak > 0 && content[firstBreak - 1] === "\r";
}

/**
 * Adds the section, page and widget ids a v2 document, document template or page template as code
 * leaves out, so the YAML written by hand states the ids the stored entity keeps. An id counts as
 * missing when it is absent, null or empty. Comments and the indent width survive, the line break of
 * the first line is applied to the whole file, and the sequence style survives too, except that
 * unindented sequences are kept only at a 2-space indent and the compact `-   ` style is not kept.
 * Block scalars take the indent width of the maps. Content that needs no id, or does not parse,
 * comes back unchanged.
 *
 * @alpha
 */
export function fillPublisherIdsV2(content: string): { content: string; changed: boolean } {
    const lineCounter = new LineCounter();
    const document = parseDocument(content, { lineCounter });
    if (document.errors.length > 0 || !isMap(document.contents)) {
        return { content, changed: false };
    }
    if (!fillContentIds(document.contents.get("type"), document.contents.get("content"))) {
        return { content, changed: false };
    }
    const written = document.toString({
        indent: indentOf(document, lineCounter),
        indentSeq: !hasUnindentedSequences(document, lineCounter),
        lineWidth: 0,
    });
    return { content: usesCrlf(content) ? written.replace(/\n/g, "\r\n") : written, changed: true };
}
