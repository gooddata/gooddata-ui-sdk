// (C) 2026 GoodData Corporation

import type {
    PublisherDocumentContentV2 as AacPublisherDocumentContentV2,
    PublisherLayoutNodeV2 as AacPublisherLayoutNodeV2,
    PublisherDocumentPageV2,
    PublisherPageBodyV2,
    PublisherSectionV2,
    PublisherVisualizationWidgetV2,
} from "@gooddata/sdk-code-schemas/v1";
import {
    type IDashboardFilterReference,
    type IPublisherDocumentDefinitionV2,
    type IPublisherDocumentPageV2,
    type IPublisherDocumentTemplateDefinitionV2,
    type IPublisherPageBodyV2,
    type IPublisherPageTemplateDefinitionV2,
    type IPublisherSectionV2,
    type IPublisherVisualizationWidgetV2,
    type ObjRef,
    type PublisherDocumentContentV2,
    type PublisherLayoutNodeV2,
    idRef,
} from "@gooddata/sdk-model";

import {
    type DeclarativePublisherDocumentTemplateV2,
    type DeclarativePublisherDocumentV2,
    type DeclarativePublisherPageTemplateV2,
} from "../declarativePublisherTypesV2.js";
import {
    type AacPublisherDocumentTemplateV2,
    type AacPublisherDocumentV2,
    type AacPublisherEntityWithOptionalIdV2,
    type AacPublisherPageTemplateV2,
} from "../schemas/types.js";
import { CoreErrorCode, type IErrorContext, newError, updateErrorContext } from "../utils/errors.js";
import { camelKeys } from "../utils/keyCase.js";
import { pagesOrSectionsV2, unknownLayoutNodeV2 } from "../utils/publisherContentV2.js";
import { referencesAsStored } from "../utils/publisherFilterRefs.js";
import { assertDocumentDateFiltersNameDataSet, filtersToDeclarativeV2 } from "../utils/publisherFilters.js";
import { periodToDeclarativeV2 } from "../utils/publisherPeriodV2.js";
import { assertPublisherContentVersionV2, publisherContentVersionV2 } from "../utils/publisherVersionV2.js";

import { yamlIgnoredFilterToDeclarative } from "./yamlDashboardToDeclarative.js";

type AacPublisherEntityV2 =
    | AacPublisherDocumentV2
    | AacPublisherDocumentTemplateV2
    | AacPublisherPageTemplateV2;

function ignoredFilterToDeclarative(
    id: string,
    errorContext: IErrorContext | undefined,
): IDashboardFilterReference {
    const reference = yamlIgnoredFilterToDeclarative(id);
    if (reference === null) {
        throw newError(CoreErrorCode.ReferenceTypeNotSupported, [id], errorContext);
    }
    return referencesAsStored(reference);
}

function visualizationToDeclarative(
    widget: PublisherVisualizationWidgetV2,
    errorContext: IErrorContext | undefined,
): IPublisherVisualizationWidgetV2 {
    const { visualization, date, filters, ignored_filters, ...rest } = widget;
    const widgetContext = updateErrorContext(errorContext, { path: [widget.id] });
    const ignoredContext = updateErrorContext(widgetContext, { path: ["ignored_filters"] });
    return {
        ...camelKeys(rest),
        ...(visualization === undefined
            ? {}
            : { visualization: { identifier: visualization, type: "insight" } }),
        ...(date === undefined ? {} : { dateDataSet: { identifier: date, type: "dataSet" } }),
        ...(filters === undefined
            ? {}
            : {
                  filters: filtersToDeclarativeV2(
                      filters,
                      "widget",
                      updateErrorContext(widgetContext, { path: ["filters"] }),
                  ).filters,
              }),
        ...(ignored_filters === undefined
            ? {}
            : {
                  ignoreDocumentFilters: ignored_filters.map((id) =>
                      ignoredFilterToDeclarative(id, ignoredContext),
                  ),
              }),
    };
}

