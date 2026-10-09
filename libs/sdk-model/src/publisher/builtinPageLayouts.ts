// (C) 2026 GoodData Corporation

import { idRef } from "../objRef/factory.js";

import { type PublisherPageLayoutNode } from "./layout.js";
import { type PublisherPageFormat } from "./pageFormat.js";
import { type IPublisherPageBody, type IPublisherPageLayout } from "./pageLayout.js";
import {
    type IPublisherHeadingSlot,
    type IPublisherImageSlot,
    type IPublisherParagraphSlot,
    type IPublisherVisualizationSlot,
} from "./slot.js";
import { type PublisherHeadingType, type PublisherParagraphType } from "./styling.js";

type TextSlotSpec = { localIdentifier: string } & (
    | { hint: string; content?: never }
    | { content: string; hint?: never }
);

const textSource = (spec: TextSlotSpec) =>
    spec.content === undefined
        ? ({ placeholder: { hint: spec.hint } } as const)
        : ({ source: { type: "static", content: spec.content } } as const);

const headingSlot = (spec: TextSlotSpec & { type: PublisherHeadingType }): IPublisherHeadingSlot => ({
    type: "heading",
    localIdentifier: spec.localIdentifier,
    style: { type: spec.type },
    ...textSource(spec),
});

const paragraphSlot = (spec: TextSlotSpec & { type: PublisherParagraphType }): IPublisherParagraphSlot => ({
    type: "paragraph",
    localIdentifier: spec.localIdentifier,
    style: { type: spec.type },
    ...textSource(spec),
});

// The prompt is what makes the text AI-written, so a takeaway nobody has instructed yet carries an
// empty one rather than none.
const takeawaySlot = (localIdentifier: string): IPublisherParagraphSlot => ({
    type: "paragraph",
    localIdentifier,
    style: { type: "normalText" },
    source: { type: "ai", prompt: "" },
    placeholder: { hint: "Generate or write takeaway ..." },
});

const vizSlot = (localIdentifier: string): IPublisherVisualizationSlot => ({
    type: "visualization",
    localIdentifier,
    showTitle: true,
    placeholder: { hint: "Add a visualization" },
});

const logoSlot = (localIdentifier: string): IPublisherImageSlot => ({
    type: "image",
    localIdentifier,
    source: { type: "url", url: "{logo}" },
    fit: "contain",
    altText: "Logo",
    style: { horizontalAlign: "start", verticalAlign: "end" },
});

const slot = (slotId: string, weight?: number): PublisherPageLayoutNode => ({
    type: "slotRef",
    slotId,
    ...(weight === undefined ? {} : { weight }),
});

const row = (children: PublisherPageLayoutNode[], weight?: number): PublisherPageLayoutNode => ({
    type: "section",
    direction: "row",
    children,
    ...(weight === undefined ? {} : { weight }),
});

const column = (children: PublisherPageLayoutNode[], weight?: number): PublisherPageLayoutNode => ({
    type: "section",
    direction: "column",
    children,
    ...(weight === undefined ? {} : { weight }),
});

const footerSlots = () => {
    const pageNumber = paragraphSlot({
        localIdentifier: "footerPageNumber",
        type: "largeText",
        content: "{currentPageNumber} / {totalPages}",
    });
    return [
        logoSlot("footerLogo"),
        {
            ...pageNumber,
            style: { ...pageNumber.style, horizontalAlign: "end", verticalAlign: "end" },
        } satisfies IPublisherParagraphSlot,
    ];
};

const footerRow = () => row([slot("footerLogo", 1), slot("footerPageNumber", 8)], 1);

interface IWidescreenPageSpec {
    vizRows: string[][];
    /**
     * Adds a column on the right: text written by hand, or a takeaway generated from the
     * visualizations beside it.
     */
    summary?: "text" | "takeaway";
    gridWeights?: number[];
}

const vizGrid = ({ vizRows, gridWeights }: IWidescreenPageSpec, weight: number): PublisherPageLayoutNode =>
    vizRows.length === 1
        ? row(
              vizRows[0]!.map((id, index) => slot(id, gridWeights?.[index])),
              weight,
          )
        : column(
              vizRows.map((ids) => row(ids.map((id) => slot(id)))),
              weight,
          );

