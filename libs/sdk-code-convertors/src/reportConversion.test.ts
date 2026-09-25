// (C) 2026 GoodData Corporation

import { describe, expect, it } from "vitest";

import type { ReportPageLayout } from "@gooddata/sdk-code-schemas/v1";
import {
    BuiltInReportPageLayouts,
    type FilterContextItem,
    type IDashboardFilterReference,
    type IReportDefinition,
    type IReportPageBody,
    type IReportPageLayoutContent,
    type ReportSlot,
    idRef,
} from "@gooddata/sdk-model";

import { reportDefinitionToYaml, reportPageLayoutDefinitionToYaml } from "./from/declarativeReportToYaml.js";
import { yamlReportPageLayoutToDefinition, yamlReportToDefinition } from "./to/yamlReportToDeclarative.js";
import { CoreErrorCode, type ICoreError } from "./utils/errors.js";

/**
 * The editors hold a document as text, so a value that does not survive being written down does not
 * reach the reader either. Everything here goes through the text the same way.
 */
function asDocument<T>(value: T): T {
    return JSON.parse(JSON.stringify(value)) as T;
}

/** Typed loosely on purpose: what is asserted here is what the document literally says. */
function pageDocument(content: IReportPageLayoutContent): any {
    return asDocument(
        reportPageLayoutDefinitionToYaml({ type: "reportPageLayout", title: "A page", content }).json,
    );
}

function storedPage(content: IReportPageLayoutContent): IReportPageBody {
    return yamlReportPageLayoutToDefinition(pageDocument(content)).content;
}

/** The tree decides which order the slots come back in, and the page renders the same either way. */
function ordered(body: IReportPageBody): IReportPageBody {
    const slots = [...body.slots].sort((one, other) =>
        one.localIdentifier.localeCompare(other.localIdentifier),
    );
    return { ...body, slots };
}

const page = (body: Omit<IReportPageBody, "slots"> & { slots: ReportSlot[] }): IReportPageLayoutContent => ({
    version: "1",
    ...body,
});

const row = (...slotIds: string[]) =>
    ({
        type: "section",
        direction: "row",
        children: slotIds.map((slotId) => ({ type: "slotRef" as const, slotId })),
    }) as IReportPageBody["layout"];

describe("a built-in page", () => {
    it.each(BuiltInReportPageLayouts.map((layout) => [layout.title, layout] as const))(
        "comes back as it went out: %s",
        (_title, layout) => {
            expect(ordered(storedPage(layout.content))).toEqual(ordered(layout.content));
        },
    );
});

describe("a page's slots", () => {
    it("keep a title that is written down and drawn", () => {
        const content = page({
            layout: row("v"),
            slots: [
                { type: "visualization", localIdentifier: "v", title: "Revenue", showTitle: true },
                { type: "visualization", localIdentifier: "w", title: "Cost", showTitle: false },
                { type: "visualization", localIdentifier: "x", showTitle: false },
            ],
        });
        const written = pageDocument({ ...content, layout: row("v", "w", "x") });

        expect(written.layout.row).toEqual([
            { id: "v", visualization: null, title: "Revenue", show_title: true },
            { id: "w", visualization: null, title: "Cost", show_title: false },
            { id: "x", visualization: null, title: false },
        ]);
        expect(ordered(storedPage({ ...content, layout: row("v", "w", "x") }))).toEqual(
            ordered({ ...content, layout: row("v", "w", "x") }),
        );
    });

    it("keep what an AI-written text was asked for and what it produced", () => {
        const content = page({
            layout: row("t"),
            slots: [
                {
                    type: "paragraph",
                    localIdentifier: "t",
                    source: {
                        type: "ai",
                        prompt: "Summarize {period}",
                        content: "It went well.",
                        generatedAt: "2026-01-02T03:04:05Z",
                    },
                },
            ],
        });

        expect(pageDocument(content).layout.row[0].paragraph).toEqual({
            prompt: "Summarize {period}",
            text: "It went well.",
            generated_at: "2026-01-02T03:04:05Z",
        });
        expect(storedPage(content)).toEqual(content);
    });

    it("are dropped when nothing places or paints with them", () => {
        const content = page({
            layout: row("kept"),
            slots: [
                { type: "heading", localIdentifier: "kept", source: { type: "static", content: "Hi" } },
                { type: "heading", localIdentifier: "orphan", source: { type: "static", content: "Bye" } },
            ],
        });

        expect(storedPage(content).slots.map((slot) => slot.localIdentifier)).toEqual(["kept"]);
    });
});