function layoutNodeToDeclarative(
    node: AacPublisherLayoutNodeV2,
    errorContext: IErrorContext | undefined,
): PublisherLayoutNodeV2 {
    switch (node.type) {
        case "row":
        case "column": {
            const { children, ...container } = node;
            return {
                ...camelKeys(container),
                children: children.map((child) => layoutNodeToDeclarative(child, errorContext)),
            };
        }
        case "visualization":
            return visualizationToDeclarative(node, errorContext);
        case "title":
        case "heading":
        case "text":
        case "image":
        case "takeaway":
            return camelKeys(node);
        default:
            throw unknownLayoutNodeV2(node, errorContext);
    }
}

function pageBodyToDeclarative(
    body: PublisherPageBodyV2,
    errorContext: IErrorContext | undefined,
): IPublisherPageBodyV2 {
    const { layout, filters, ...rest } = body;
    return {
        ...camelKeys(rest),
        layout: layoutNodeToDeclarative(layout, errorContext),
        ...(filters === undefined
            ? {}
            : {
                  filters: filtersToDeclarativeV2(
                      filters,
                      "page",
                      updateErrorContext(errorContext, { path: ["filters"] }),
                  ).filters,
              }),
    };
}

function documentPageToDeclarative(
    page: PublisherDocumentPageV2,
    errorContext: IErrorContext | undefined,
): IPublisherDocumentPageV2 {
    const { id, visible, ...body } = page;
    return {
        id,
        ...(visible === undefined ? {} : { visible }),
        ...pageBodyToDeclarative(body, updateErrorContext(errorContext, { path: [id] })),
    };
}

function sectionToDeclarative(
    section: PublisherSectionV2,
    errorContext: IErrorContext | undefined,
): IPublisherSectionV2 {
    const { pages, ...rest } = section;
    const pagesContext = updateErrorContext(errorContext, { path: ["sections", section.id, "pages"] });
    return { ...rest, pages: pages.map((page) => documentPageToDeclarative(page, pagesContext)) };
}

function defaultsToDeclarative(
    { period, ...rest }: NonNullable<AacPublisherDocumentContentV2["defaults"]>,
    errorContext: IErrorContext | undefined,
): NonNullable<PublisherDocumentContentV2["defaults"]> {
    return {
        ...camelKeys(rest),
        ...(period === undefined
            ? {}
            : {
                  period: periodToDeclarativeV2(
                      period,
                      updateErrorContext(errorContext, { path: ["period"] }),
                  ),
              }),
    };
}

function contentToDeclarative(
    content: AacPublisherDocumentContentV2,
    errorContext: IErrorContext | undefined,
): PublisherDocumentContentV2 {
    const { defaults, filters, pages, sections, ...rest } = content;
    const held = pagesOrSectionsV2({ pages, sections }, errorContext);
    const filtersContext = updateErrorContext(errorContext, { path: ["filters"] });
    const declared =
        filters === undefined ? undefined : filtersToDeclarativeV2(filters, "document", filtersContext);
    if (declared !== undefined) {
        assertDocumentDateFiltersNameDataSet(declared.filters, filtersContext);
    }
    const base = {
        ...(defaults === undefined
            ? {}
            : {
                  defaults: defaultsToDeclarative(
                      defaults,
                      updateErrorContext(errorContext, { path: ["defaults"] }),
                  ),
              }),
        ...declared,
        ...camelKeys(rest),
    };
    if (held.sections !== undefined) {
        return {
            ...base,
            sections: held.sections.map((section) => sectionToDeclarative(section, errorContext)),
        };
    }
    const pagesContext = updateErrorContext(errorContext, { path: ["pages"] });
    return { ...base, pages: held.pages.map((page) => documentPageToDeclarative(page, pagesContext)) };
}

function entityFields(entity: Pick<AacPublisherEntityV2, "title" | "description" | "tags">) {
    return {
        title: entity.title,
        ...(entity.description === undefined ? {} : { description: entity.description }),
        ...(entity.tags === undefined ? {} : { tags: entity.tags }),
        version: publisherContentVersionV2,
    };
}