const widescreenContentPage = (spec: IWidescreenPageSpec): IPublisherPageBody => {
    const { vizRows, summary } = spec;
    const body = summary === undefined ? vizGrid(spec, 9) : row([vizGrid(spec, 2), slot("summary", 1)], 9);

    return {
        kind: "content",
        format: "widescreen",
        layout: column([slot("pageTitle", 2), body, footerRow()]),
        slots: [
            headingSlot({ localIdentifier: "pageTitle", type: "h1", hint: "Page title" }),
            ...vizRows.flat().map(vizSlot),
            ...(summary === "text"
                ? [paragraphSlot({ localIdentifier: "summary", type: "normalText", hint: "Add a summary" })]
                : []),
            ...(summary === "takeaway" ? [takeawaySlot("summary")] : []),
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

const builtInPage = ({
    id,
    title,
    description,
    body,
}: {
    id: string;
    title: string;
    description: string;
    body: IPublisherPageBody;
}): IPublisherPageLayout =>
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
 * Built-in cover page: document title and subtitle.
 *
 * @alpha
 */
export const BuiltInPublisherPageLayoutCover: IPublisherPageLayout = builtInPage({
    id: "cover",
    title: "Cover",
    description: "Title page",
    body: {
        kind: "cover",
        format: "widescreen",
        layout: column([slot("coverTitle", 2), slot("coverSubtitle", 1), footerRow()]),
        slots: [
            headingSlot({ localIdentifier: "coverTitle", type: "h1", content: "{reportName}" }),
            headingSlot({
                localIdentifier: "coverSubtitle",
                type: "h3",
                content: "{periodStart} – {periodEnd}",
            }),
            ...footerSlots(),
        ],
    },
});

/**
 * Built-in section divider page.
 *
 * @alpha
 */
export const BuiltInPublisherPageLayoutSection: IPublisherPageLayout = builtInPage({
    id: "section",
    title: "Section",
    description: "Section divider page",
    body: {
        kind: "section",
        format: "widescreen",
        layout: column([slot("sectionTitle", 9), footerRow()]),
        slots: [
            headingSlot({ localIdentifier: "sectionTitle", type: "h2", hint: "Section title" }),
            ...footerSlots(),
        ],
    },
});

const widescreenContentPages: [id: string, title: string, description: string, spec: IWidescreenPageSpec][] =
    [
        ["viz1", "1 visualization", "Single full-width visualization", { vizRows: vizIds(1, 1) }],
        [
            "viz1SummaryRight",
            "1 visualization + summary",
            "Single visualization with a summary column on the right",
            { vizRows: vizIds(1, 1), summary: "text" },
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
            { vizRows: vizIds(2, 2), summary: "text" },
        ],
        [
            "viz2TakeawayRight",
            "2 visualizations + takeaway",
            "Two visualizations with an AI takeaway column on the right",
            { vizRows: vizIds(2, 2), summary: "takeaway" },
        ],
        ["viz3", "3 visualizations", "Three visualizations side by side", { vizRows: vizIds(3, 3) }],
        [
            "viz3SummaryRight",
            "3 visualizations + summary",
            "Three visualizations with a summary column on the right",
            { vizRows: vizIds(3, 3), summary: "text" },
        ],
        ["viz4", "4 visualizations", "Four visualizations in a 2x2 grid", { vizRows: vizIds(4, 2) }],
        [
            "viz4SummaryRight",
            "4 visualizations + summary",
            "2x2 visualization grid with a summary column on the right",
            { vizRows: vizIds(4, 2), summary: "text" },
        ],
        ["viz6", "6 visualizations", "Six visualizations in a 2x3 grid", { vizRows: vizIds(6, 2) }],
        [
            "viz6SummaryRight",
            "6 visualizations + summary",
            "3x2 visualization grid with a summary column on the right",
            { vizRows: vizIds(6, 2), summary: "text" },
        ],
    ];

/**
 * Built-in content page with six visualizations and a text column on the left.
 *
 * @alpha
 */
export const BuiltInPublisherPageLayoutViz6TextLeft: IPublisherPageLayout = builtInPage({
    id: "viz6TextLeft",
    title: "6 visualizations + text",
    description: "Two rows of three visualizations with a text column on the left",
    body: {
        kind: "content",
        format: "widescreen",
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
            headingSlot({ localIdentifier: "pageTitle", type: "h1", hint: "Page title" }),
            paragraphSlot({ localIdentifier: "text1", type: "largeText", hint: "Add a text" }),
            paragraphSlot({ localIdentifier: "text2", type: "largeText", hint: "Add a text" }),
            ...["widget1", "widget2", "widget3", "widget4", "widget5", "widget6"].map(vizSlot),
            ...footerSlots(),
        ],
    },
});

//
// Portrait pages, for documents printed or exported as an A4 / Letter PDF. An upright page fits at
// most two visualizations side by side, so these layouts stack rows down the page instead of
// spreading them across it, and the title band takes a smaller share of the taller page.
//

const PORTRAIT_FORMAT: PublisherPageFormat = "a4Portrait";

interface IPortraitPageSpec {
    /** Visualization rows, top to bottom. A row holding two ids places them side by side. */
    vizRows: string[][];
    /** Adds a body text block above the visualizations. */
    text?: boolean;
    /** Adds a summary text block below the visualizations. */
    summary?: boolean;
}

const portraitContentPage = ({ vizRows, text, summary }: IPortraitPageSpec): IPublisherPageBody => {
    const bodyChildren: PublisherPageLayoutNode[] = [
        ...(text ? [slot("text1", 2)] : []),
        ...vizRows.map((ids) =>
            row(
                ids.map((id) => slot(id)),
                3,
            ),
        ),
        ...(summary ? [slot("summary", 2)] : []),
    ];

    return {
        kind: "content",
        format: PORTRAIT_FORMAT,
        layout: column([slot("pageTitle", 1), column(bodyChildren, 10), footerRow()]),
        slots: [
            headingSlot({ localIdentifier: "pageTitle", type: "h1", hint: "Page title" }),
            ...(text
                ? [paragraphSlot({ localIdentifier: "text1", type: "largeText", hint: "Add a text" })]
                : []),
            ...vizRows.flat().map(vizSlot),
            ...(summary
                ? [paragraphSlot({ localIdentifier: "summary", type: "normalText", hint: "Add a summary" })]
                : []),
            ...footerSlots(),
        ],
    };
};

/**
 * Built-in portrait cover page: document title and subtitle.
 *
 * @alpha
 */
export const BuiltInPublisherPageLayoutPortraitCover: IPublisherPageLayout = builtInPage({
    id: "portraitCover",
    title: "Cover (portrait)",
    description: "Title page of an upright document",
    body: {
        kind: "cover",
        format: PORTRAIT_FORMAT,
        layout: column([slot("coverTitle", 2), slot("coverSubtitle", 1), footerRow()]),
        slots: [
            headingSlot({ localIdentifier: "coverTitle", type: "h1", content: "{reportName}" }),
            headingSlot({
                localIdentifier: "coverSubtitle",
                type: "h3",
                content: "{periodStart} – {periodEnd}",
            }),
            ...footerSlots(),
        ],
    },
});

/**
 * Built-in portrait section divider page.
 *
 * @alpha
 */
export const BuiltInPublisherPageLayoutPortraitSection: IPublisherPageLayout = builtInPage({
    id: "portraitSection",
    title: "Section (portrait)",
    description: "Section divider page of an upright document",
    body: {
        kind: "section",
        format: PORTRAIT_FORMAT,
        layout: column([slot("sectionTitle", 9), footerRow()]),
        slots: [
            headingSlot({ localIdentifier: "sectionTitle", type: "h2", hint: "Section title" }),
            ...footerSlots(),
        ],
    },
});

/**
 * Built-in portrait page carrying a full-page narrative, with no visualization.
 *
 * @alpha
 */
export const BuiltInPublisherPageLayoutPortraitSummary: IPublisherPageLayout = builtInPage({
    id: "portraitSummary",
    title: "Summary (portrait)",
    description: "Full-page narrative with no visualization",
    body: {
        kind: "content",
        format: PORTRAIT_FORMAT,
        layout: column([slot("pageTitle", 1), slot("summary", 10), footerRow()]),
        slots: [
            headingSlot({ localIdentifier: "pageTitle", type: "h1", hint: "Page title" }),
            paragraphSlot({ localIdentifier: "summary", type: "normalText", hint: "Add a summary" }),
            ...footerSlots(),
        ],
    },
});

const portraitContentPages: [id: string, title: string, description: string, spec: IPortraitPageSpec][] = [
    [
        "portraitViz1",
        "1 visualization (portrait)",
        "Single visualization filling an upright page",
        { vizRows: [["widget1"]] },
    ],
    [
        "portraitViz1Summary",
        "1 visualization + summary (portrait)",
        "One visualization with a summary below it",
        { vizRows: [["widget1"]], summary: true },
    ],
    [
        "portraitViz2",
        "2 visualizations (portrait)",
        "Two visualizations stacked down the page",
        { vizRows: [["widget1"], ["widget2"]] },
    ],
    [
        "portraitViz2Text",
        "2 visualizations + text (portrait)",
        "Two stacked visualizations under a block of text",
        { vizRows: [["widget1"], ["widget2"]], text: true },
    ],
    [
        "portraitViz3",
        "3 visualizations (portrait)",
        "Three visualizations stacked down the page",
        { vizRows: [["widget1"], ["widget2"], ["widget3"]] },
    ],
    [
        "portraitViz4",
        "4 visualizations (portrait)",
        "Four visualizations in a 2x2 grid on an upright page",
        {
            vizRows: [
                ["widget1", "widget2"],
                ["widget3", "widget4"],
            ],
        },
    ],
];

/**
 * All built-in page layouts served by the SPI. Built-ins are read-only: they cannot be
 * edited or deleted, and they are never persisted on the backend.
 *
 * @alpha
 */
export const BuiltInPublisherPageLayouts: readonly IPublisherPageLayout[] = Object.freeze([
    BuiltInPublisherPageLayoutCover,
    BuiltInPublisherPageLayoutSection,
    ...widescreenContentPages.map(([id, title, description, spec]) =>
        builtInPage({ id, title, description, body: widescreenContentPage(spec) }),
    ),
    BuiltInPublisherPageLayoutViz6TextLeft,
    BuiltInPublisherPageLayoutPortraitCover,
    BuiltInPublisherPageLayoutPortraitSection,
    BuiltInPublisherPageLayoutPortraitSummary,
    ...portraitContentPages.map(([id, title, description, spec]) =>
        builtInPage({ id, title, description, body: portraitContentPage(spec) }),
    ),
]);
