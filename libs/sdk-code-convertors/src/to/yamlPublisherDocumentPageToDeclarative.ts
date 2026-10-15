// (C) 2026 GoodData Corporation

import type {
    ReportBackground,
    ReportBackgroundImage,
    ReportImage,
    ReportLayoutNode,
    ReportPageBody,
    ReportSlotPlaceholder,
    ReportText,
    ReportTextStyle,
} from "@gooddata/sdk-code-schemas/v1";
import {
    type IDashboardFilterReference,
    type IPublisherBoxStyleV1,
    type IPublisherDocumentPageV1,
    type IPublisherImageSlotV1,
    type IPublisherPageBodyV1,
    type IPublisherSlotPlaceholderV1,
    type IPublisherTextStyleV1,
    type PublisherImageFitV1,
    type PublisherLayoutNodeV1,
    type PublisherSlotV1,
    type PublisherTextSourceV1,
    idRef,
} from "@gooddata/sdk-model";

import { CoreErrorCode, type IErrorContext, newError, updateErrorContext } from "../utils/errors.js";
import { referencesAsStored } from "../utils/publisherFilterRefs.js";
import { filtersToDeclarative } from "../utils/publisherFilters.js";

import { yamlIgnoredFilterToDeclarative } from "./yamlDashboardToDeclarative.js";

/** The slots read out of the tree so far, which a leaf and a painted box both add to. */
interface IPageUnderConstruction {
    slots: PublisherSlotV1[];
}

function placeholderToDeclarative(
    placeholder: ReportSlotPlaceholder | undefined,
): IPublisherSlotPlaceholderV1 | undefined {
    if (placeholder === undefined) {
        return undefined;
    }
    if (typeof placeholder === "boolean") {
        return { required: placeholder };
    }
    if (typeof placeholder === "string") {
        return { hint: placeholder };
    }
    return placeholder;
}

function textToDeclarative(text: ReportText): PublisherTextSourceV1 | undefined {
    if (typeof text === "string") {
        // A slot written with no text has none, rather than text that happens to be empty: the key
        // is there because it is what says which kind of slot this is.
        return text === "" ? undefined : { type: "static", content: text };
    }
    if (text.prompt !== undefined) {
        return {
            type: "ai",
            prompt: text.prompt,
            ...(text.text === undefined ? {} : { content: text.text }),
            ...(text.generated_at === undefined ? {} : { generatedAt: text.generated_at }),
        };
    }
    // A mapping with neither a prompt nor any text states a slot that is declared but unwritten.
    return text.text === undefined ? undefined : { type: "static", content: text.text };
}

function textStyleToDeclarative(
    style: ReportTextStyle | undefined,
    page: IPageUnderConstruction,
): IPublisherTextStyleV1 | undefined {
    if (style === undefined) {
        return undefined;
    }
    if (typeof style === "string") {
        return { type: style } as IPublisherTextStyleV1;
    }
    const { horizontal_align, vertical_align, border_radius, background, ...rest } = style;
    return {
        ...rest,
        ...(horizontal_align === undefined ? {} : { horizontalAlign: horizontal_align }),
        ...(vertical_align === undefined ? {} : { verticalAlign: vertical_align }),
        ...(border_radius === undefined ? {} : { borderRadius: border_radius }),
        ...(background === undefined ? {} : { background: backgroundToDeclarative(background, page) }),
    } as IPublisherTextStyleV1;
}

/** The content of an image, without the identity of whatever draws it. */
function imageContentToDeclarative(image: ReportImage): Omit<IPublisherImageSlotV1, "localIdentifier"> {
    if (typeof image === "string") {
        return { type: "image", source: { type: "url", url: image } };
    }
    const { url, asset, alt_text, fit, style, placeholder } = image;
    const declaredPlaceholder = placeholderToDeclarative(placeholder);
    return {
        type: "image",
        ...(url === undefined ? {} : { source: { type: "url" as const, url } }),
        ...(asset === undefined ? {} : { source: { type: "asset" as const, ref: idRef(asset) } }),
        ...(alt_text === undefined ? {} : { altText: alt_text }),
        ...(fit === undefined ? {} : { fit: fit as PublisherImageFitV1 }),
        ...(style === undefined
            ? {}
            : {
                  style: {
                      ...(style.horizontal_align === undefined
                          ? {}
                          : { horizontalAlign: style.horizontal_align }),
                      ...(style.vertical_align === undefined ? {} : { verticalAlign: style.vertical_align }),
                  },
              }),
        ...(declaredPlaceholder === undefined ? {} : { placeholder: declaredPlaceholder }),
    };
}

/**
 * A backdrop is drawn from a slot of its own. Writing the image down adds that slot to the page;
 * naming one written down elsewhere - under another box, or by the leaf that places it - only
 * points at it again.
 */
function backgroundImageToDeclarative(image: ReportBackgroundImage, page: IPageUnderConstruction): string {
    if ("ref" in image) {
        return image.ref;
    }
    const { id, ...content } = image;
    page.slots.push({ ...imageContentToDeclarative(content), localIdentifier: id });
    return id;
}

function backgroundToDeclarative(
    background: ReportBackground,
    page: IPageUnderConstruction,
): IPublisherBoxStyleV1["background"] {
    if (typeof background === "string") {
        return { type: "color", color: background };
    }
    return { type: "image", slotId: backgroundImageToDeclarative(background.image, page) };
}

