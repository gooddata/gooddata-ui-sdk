// (C) 2026 GoodData Corporation

import { type IPublisherDocumentContentV1, type IPublisherDocumentPageV1 } from "./content.js";
import {
    type IPublisherDocumentDefinitionV1,
    type IPublisherDocumentTemplateDefinitionV1,
    type IPublisherDocumentTemplateV1,
    type IPublisherDocumentV1,
} from "./document.js";
import { type PublisherPageLayoutNodeV1, isPublisherLayoutSectionV1 } from "./layout.js";
import {
    type IPublisherPageBodyV1,
    type IPublisherPageLayoutContentV1,
    type IPublisherPageLayoutDefinitionV1,
    type IPublisherPageLayoutV1,
} from "./pageLayout.js";
import { type PublisherSlotV1 } from "./slot.js";
import { type IPublisherBoxStyleV1, isPublisherImageBackgroundV1 } from "./styling.js";
import { type PublisherDateStringV1 } from "./variables.js";

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
    style: IPublisherBoxStyleV1 | undefined,
    prefix: string,
): IPublisherBoxStyleV1 | undefined {
    if (!style?.background || !isPublisherImageBackgroundV1(style.background)) {
        return style;
    }
    return {
        ...style,
        background: { ...style.background, slotId: `${prefix}_${style.background.slotId}` },
    };
}

function prefixLayoutSlotIds(node: PublisherPageLayoutNodeV1, prefix: string): PublisherPageLayoutNodeV1 {
    if (isPublisherLayoutSectionV1(node)) {
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
export function newPublisherPageLayoutDefinitionV1(
    title: string,
    body: IPublisherPageBodyV1,
    modifications?: Partial<Omit<IPublisherPageLayoutDefinitionV1, "type" | "title" | "content">>,
): IPublisherPageLayoutDefinitionV1 {
    const content: IPublisherPageLayoutContentV1 = { version: "1", ...body };
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
export function newPublisherDocumentPageFromLayoutV1(
    page: IPublisherPageLayoutV1 | IPublisherPageLayoutDefinitionV1,
    localIdentifier: string = generatePublisherLocalId("page"),
): IPublisherDocumentPageV1 {
    const { version: _version, ...body } = deepClone(page.content);
    return {
        ...body,
        localIdentifier,
        ...(body.style === undefined ? {} : { style: prefixBackgroundSlotId(body.style, localIdentifier) }),
        layout: prefixLayoutSlotIds(body.layout, localIdentifier),
        slots: body.slots.map((slot): PublisherSlotV1 => ({
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
export function newPublisherDocumentContentV1(
    pages: IPublisherDocumentPageV1[],
    modifications?: Partial<Omit<IPublisherDocumentContentV1, "version" | "pages">>,
): IPublisherDocumentContentV1 {
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
export function newPublisherDocumentTemplateDefinitionV1(
    title: string,
    content: IPublisherDocumentContentV1,
    modifications?: Partial<Omit<IPublisherDocumentTemplateDefinitionV1, "type" | "title" | "content">>,
): IPublisherDocumentTemplateDefinitionV1 {
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
export function newPublisherDocumentDefinitionFromTemplateV1(
    template: IPublisherDocumentTemplateV1 | IPublisherDocumentTemplateDefinitionV1,
    options: {
        title: string;
        periodStart: PublisherDateStringV1;
        periodEnd: PublisherDateStringV1;
    },
    modifications?: Partial<
        Omit<IPublisherDocumentDefinitionV1, "type" | "title" | "periodStart" | "periodEnd" | "content">
    >,
): IPublisherDocumentDefinitionV1 {
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
export function newAdHocPublisherDocumentDefinitionV1(
    options: {
        title: string;
        periodStart: PublisherDateStringV1;
        periodEnd: PublisherDateStringV1;
        pages?: IPublisherDocumentPageV1[];
    },
    modifications?: Partial<
        Omit<IPublisherDocumentDefinitionV1, "type" | "title" | "periodStart" | "periodEnd" | "content">
    >,
): IPublisherDocumentDefinitionV1 {
    return {
        type: "report",
        title: options.title,
        periodStart: options.periodStart,
        periodEnd: options.periodEnd,
        content: newPublisherDocumentContentV1(options.pages ?? []),
        ...modifications,
    };
}

/**
 * Convenience accessor for a document or template page by its localIdentifier.
 *
 * @alpha
 */
export function publisherDocumentPageV1(
    documentOrTemplate:
        | IPublisherDocumentV1
        | IPublisherDocumentDefinitionV1
        | IPublisherDocumentTemplateV1
        | IPublisherDocumentTemplateDefinitionV1,
    pageLocalIdentifier: string,
): IPublisherDocumentPageV1 | undefined {
    return documentOrTemplate.content.pages.find((page) => page.localIdentifier === pageLocalIdentifier);
}