function documentBody(
    input: AacPublisherEntityWithOptionalIdV2<AacPublisherDocumentV2>,
    errorContext: IErrorContext | undefined,
): Omit<DeclarativePublisherDocumentV2, "id"> {
    assertPublisherContentVersionV2(input, errorContext);
    return {
        ...entityFields(input),
        period: periodToDeclarativeV2(input.period, updateErrorContext(errorContext, { path: ["period"] })),
        content: contentToDeclarative(input.content, updateErrorContext(errorContext, { path: ["content"] })),
    };
}

function documentTemplateBody(
    input: AacPublisherEntityWithOptionalIdV2<AacPublisherDocumentTemplateV2>,
    errorContext: IErrorContext | undefined,
): Omit<DeclarativePublisherDocumentTemplateV2, "id"> {
    assertPublisherContentVersionV2(input, errorContext);
    return {
        ...entityFields(input),
        content: contentToDeclarative(input.content, updateErrorContext(errorContext, { path: ["content"] })),
    };
}

function pageTemplateBody(
    input: AacPublisherEntityWithOptionalIdV2<AacPublisherPageTemplateV2>,
    errorContext: IErrorContext | undefined,
): Omit<DeclarativePublisherPageTemplateV2, "id"> {
    assertPublisherContentVersionV2(input, errorContext);
    return {
        ...entityFields(input),
        content: pageBodyToDeclarative(
            input.content,
            updateErrorContext(errorContext, { path: ["content"] }),
        ),
    };
}

/** An `id:` written without a value reads as null and counts as missing. */
function refFromId(id: string | null | undefined): { ref?: ObjRef } {
    return id === undefined || id === null ? {} : { ref: idRef(id) };
}

/**
 * Converts a v2 document as code to the stored document.
 *
 * @alpha
 */
export function yamlPublisherDocumentToDeclarativeV2(
    input: AacPublisherDocumentV2,
    errorContext?: IErrorContext,
): DeclarativePublisherDocumentV2 {
    return { id: input.id, ...documentBody(input, errorContext) };
}

/**
 * Converts a v2 document template as code to the stored document template.
 *
 * @alpha
 */
export function yamlPublisherDocumentTemplateToDeclarativeV2(
    input: AacPublisherDocumentTemplateV2,
    errorContext?: IErrorContext,
): DeclarativePublisherDocumentTemplateV2 {
    return { id: input.id, ...documentTemplateBody(input, errorContext) };
}

/**
 * Converts a v2 page template as code to the stored page template.
 *
 * @alpha
 */
export function yamlPublisherPageTemplateToDeclarativeV2(
    input: AacPublisherPageTemplateV2,
    errorContext?: IErrorContext,
): DeclarativePublisherPageTemplateV2 {
    return { id: input.id, ...pageTemplateBody(input, errorContext) };
}

/**
 * Converts a v2 document as code to the definition the frontend holds: an object reference in place
 * of the bare id. A document written without an id reads back without a reference.
 *
 * @alpha
 */
export function yamlPublisherDocumentToDefinitionV2(
    input: AacPublisherEntityWithOptionalIdV2<AacPublisherDocumentV2>,
    errorContext?: IErrorContext,
): IPublisherDocumentDefinitionV2 {
    return { type: "document", ...documentBody(input, errorContext), ...refFromId(input.id) };
}

/** @alpha */
export function yamlPublisherDocumentTemplateToDefinitionV2(
    input: AacPublisherEntityWithOptionalIdV2<AacPublisherDocumentTemplateV2>,
    errorContext?: IErrorContext,
): IPublisherDocumentTemplateDefinitionV2 {
    return { type: "documentTemplate", ...documentTemplateBody(input, errorContext), ...refFromId(input.id) };
}

/** @alpha */
export function yamlPublisherPageTemplateToDefinitionV2(
    input: AacPublisherEntityWithOptionalIdV2<AacPublisherPageTemplateV2>,
    errorContext?: IErrorContext,
): IPublisherPageTemplateDefinitionV2 {
    return { type: "pageTemplate", ...pageTemplateBody(input, errorContext), ...refFromId(input.id) };
}
