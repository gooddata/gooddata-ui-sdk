// (C) 2026 GoodData Corporation

import { describe, expect, it } from "vitest";
import { parse, stringify } from "yaml";

import type { PublisherLayoutNodeV2 } from "@gooddata/sdk-code-schemas/v1";

import { fillPublisherIdsInEntityV2, fillPublisherIdsV2 } from "./fillPublisherIdsV2.js";
import {
    type AacPublisherDocumentV2,
    type AacPublisherEntityWithOptionalIdUnionV2,
    type AacPublisherPageTemplateV2,
} from "./schemas/types.js";

function filledDocument(content: string): AacPublisherDocumentV2 {
    return parse(fillPublisherIdsV2(content).content) as AacPublisherDocumentV2;
}

function childrenOf(node: PublisherLayoutNodeV2): PublisherLayoutNodeV2[] {
    return node.type === "row" || node.type === "column" ? node.children : [];
}

const document = `# Written by hand
type: document
id: monthly
version: "2"
title: Monthly
period:
    granularity: MONTH
    from: -1
    to: -1
content:
    sections:
        - title: Revenue # the section has no id
          pages:
              - layout:
                    type: row
                    children:
                        - type: title
                          markdown: "no"
                        - type: visualization
                          id: chart
                          visualization: revenue
    pages: []
`;

const idPattern = /^[A-Za-z0-9_.-]{1,64}$/;

