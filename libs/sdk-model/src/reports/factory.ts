// (C) 2026 GoodData Corporation

import { type IReportContent, type IReportContentPage } from "./content.js";
import { type ReportPageLayoutNode, isReportLayoutSection } from "./layout.js";
import {
    type IReportPageBody,
    type IReportPageLayout,
    type IReportPageLayoutContent,
    type IReportPageLayoutDefinition,
} from "./pageLayout.js";
import {
    type IReport,
    type IReportDefinition,
    type IReportTemplate,
    type IReportTemplateDefinition,
} from "./report.js";
import { type ReportSlot } from "./slot.js";
import { type ReportDateString } from "./variables.js";

function generateReportLocalId(prefix: string): string {
    const unique =
        typeof crypto !== "undefined" && typeof crypto.randomUUID === "function"
            ? crypto.randomUUID().replace(/-/g, "").slice(0, 12)
            : Math.random().toString(36).slice(2, 14);
    return `${prefix}_${unique}`;
}

function deepClone<T>(value: T): T {
    return JSON.parse(JSON.stringify(value)) as T;
}

function prefixLayoutSlotIds(node: ReportPageLayoutNode, prefix: string): ReportPageLayoutNode {
    if (isReportLayoutSection(node)) {
        return {
            ...node,
            children: node.children.map((child) => prefixLayoutSlotIds(child, prefix)),
        };
    }
    return {
        ...node,
        slotId: `${prefix}_${node.slotId}`,
    };
}

/**
 * Creates a new report page definition.
 *
 * @alpha
 */
export function newReportPageLayoutDefinition(
    title: string,
    body: IReportPageBody,
    modifications?: Partial<Omit<IReportPageLayoutDefinition, "type" | "title" | "content">>,
): IReportPageLayoutDefinition {
    const content: IReportPageLayoutContent = { version: "1", ...body };
    return {
        type: "reportPageLayout",
        title,
        content,
        ...modifications,
    };
}

/**
 * Clones a report page into a page instance embeddable in template/report content.
 *
 * @remarks
 * The body is deep-copied and detached from the source page — no reference is kept.
 * Slot localIdentifiers (and the layout slotIds pointing at them) are prefixed with the
 * page-instance localIdentifier, so one page used repeatedly in the same content stays unique.
 *
 * @alpha
 */
export function newReportContentPageFromLayout(
    page: IReportPageLayout | IReportPageLayoutDefinition,
    localIdentifier: string = generateReportLocalId("page"),
): IReportContentPage {
    const { version: _version, ...body } = deepClone(page.content);
    return {
        ...body,
        localIdentifier,
        layout: prefixLayoutSlotIds(body.layout, localIdentifier),
        slots: body.slots.map(
            (slot): ReportSlot => ({
                ...slot,
                localIdentifier: `${localIdentifier}_${slot.localIdentifier}`,
            }),
        ),
    };
}

/**
 * Creates report content from page instances.
 *
 * @alpha
 */
export function newReportContent(
    pages: IReportContentPage[],
    modifications?: Partial<Omit<IReportContent, "version" | "pages">>,
): IReportContent {
    return {
        version: "1",
        pages,
        ...modifications,
    };
}

/**
 * Creates a new report template definition.
 *
 * @alpha
 */
export function newReportTemplateDefinition(
    title: string,
    content: IReportContent,
    modifications?: Partial<Omit<IReportTemplateDefinition, "type" | "title" | "content">>,
): IReportTemplateDefinition {
    return {
        type: "reportTemplate",
        title,
        content,
        ...modifications,
    };
}

/**
 * Creates a report definition from a template.
 *
 * @remarks
 * The template content is deep-copied; no reference to the template is kept, so the
 * report stays frozen while the template evolves.
 *
 * @alpha
 */
export function newReportDefinitionFromTemplate(
    template: IReportTemplate | IReportTemplateDefinition,
    options: {
        title: string;
        periodStart: ReportDateString;
        periodEnd: ReportDateString;
    },
    modifications?: Partial<
        Omit<IReportDefinition, "type" | "title" | "periodStart" | "periodEnd" | "content">
    >,
): IReportDefinition {
    return {
        type: "report",
        title: options.title,
        periodStart: options.periodStart,
        periodEnd: options.periodEnd,
        content: deepClone(template.content),
        ...modifications,
    };
}

/**
 * Creates an ad-hoc report definition not based on any template.
 *
 * @alpha
 */
export function newAdHocReportDefinition(
    options: {
        title: string;
        periodStart: ReportDateString;
        periodEnd: ReportDateString;
        pages?: IReportContentPage[];
    },
    modifications?: Partial<
        Omit<IReportDefinition, "type" | "title" | "periodStart" | "periodEnd" | "content">
    >,
): IReportDefinition {
    return {
        type: "report",
        title: options.title,
        periodStart: options.periodStart,
        periodEnd: options.periodEnd,
        content: newReportContent(options.pages ?? []),
        ...modifications,
    };
}

/**
 * Convenience accessor for a report or template page by its localIdentifier.
 *
 * @alpha
 */
export function reportContentPage(
    reportOrTemplate: IReport | IReportDefinition | IReportTemplate | IReportTemplateDefinition,
    pageLocalIdentifier: string,
): IReportContentPage | undefined {
    return reportOrTemplate.content.pages.find((page) => page.localIdentifier === pageLocalIdentifier);
}
