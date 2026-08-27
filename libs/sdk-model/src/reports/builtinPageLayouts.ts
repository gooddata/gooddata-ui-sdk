// (C) 2026 GoodData Corporation

import { idRef } from "../objRef/factory.js";

import { type ReportPageLayoutNode } from "./layout.js";
import { type IReportPageBody, type IReportPageLayout } from "./pageLayout.js";
import { type IReportImageSlot, type IReportTextSlot, type IReportVisualizationSlot } from "./slot.js";

const textSlot = (
    localIdentifier: string,
    kind: IReportTextSlot["kind"],
    hint: string,
    content?: string,
): IReportTextSlot => ({
    type: "text",
    localIdentifier,
    kind,
    ...(content === undefined ? { placeholder: { hint } } : { source: { type: "static", content } }),
});

const vizSlot = (localIdentifier: string): IReportVisualizationSlot => ({
    type: "visualization",
    localIdentifier,
    showTitle: true,
    placeholder: { hint: "Add a visualization" },
});

const logoSlot = (localIdentifier: string): IReportImageSlot => ({
    type: "image",
    localIdentifier,
    source: { type: "url", url: "{{logo}}" },
    fit: "contain",
    altText: "Logo",
});

const slot = (slotId: string, weight?: number): ReportPageLayoutNode => ({
    type: "slotRef",
    slotId,
    ...(weight === undefined ? {} : { weight }),
});

const row = (children: ReportPageLayoutNode[], weight?: number): ReportPageLayoutNode => ({
    type: "section",
    direction: "row",
    children,
    ...(weight === undefined ? {} : { weight }),
});

const column = (children: ReportPageLayoutNode[], weight?: number): ReportPageLayoutNode => ({
    type: "section",
    direction: "column",
    children,
    ...(weight === undefined ? {} : { weight }),
});

const footerSlots = () => [
    logoSlot("footerLogo"),
    textSlot("footerPageNumber", "custom", "", "{{pageNumber}} / {{totalPages}}"),
];

const footerRow = () => row([slot("footerLogo", 1), slot("footerPageNumber", 8)], 1);

interface IContentPageSpec {
    vizRows: string[][];
    summary?: boolean;
    gridWeights?: number[];
}

const vizGrid = ({ vizRows, gridWeights }: IContentPageSpec, weight: number): ReportPageLayoutNode =>
    vizRows.length === 1
        ? row(
              vizRows[0]!.map((id, index) => slot(id, gridWeights?.[index])),
              weight,
          )
        : column(
              vizRows.map((ids) => row(ids.map((id) => slot(id)))),
              weight,
          );

const contentPage = (spec: IContentPageSpec): IReportPageBody => {
    const { vizRows, summary } = spec;
    const body = summary ? row([vizGrid(spec, 2), slot("summary", 1)], 9) : vizGrid(spec, 9);

    return {
        kind: "content",
        layout: column([slot("pageTitle", 2), body, footerRow()]),
        slots: [
            textSlot("pageTitle", "title", "Page title"),
            ...vizRows.flat().map(vizSlot),
            ...(summary ? [textSlot("summary", "summary", "Add a summary")] : []),
            ...footerSlots(),
        ],
    };
};

const vizIds = (count: number, perRow: number): string[][] => {
    const rows: string[][] = [];
    for (let index = 0; index < count; index++) {
        const rowIndex = Math.floor(index / perRow);
        (rows[rowIndex] ??= []).push(`widget${index + 1}`);
    }
    return rows;
};

// Built-ins are shared singletons served by every backend implementation;
// freezing makes accidental mutation by a consumer throw instead of corrupting them.
function deepFreeze<T>(value: T): T {
    if (value && typeof value === "object" && !Object.isFrozen(value)) {
        Object.freeze(value);
        for (const key of Object.keys(value)) {
            deepFreeze((value as Record<string, unknown>)[key]);
        }
    }
    return value;
}

const builtInPage = (
    id: string,
    title: string,
    description: string,
    body: IReportPageBody,
): IReportPageLayout =>
    deepFreeze({
        type: "reportPageLayout",
        ref: idRef(`builtin.reportPageLayout.${id}`, "reportPageLayout"),
        title,
        description,
        content: { version: "1", ...body },
        isBuiltIn: true,
        isLocked: true,
    });

/**
 * Built-in cover page: report title and subtitle.
 *
 * @alpha
 */