describe("fillPublisherIdsV2", () => {
    it("gives every section, page and widget an id, and keeps comments, indent and quoting", () => {
        const { content, changed } = fillPublisherIdsV2(document);
        const [section] = filledDocument(document).content.sections ?? [];
        const [page] = section.pages;
        const [title, chart] = childrenOf(page.layout);

        expect(changed).toBe(true);
        expect([section.id, page.id, title.id]).toEqual([
            expect.stringMatching(/^section_/),
            expect.stringMatching(/^page_/),
            expect.stringMatching(/^widget_/),
        ]);
        expect([section.id, page.id, title.id].every((id) => idPattern.test(id ?? ""))).toBe(true);
        expect(chart.id).toBe("chart");
        expect(content).toContain("# Written by hand");
        expect(content).toContain("# the section has no id");
        expect(content).toContain('markdown: "no"');
        expect(content).toContain("\n    sections:\n");
    });

    it("puts a section or page id first and a widget id after its type", () => {
        const [section] = filledDocument(document).content.sections ?? [];
        const [title] = childrenOf(section.pages[0].layout);

        expect(Object.keys(section)[0]).toBe("id");
        expect(Object.keys(section.pages[0])[0]).toBe("id");
        expect(Object.keys(title).slice(0, 2)).toEqual(["type", "id"]);
    });

    it("fills the widgets of a page template, which has no page id", () => {
        const pageTemplate = `type: page_template
id: two
version: "2"
title: Two
content:
  layout:
    type: column
    children:
      - type: text
      - type: image
`;
        const filled = parse(fillPublisherIdsV2(pageTemplate).content) as AacPublisherPageTemplateV2;
        const [text, image] = childrenOf(filled.content.layout);

        expect(filled.content).not.toHaveProperty("id");
        expect(text.id).not.toBe(image.id);
        expect([text.id, image.id].every((id) => idPattern.test(id ?? ""))).toBe(true);
    });

    it.each([
        ["null", "null"],
        ["empty", '""'],
    ])("fills an id written as %s in its place, keeping its comment", (_, written) => {
        const pageTemplate = `type: page_template
id: one
version: "2"
title: One
content:
    layout:
        id: ${written} # fill me
        type: text
        markdown: hi
`;
        const { content } = fillPublisherIdsV2(pageTemplate);

        expect(content).toMatch(/\n {8}id: widget_[0-9a-f]+ # fill me\n {8}type: text\n/);
    });

    it("leaves an id that is written but not a string for the validator to report", () => {
        const content = document.replace("id: chart", "id: 123");

        expect(fillPublisherIdsV2(content).content).toContain("id: 123");
    });

    it("keeps indented sequences when a markdown list sits under a line ending in a colon", () => {
        const pageTemplate = `type: page_template
id: two
version: "2"
title: Two
content:
  layout:
    type: row
    children:
      - type: text
        markdown: |
          Highlights:
          - revenue up
`;
        const { content } = fillPublisherIdsV2(pageTemplate);

        expect(content.replace(/widget_[0-9a-f]+/, "widget_x")).toBe(
            pageTemplate.replace("      - type: text\n", "      - type: text\n        id: widget_x\n"),
        );
    });

    it("takes the indent width from the maps, not from a block scalar", () => {
        const pageTemplate = `type: page_template
id: two
version: "2"
title: Two
description: |
  Two charts.
content:
    layout:
        type: text
`;
        const { content } = fillPublisherIdsV2(pageTemplate);

        expect(content).toMatch(/\ncontent:\n {4}layout:\n {8}type: text\n {8}id: widget_/);
    });

    it("keeps CRLF line breaks when the first line ends in one", () => {
        const pageTemplate = [
            "type: page_template",
            "id: t",
            'version: "2"',
            "title: T",
            "content:",
            "    layout:",
            "        type: row",
            "        children:",
            "            - type: text",
            "              markdown: hi # c",
            "",
        ].join("\r\n");

        const { content, changed } = fillPublisherIdsV2(pageTemplate);

        expect(changed).toBe(true);
        expect(content).toContain("id: widget_");
        expect(content).toContain("# c\r\n");
        expect(content).not.toMatch(/(?<!\r)\n/);
        expect(content).not.toContain("\r\r");
    });

    it("writes LF when the first line ends in LF, whatever later lines use", () => {
        const pageTemplate =
            'type: page_template\nid: t\r\nversion: "2"\ntitle: T\ncontent:\n    layout:\n        type: text\n';

        const { content } = fillPublisherIdsV2(pageTemplate);

        expect(content).toContain("id: widget_");
        expect(content).not.toContain("\r");
    });

    it("keeps sequence items at their parent key's column when the source writes them so", () => {
        const pageTemplate = `type: page_template
id: two
version: "2"
title: Two
content:
  layout:
    type: row
    children:
    - type: text
      markdown: hi
`;
        const { content } = fillPublisherIdsV2(pageTemplate);

        expect(content.replace(/widget_[0-9a-f]+/, "widget_x")).toBe(
            pageTemplate.replace("    - type: text\n", "    - type: text\n      id: widget_x\n"),
        );
    });

    it.each([
        ["content that has every id", fillPublisherIdsV2(document).content],
        ["content that does not parse", "type: document\ncontent: [unclosed"],
        ["another kind of entity", "type: metric\nid: m\nmaql: SELECT 1\n"],
    ])("leaves %s as it is", (_, content) => {
        expect(fillPublisherIdsV2(content)).toEqual({ content, changed: false });
    });
});

// The ids are drawn at random, so the paths compare by what was filled: the kind of id at each place.
const GENERATED_ID = /^(section|page|widget)_[0-9a-f]+$/;

function generatedIds(value: unknown): string[] {
    if (Array.isArray(value)) {
        return value.flatMap(generatedIds);
    }
    if (typeof value === "object" && value !== null) {
        return Object.values(value).flatMap(generatedIds);
    }
    return typeof value === "string" && GENERATED_ID.test(value) ? [value] : [];
}

function withIdKinds(value: unknown): unknown {
    return JSON.parse(JSON.stringify(value), (_key, item: unknown) =>
        typeof item === "string" && GENERATED_ID.test(item) ? item.replace(GENERATED_ID, "$1_*") : item,
    );
}

describe("fillPublisherIdsInEntityV2", () => {
    const pageTemplate = parse(`type: page_template
id: two
version: "2"
title: Two
content:
  layout:
    type: column
    children:
      - type: text
      - type: image
        id: logo
`) as AacPublisherEntityWithOptionalIdUnionV2;

    it.each([
        [
            "a document with sections, pages and widgets missing ids",
            parse(document) as AacPublisherEntityWithOptionalIdUnionV2,
        ],
        ["a page template", pageTemplate],
        [
            "an entity with every id",
            parse(fillPublisherIdsV2(document).content) as AacPublisherEntityWithOptionalIdUnionV2,
        ],
    ])("fills %s as the text path does", (_, entity) => {
        const fromObject = fillPublisherIdsInEntityV2(entity);
        const fromText = fillPublisherIdsV2(stringify(entity));

        expect(fromObject.changed).toBe(fromText.changed);
        expect(withIdKinds(fromObject.entity)).toEqual(withIdKinds(parse(fromText.content)));
        expect(generatedIds(fromObject.entity)).toHaveLength(generatedIds(parse(fromText.content)).length);
        expect(new Set(generatedIds(fromObject.entity)).size).toBe(generatedIds(fromObject.entity).length);
    });

    it("leaves the entity passed in unchanged", () => {
        const entity = parse(document) as AacPublisherEntityWithOptionalIdUnionV2;
        const before = structuredClone(entity);

        const { entity: filled, changed } = fillPublisherIdsInEntityV2(entity);

        expect(changed).toBe(true);
        expect(entity).toEqual(before);
        expect(filled).not.toBe(entity);
    });

    it("gives a widget object shared by two places an id in each", () => {
        const entity = parse(`type: page_template
id: two
version: "2"
title: Two
content:
  layout:
    type: row
    children:
      - &shared
        type: text
        markdown: a
      - *shared
`) as AacPublisherEntityWithOptionalIdUnionV2;
        const before = structuredClone(entity);

        const { entity: filled } = fillPublisherIdsInEntityV2(entity);

        const ids = generatedIds(filled);
        expect(ids).toHaveLength(2);
        expect(new Set(ids).size).toBe(2);
        expect(entity).toEqual(before);
    });

    it("returns the entity itself when nothing is missing", () => {
        const entity = parse(fillPublisherIdsV2(document).content) as AacPublisherEntityWithOptionalIdUnionV2;

        expect(fillPublisherIdsInEntityV2(entity)).toEqual({ entity, changed: false });
    });
});
