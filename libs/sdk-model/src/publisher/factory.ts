// (C) 2026 GoodData Corporation

import { type IPublisherDocumentContent, type IPublisherDocumentPage } from "./content.js";
import {
    type IPublisherDocument,
    type IPublisherDocumentDefinition,
    type IPublisherDocumentTemplate,
    type IPublisherDocumentTemplateDefinition,
} from "./document.js";
import { type PublisherPageLayoutNode, isPublisherLayoutSection } from "./layout.js";
import {
    type IPublisherPageBody,
    type IPublisherPageLayout,
    type IPublisherPageLayoutContent,
    type IPublisherPageLayoutDefinition,
} from "./pageLayout.js";
import { type PublisherSlot } from "./slot.js";
import { type IPublisherBoxStyle, isPublisherImageBackground } from "./styling.js";
import { type PublisherDateString } from "./variables.js";

function generatePublisherLocalId(prefix: string): string {
    const unique =
        typeof crypto !== "undefined" && typeof crypto.randomUUID === "function"
            ? crypto.randomUUID().replace(/-/g, "").slice(0, 12)
            : Math.random().toString(36).slice(2, 14);
    return `${prefix}_${unique}`;
}

function deepClone<T>(value: T): T {
    return JSON.parse(JSON.stringify(value)) as T;
}

function prefixBackgroundSlotId(
    style: IPublisherBoxStyle | undefined,
    prefix: string,
): IPublisherBoxStyle | undefined {
    if (!style?.background || !isPublisherImageBackground(style.background)) {
        return style;
    }
    return {
        ...style,
        background: { ...style.background, slotId: `${prefix}_${style.background.slotId}` },
    };
}

function prefixLayoutSlotIds(node: PublisherPageLayoutNode, prefix: string): PublisherPageLayoutNode {
    if (isPublisherLayoutSection(node)) {
        return {
            ...node,
            ...(node.style === undefined ? {} : { style: prefixBackgroundSlotId(node.style, prefix) }),
            children: node.children.map((child) => prefixLayoutSlotIds(child, prefix)),
        };
    }
    return {
        ...node,
        slotId: `${prefix}_${node.slotId}`,
    };
}

/**
 * Creates a new page layout definition.
 *
 * @alpha
 */
export function newPublisherPageLayoutDefinition(
    title: string,
    body: IPublisherPageBody,
    modifications?: Partial<Omit<IPublisherPageLayoutDefinition, "type" | "title" | "content">>,
): IPublisherPageLayoutDefinition {
    const content: IPublisherPageLayoutContent = { version: "1", ...body };
    return {
        type: "reportPageLayout",
        title,
        content,
        ...modifications,
    };
}

/**
 * Clones a page layout into a page instance embeddable in template/document content.
 *
 * @remarks
 * The body is deep-copied and detached from the source page — no reference is kept.
 * Slot localIdentifiers (and the layout slotIds pointing at them) are prefixed with the
 * page-instance localIdentifier, so one page used repeatedly in the same content stays unique.
 *
 * @alpha
 */
export function newPublisherDocumentPageFromLayout(
    page: IPublisherPageLayout | IPublisherPageLayoutDefinition,
    localIdentifier: string = generatePublisherLocalId("page"),
): IPublisherDocumentPage {
    const { version: _version, ...body } = deepClone(page.content);
    return {
        ...body,
        localIdentifier,
        ...(body.style === undefined ? {} : { style: prefixBackgroundSlotId(body.style, localIdentifier) }),
        layout: prefixLayoutSlotIds(body.layout, localIdentifier),
        slots: body.slots.map((slot): PublisherSlot => ({
            ...slot,
            localIdentifier: `${localIdentifier}_${slot.localIdentifier}`,
        })),
    };
}

/**
 * Creates document content from page instances.
 *
 * @alpha
 */
export function newPublisherDocumentContent(
    pages: IPublisherDocumentPage[],
    modifications?: Partial<Omit<IPublisherDocumentContent, "version" | "pages">>,
): IPublisherDocumentContent {
    return {
        version: "1",
        pages,
        ...modifications,
    };
}

/**
 * Creates a new document template definition.
 *
 * @alpha
 */
export function newPublisherDocumentTemplateDefinition(
    title: string,
    content: IPublisherDocumentContent,
    modifications?: Partial<Omit<IPublisherDocumentTemplateDefinition, "type" | "title" | "content">>,
): IPublisherDocumentTemplateDefinition {
    return {
        type: "reportTemplate",
        title,
        content,
        ...modifications,
    };
}

/**
 * Creates a document definition from a template.
 *
 * @remarks
 * The template content is deep-copied; no reference to the template is kept, so the
 * document stays frozen while the template evolves.
 *
 * @alpha
 */
export function newPublisherDocumentDefinitionFromTemplate(
    template: IPublisherDocumentTemplate | IPublisherDocumentTemplateDefinition,
    options: {
        title: string;
        periodStart: PublisherDateString;
        periodEnd: PublisherDateString;
    },
    modifications?: Partial<
        Omit<IPublisherDocumentDefinition, "type" | "title" | "periodStart" | "periodEnd" | "content">
    >,
): IPublisherDocumentDefinition {
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
 * Creates an ad-hoc document definition not based on any template.
 *
 * @alpha
 */
export function newAdHocPublisherDocumentDefinition(
    options: {
        title: string;
        periodStart: PublisherDateString;
        periodEnd: PublisherDateString;
        pages?: IPublisherDocumentPage[];
    },
    modifications?: Partial<
        Omit<IPublisherDocumentDefinition, "type" | "title" | "periodStart" | "periodEnd" | "content">
    >,
): IPublisherDocumentDefinition {
    return {
        type: "report",
        title: options.title,
        periodStart: options.periodStart,
        periodEnd: options.periodEnd,
        content: newPublisherDocumentContent(options.pages ?? []),
        ...modifications,
    };
}

/**
 * Convenience accessor for a document or template page by its localIdentifier.
 *
 * @alpha
 */
export function publisherDocumentPage(
    documentOrTemplate:
        | IPublisherDocument
        | IPublisherDocumentDefinition
        | IPublisherDocumentTemplate
        | IPublisherDocumentTemplateDefinition,
    pageLocalIdentifier: string,
): IPublisherDocumentPage | undefined {
    return documentOrTemplate.content.pages.find((page) => page.localIdentifier === pageLocalIdentifier);
}