export const BuiltInReportPageLayoutCover: IReportPageLayout = builtInPage("cover", "Cover", "Title page", {
    kind: "cover",
    layout: column([slot("coverTitle", 2), slot("coverSubtitle", 1), footerRow()]),
    slots: [
        textSlot("coverTitle", "title", "Report title", "{{reportTitle}}"),
        textSlot("coverSubtitle", "subtitle", "Subtitle", "{{periodStart}} – {{periodEnd}}"),
        ...footerSlots(),
    ],
});

/**
 * Built-in section divider page.
 *
 * @alpha
 */
export const BuiltInReportPageLayoutSection: IReportPageLayout = builtInPage(
    "section",
    "Section",
    "Section divider page",
    {
        kind: "section",
        layout: column([slot("sectionTitle", 9), footerRow()]),
        slots: [textSlot("sectionTitle", "sectionTitle", "Section title"), ...footerSlots()],
    },
);

const contentPages: [id: string, title: string, description: string, spec: IContentPageSpec][] = [
    ["viz1", "1 visualization", "Single full-width visualization", { vizRows: vizIds(1, 1) }],
    [
        "viz1SummaryRight",
        "1 visualization + summary",
        "Single visualization with a summary column on the right",
        { vizRows: vizIds(1, 1), summary: true },
    ],
    ["viz2", "2 visualizations", "Two visualizations side by side", { vizRows: vizIds(2, 2) }],
    [
        "viz2Wide",
        "2 visualizations (wide left)",
        "Two visualizations, the left one twice as wide",
        { vizRows: vizIds(2, 2), gridWeights: [2, 1] },
    ],
    [
        "viz2Narrow",
        "2 visualizations (wide right)",
        "Two visualizations, the right one twice as wide",
        { vizRows: vizIds(2, 2), gridWeights: [1, 2] },
    ],
    [
        "viz2SummaryRight",
        "2 visualizations + summary",
        "Two visualizations with a summary column on the right",
        { vizRows: vizIds(2, 2), summary: true },
    ],
    ["viz3", "3 visualizations", "Three visualizations side by side", { vizRows: vizIds(3, 3) }],
    [
        "viz3SummaryRight",
        "3 visualizations + summary",
        "Three visualizations with a summary column on the right",
        { vizRows: vizIds(3, 3), summary: true },
    ],
    ["viz4", "4 visualizations", "Four visualizations in a 2x2 grid", { vizRows: vizIds(4, 2) }],
    [
        "viz4SummaryRight",
        "4 visualizations + summary",
        "2x2 visualization grid with a summary column on the right",
        { vizRows: vizIds(4, 2), summary: true },
    ],
    ["viz6", "6 visualizations", "Six visualizations in a 2x3 grid", { vizRows: vizIds(6, 2) }],
    [
        "viz6SummaryRight",
        "6 visualizations + summary",
        "3x2 visualization grid with a summary column on the right",
        { vizRows: vizIds(6, 2), summary: true },
    ],
];

/**
 * Built-in content page with six visualizations and a text column on the left.
 *
 * @alpha
 */
export const BuiltInReportPageLayoutViz6TextLeft: IReportPageLayout = builtInPage(
    "viz6TextLeft",
    "6 visualizations + text",
    "Two rows of three visualizations with a text column on the left",
    {
        kind: "content",
        layout: column([
            slot("pageTitle", 2),
            column(
                [
                    row([slot("text1", 2), slot("widget1", 3), slot("widget2", 3), slot("widget3", 3)]),
                    row([slot("text2", 2), slot("widget4", 3), slot("widget5", 3), slot("widget6", 3)]),
                ],
                9,
            ),
            footerRow(),
        ]),
        slots: [
            textSlot("pageTitle", "title", "Page title"),
            textSlot("text1", "body", "Add a text"),
            textSlot("text2", "body", "Add a text"),
            ...["widget1", "widget2", "widget3", "widget4", "widget5", "widget6"].map(vizSlot),
            ...footerSlots(),
        ],
    },
);

/**
 * All built-in report pages served by the SPI. Built-ins are read-only: they cannot be
 * edited or deleted, and they are never persisted on the backend.
 *
 * @alpha
 */
export const BuiltInReportPageLayouts: readonly IReportPageLayout[] = Object.freeze([
    BuiltInReportPageLayoutCover,
    BuiltInReportPageLayoutSection,
    ...contentPages.map(([id, title, description, spec]) =>
        builtInPage(id, title, description, contentPage(spec)),
    ),
    BuiltInReportPageLayoutViz6TextLeft,
]);