describe("a backdrop", () => {
    const backdrop: ReportSlot = {
        type: "image",
        localIdentifier: "bg",
        source: { type: "url", url: "https://example.com/bg.png" },
    };
    const paint = { background: { type: "image" as const, slotId: "bg" } };

    it("is written once when the page and a box inside it share it", () => {
        const content = page({
            style: paint,
            layout: { ...row("h"), style: paint } as IReportPageBody["layout"],
            slots: [backdrop, { type: "heading", localIdentifier: "h" }],
        });
        const written = pageDocument(content);

        expect(written.style.background.image).toEqual({ id: "bg", url: "https://example.com/bg.png" });
        expect(written.layout.style.background.image).toEqual({ ref: "bg" });
        expect(ordered(storedPage(content))).toEqual(ordered(content));
    });

    it("is written once when the tree also places the slot it is drawn from", () => {
        const content = page({
            style: paint,
            layout: row("bg"),
            slots: [backdrop],
        });
        const written = pageDocument(content);

        expect(written.style.background.image).toEqual({ ref: "bg" });
        expect(written.layout.row[0]).toEqual({ id: "bg", image: "https://example.com/bg.png" });
        expect(storedPage(content)).toEqual(content);
    });
});

describe("a node that says nothing about what it draws", () => {
    const refusalOf = (node: unknown): ICoreError | undefined => {
        try {
            yamlReportPageLayoutToDefinition({
                id: "p",
                type: "report_page_layout",
                title: "A page",
                layout: { row: [node] },
            } as ReportPageLayout);
            return undefined;
        } catch (error) {
            return error as ICoreError;
        }
    };

    it.each([
        ["carries no content key", { id: "x" }],
        ["spells the visualization key as the entity is spelled", { id: "x", visualisation: "foo" }],
    ])("is refused: it %s", (_case, node) => {
        expect(refusalOf(node)?.code).toBe(CoreErrorCode.ItemNotSupported);
    });
});

describe("a page's filters", () => {
    const attributeFilter: FilterContextItem = {
        attributeFilter: {
            displayForm: idRef("label.region", "displayForm"),
            negativeSelection: false,
            attributeElements: { uris: ["East", "West"] },
            localIdentifier: "region",
            title: "Region",
            selectionMode: "multi",
        },
    };
    const dateFilter: FilterContextItem = {
        dateFilter: {
            localIdentifier: "date",
            type: "absolute",
            granularity: "GDC.time.date",
            from: "2026-01-01",
            to: "2026-03-31",
            dataSet: idRef("date", "dataSet"),
        },
    };
    const metricFilter: FilterContextItem = {
        dashboardMeasureValueFilter: {
            measure: idRef("revenue", "measure"),
            localIdentifier: "mvf",
            conditions: [{ comparison: { operator: "GREATER_THAN", value: 10 } }],
        },
    };
    const ignoredFilters: IDashboardFilterReference[] = [
        { type: "attributeFilterReference", displayForm: idRef("label.region", "displayForm") },
        { type: "dateFilterReference", dataSet: idRef("date", "dataSet") },
        { type: "measureValueFilterReference", measure: idRef("revenue", "measure") },
    ];

    const content = page({
        layout: row("v"),
        slots: [
            {
                type: "visualization",
                localIdentifier: "v",
                insight: idRef("sales", "insight"),
                filters: [metricFilter],
                ignoredFilters,
            },
        ],
        filters: [attributeFilter, dateFilter],
    });

    it("name every object the way the document names it", () => {
        const written = pageDocument(content);

        expect(written.filters.region.using).toBe("label/label.region");
        expect(written.filters.date.date).toBe("date");
        expect(written.layout.row[0].filters.mvf.using).toBe("metric/revenue");
        expect(written.layout.row[0].ignored_filters).toEqual([
            "label/label.region",
            "dataset/date",
            "metric/revenue",
        ]);
    });

    it("come back referencing the same objects the model stores", () => {
        const stored = storedPage(content);

        expect(stored.filters).toEqual([attributeFilter, dateFilter]);
        expect(stored.slots[0]).toMatchObject({ filters: [metricFilter], ignoredFilters });
    });
});

describe("a report", () => {
    const report: IReportDefinition = {
        type: "report",
        ref: idRef("q1"),
        title: "Q1",
        periodStart: "2026-01-01",
        periodEnd: "2026-03-31",
        variableValues: { brand: "Levi's" },
        content: {
            version: "1",
            pages: [
                {
                    localIdentifier: "p1",
                    layout: row("h"),
                    slots: [
                        { type: "heading", localIdentifier: "h", source: { type: "static", content: "Hi" } },
                    ],
                },
            ],
            variables: [{ name: "brand", title: "Brand", defaultValue: "Levi's" }],
            filters: [
                {
                    dateFilter: {
                        localIdentifier: "date",
                        type: "relative",
                        granularity: "GDC.time.month",
                        from: -5,
                        to: 0,
                        dataSet: idRef("date", "dataSet"),
                    },
                },
            ],
        },
    };

    it("comes back as it went out", () => {
        const document = asDocument(reportDefinitionToYaml(report).json);

        expect(document.period).toEqual({ start: "2026-01-01", end: "2026-03-31" });
        expect(yamlReportToDefinition(document)).toEqual(report);
    });
});