function boxStyleToDeclarative(
    style: { background?: ReportBackground; border_radius?: number; padding?: number } | undefined,
    page: IPageUnderConstruction,
): IPublisherBoxStyleV1 | undefined {
    if (style === undefined) {
        return undefined;
    }
    const { background, border_radius, padding } = style;
    return {
        ...(background === undefined ? {} : { background: backgroundToDeclarative(background, page) }),
        ...(border_radius === undefined ? {} : { borderRadius: border_radius }),
        ...(padding === undefined ? {} : { padding }),
    };
}

/** A node that draws content becomes a slot of its own and a reference to it in the tree. */
function layoutNodeToDeclarative(
    node: ReportLayoutNode,
    page: IPageUnderConstruction,
    errorContext?: IErrorContext,
): PublisherLayoutNodeV1 {
    const weight = "weight" in node && node.weight !== undefined ? { weight: node.weight } : {};

    if ("column" in node || "row" in node) {
        const direction = "column" in node ? ("column" as const) : ("row" as const);
        const children = ("column" in node ? node.column : node.row) ?? [];
        return {
            type: "section",
            direction,
            children: children.map((child) => layoutNodeToDeclarative(child, page, errorContext)),
            ...weight,
            ...(node.style === undefined ? {} : { style: boxStyleToDeclarative(node.style, page)! }),
        };
    }

    page.slots.push(slotToDeclarative(node, page, errorContext));
    return { type: "slotRef", slotId: node.id, ...weight };
}

function slotToDeclarative(
    node: ReportLayoutNode,
    page: IPageUnderConstruction,
    errorContext?: IErrorContext,
): PublisherSlotV1 {
    const placeholder = placeholderToDeclarative(
        "placeholder" in node ? (node.placeholder as ReportSlotPlaceholder | undefined) : undefined,
    );
    const shared = {
        localIdentifier: (node as { id: string }).id,
        ...(placeholder === undefined ? {} : { placeholder }),
    };

    if ("visualization" in node) {
        const { visualization, title, show_title, properties, date, ignore_report_period, filters } = node;
        const declaredFilters = filtersToDeclarative(filters);
        const ignoredFilters = (node.ignored_filters ?? [])
            .map((filterId) => yamlIgnoredFilterToDeclarative(filterId))
            .filter(Boolean)
            .map((reference) => referencesAsStored(reference)) as IDashboardFilterReference[];
        return {
            ...shared,
            type: "visualization",
            ...(visualization === null || visualization === undefined
                ? {}
                : { insight: idRef(visualization, "insight") }),
            // A title of false hides it and states no text; a title kept but not drawn says so in full.
            ...(title === false ? { showTitle: false } : title === undefined ? {} : { title }),
            ...(show_title === undefined ? {} : { showTitle: show_title }),
            ...(properties === undefined ? {} : { properties }),
            ...(date === undefined ? {} : { dateDataSet: idRef(date, "dataSet") }),
            ...(ignore_report_period === undefined ? {} : { ignoreReportPeriod: ignore_report_period }),
            ...(declaredFilters === undefined ? {} : { filters: declaredFilters }),
            ...(ignoredFilters.length === 0 ? {} : { ignoredFilters }),
        };
    }

    if ("heading" in node || "paragraph" in node) {
        const isHeading = "heading" in node;
        const source = textToDeclarative(isHeading ? node.heading : node.paragraph);
        return {
            ...shared,
            type: isHeading ? "heading" : "paragraph",
            ...(source === undefined ? {} : { source }),
            ...(node.style === undefined ? {} : { style: textStyleToDeclarative(node.style, page)! }),
        } as PublisherSlotV1;
    }

    if (!("image" in node)) {
        // A node says what it draws by the key it carries, so one carrying none of them draws
        // nothing - far more often a key spelled wrong than an area anyone meant to write.
        throw newError(
            CoreErrorCode.ItemNotSupported,
            [JSON.stringify({ id: shared.localIdentifier, keys: Object.keys(node) })],
            updateErrorContext(errorContext, { path: ["layout", shared.localIdentifier] }),
        );
    }

    const image = imageContentToDeclarative(node.image);
    return { ...image, ...shared } as IPublisherImageSlotV1;
}

/**
 * Raises a page written as one tree back into the two halves it is stored as: the geometry, and the
 * flat list of slots it and the boxes painted with an image point at.
 *
 * @internal
 */
export function yamlPublisherDocumentPageToDeclarative(
    body: ReportPageBody,
    errorContext?: IErrorContext,
): IPublisherDocumentPageV1 {
    return { localIdentifier: body.id, ...yamlPublisherPageBodyToDeclarative(body, errorContext) };
}

/**
 * The body of a page, without the identity of whatever holds it: a page written into a document names
 * itself, a reusable one is named by the object it is.
 *
 * @internal
 */
export function yamlPublisherPageBodyToDeclarative(
    body: ReportPageBody,
    errorContext?: IErrorContext,
): IPublisherPageBodyV1 {
    const page: IPageUnderConstruction = { slots: [] };
    const style = boxStyleToDeclarative(body.style, page);
    const layout = layoutNodeToDeclarative(body.layout, page, errorContext);
    const filters = filtersToDeclarative(body.filters);

    return {
        ...(body.kind === undefined ? {} : { kind: body.kind }),
        ...(body.format === undefined ? {} : { format: body.format }),
        ...(style === undefined ? {} : { style }),
        layout,
        slots: page.slots,
        ...(filters === undefined ? {} : { filters }),
    } satisfies IPublisherPageBodyV1;
}
