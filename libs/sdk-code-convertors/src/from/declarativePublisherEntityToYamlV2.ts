// (C) 2026 GoodData Corporation

import { Document, Scalar, type Tags, visit } from "yaml";

import type {
    PublisherDocumentContentV2 as AacPublisherDocumentContentV2,
    PublisherLayoutNodeV2 as AacPublisherLayoutNodeV2,
    PublisherDocumentPageV2,
    PublisherPageBodyV2,
    PublisherSectionV2,
    PublisherVisualizationWidgetV2,
} from "@gooddata/sdk-code-schemas/v1";
import {
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
    dashboardFilterReferenceObjRef,
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
import { type IErrorContext, updateErrorContext } from "../utils/errors.js";
import { snakeKeys } from "../utils/keyCase.js";
import { pagesOrSectionsV2, unknownLayoutNodeV2 } from "../utils/publisherContentV2.js";
import { referencesAsWritten } from "../utils/publisherFilterRefs.js";
import { assertDocumentDateFiltersNameDataSet, filtersToYamlV2 } from "../utils/publisherFilters.js";
import { periodToYamlV2 } from "../utils/publisherPeriodV2.js";
import { assertPublisherContentVersionV2, publisherContentVersionV2 } from "../utils/publisherVersionV2.js";
import {
    PUBLISHER_DOCUMENT_COMMENT,
    PUBLISHER_DOCUMENT_TEMPLATE_COMMENT,
    PUBLISHER_PAGE_TEMPLATE_COMMENT_V2,
} from "../utils/texts.js";
import { getIdentifier } from "../utils/yamlUtils.js";

function visualizationToYaml(
    widget: IPublisherVisualizationWidgetV2,
    errorContext: IErrorContext | undefined,
): PublisherVisualizationWidgetV2 {
    const { visualization, dateDataSet, filters, ignoreDocumentFilters, ...rest } = widget;
    return {
        ...snakeKeys(rest),
        ...(visualization === undefined ? {} : { visualization: visualization.identifier }),
        ...(dateDataSet === undefined ? {} : { date: dateDataSet.identifier }),
        ...(filters === undefined ? {} : { filters: filtersToYamlV2({ filters }, errorContext) }),
        ...(ignoreDocumentFilters === undefined
            ? {}
            : {
                  ignored_filters: ignoreDocumentFilters.map((reference) =>
                      getIdentifier(
                          referencesAsWritten(dashboardFilterReferenceObjRef(reference)),
                          undefined,
                          errorContext,
                      ),
                  ),
              }),
    };
}

function layoutNodeToYaml(
    node: PublisherLayoutNodeV2,
    errorContext: IErrorContext | undefined,
): AacPublisherLayoutNodeV2 {
    switch (node.type) {
        case "row":
        case "column": {
            const { children, ...container } = node;
            return {
                ...snakeKeys(container),
                children: children.map((child) => layoutNodeToYaml(child, errorContext)),
            };
        }
        case "visualization":
            return visualizationToYaml(node, errorContext);
        case "title":
        case "heading":
        case "text":
        case "image":
        case "takeaway":
            return snakeKeys(node);
        default:
            throw unknownLayoutNodeV2(node, errorContext);
    }
}

function pageBodyToYaml(
    body: IPublisherPageBodyV2,
    errorContext: IErrorContext | undefined,
): PublisherPageBodyV2 {
    const { layout, filters, ...rest } = body;
    return {
        ...snakeKeys(rest),
        layout: layoutNodeToYaml(layout, errorContext),
        ...(filters === undefined ? {} : { filters: filtersToYamlV2({ filters }, errorContext) }),
    };
}

function documentPageToYaml(
    page: IPublisherDocumentPageV2,
    errorContext: IErrorContext | undefined,
): PublisherDocumentPageV2 {
    const { id, visible, ...body } = page;
    return {
        id,
        ...(visible === undefined ? {} : { visible }),
        ...pageBodyToYaml(body, updateErrorContext(errorContext, { path: [id] })),
    };
}

function sectionToYaml(
    section: IPublisherSectionV2,
    errorContext: IErrorContext | undefined,
): PublisherSectionV2 {
    const { pages, ...rest } = section;
    const pagesContext = updateErrorContext(errorContext, { path: ["sections", section.id, "pages"] });
    return { ...rest, pages: pages.map((page) => documentPageToYaml(page, pagesContext)) };
}

function defaultsToYaml({
    period,
    ...rest
}: NonNullable<PublisherDocumentContentV2["defaults"]>): NonNullable<
    AacPublisherDocumentContentV2["defaults"]
> {
    return {
        ...snakeKeys(rest),
        ...(period === undefined ? {} : { period: periodToYamlV2(period) }),
    };
}

function contentToYaml(
    content: PublisherDocumentContentV2,
    errorContext: IErrorContext | undefined,
): AacPublisherDocumentContentV2 {
    const { defaults, filters, attributeFilterConfigs, pages, sections, ...rest } = content;
    const held = pagesOrSectionsV2({ pages, sections }, errorContext);
    const filtersContext = updateErrorContext(errorContext, { path: ["filters"] });
    if (filters !== undefined) {
        assertDocumentDateFiltersNameDataSet(filters, filtersContext);
    }
    const base = {
        ...(defaults === undefined
            ? {}
            : {
                  defaults: defaultsToYaml(defaults),
              }),
        ...(filters === undefined && !attributeFilterConfigs?.length
            ? {}
            : {
                  filters: filtersToYamlV2(
                      { filters: filters ?? [], attributeFilterConfigs },
                      filtersContext,
                  ),
              }),
        ...snakeKeys(rest),
    };
    if (held.sections !== undefined) {
        return { ...base, sections: held.sections.map((section) => sectionToYaml(section, errorContext)) };
    }
    const pagesContext = updateErrorContext(errorContext, { path: ["pages"] });
    return { ...base, pages: held.pages.map((page) => documentPageToYaml(page, pagesContext)) };
}

function entityFields(entity: Pick<IPublisherDocumentDefinitionV2, "title" | "description" | "tags">) {
    return {
        version: publisherContentVersionV2,
        title: entity.title,
        ...(entity.description === undefined ? {} : { description: entity.description }),
        ...(entity.tags === undefined ? {} : { tags: entity.tags }),
    };
}

function withId<T extends { type: string }>(
    { type, ...rest }: T,
    id: string,
): { type: T["type"]; id: string } & Omit<T, "type"> {
    return { type, id, ...rest };
}

function withOptionalId<T extends { type: string }>(
    entity: T,
    id: string | undefined,
): { type: T["type"]; id?: string } & Omit<T, "type"> {
    return id === undefined ? entity : withId(entity, id);
}

// A 1.1 document leaves `0o17` plain, which a YAML 1.2 reader turns into a number. The merge tag
// writes `<<` plain whatever its quoting, so it goes; nothing written here is a merge key.
function yaml11Tags(tags: Tags): Tags {
    return [
        ...tags.filter((tag) => typeof tag === "string" || tag.tag !== "tag:yaml.org,2002:merge"),
        "intOct",
    ];
}

/**
 * Written for YAML 1.1, which PyYAML reads, so strings such as `no`, `on` or dates stay quoted strings.
 */
function toYaml(json: object, comment: string): string {
    const document = new Document(json, { version: "1.1", customTags: yaml11Tags });
    document.commentBefore = comment;
    // PyYAML resolves a plain `=` or `<<` to its value or merge tag, and safe_load rejects both.
    visit(document, {
        Scalar(_, node) {
            if (node.value === "=" || node.value === "<<") {
                node.type = Scalar.QUOTE_DOUBLE;
            }
        },
    });
    return document.toString({ lineWidth: 0 });
}

function documentToYaml(
    document: Omit<IPublisherDocumentDefinitionV2, "ref" | "type">,
    errorContext: IErrorContext | undefined,
): Omit<AacPublisherDocumentV2, "id"> {
    assertPublisherContentVersionV2(document, errorContext);
    return {
        type: "document",
        ...entityFields(document),
        period: periodToYamlV2(document.period),
        content: contentToYaml(document.content, updateErrorContext(errorContext, { path: ["content"] })),
    };
}

function documentTemplateToYaml(
    template: Omit<IPublisherDocumentTemplateDefinitionV2, "ref" | "type">,
    errorContext: IErrorContext | undefined,
): Omit<AacPublisherDocumentTemplateV2, "id"> {
    assertPublisherContentVersionV2(template, errorContext);
    return {
        type: "document_template",
        ...entityFields(template),
        content: contentToYaml(template.content, updateErrorContext(errorContext, { path: ["content"] })),
    };
}

function pageTemplateToYaml(
    template: Omit<IPublisherPageTemplateDefinitionV2, "ref" | "type">,
    errorContext: IErrorContext | undefined,
): Omit<AacPublisherPageTemplateV2, "id"> {
    assertPublisherContentVersionV2(template, errorContext);
    return {
        type: "page_template",
        ...entityFields(template),
        content: pageBodyToYaml(template.content, updateErrorContext(errorContext, { path: ["content"] })),
    };
}

function refToId(ref: ObjRef | undefined, errorContext: IErrorContext | undefined): string | undefined {
    return ref === undefined
        ? undefined
        : getIdentifier(ref, true, updateErrorContext(errorContext, { path: ["ref"] }));
}

/**
 * Converts a stored v2 document to its as-code YAML.
 *
 * @alpha
 */
export function declarativePublisherDocumentToYamlV2(
    document: DeclarativePublisherDocumentV2,
    errorContext?: IErrorContext,
): { content: string; json: AacPublisherDocumentV2 } {
    const json = withId(documentToYaml(document, errorContext), document.id);
    return { content: toYaml(json, PUBLISHER_DOCUMENT_COMMENT), json };
}

/**
 * Converts a stored v2 document template to its as-code YAML.
 *
 * @alpha
 */
export function declarativePublisherDocumentTemplateToYamlV2(
    template: DeclarativePublisherDocumentTemplateV2,
    errorContext?: IErrorContext,
): { content: string; json: AacPublisherDocumentTemplateV2 } {
    const json = withId(documentTemplateToYaml(template, errorContext), template.id);
    return { content: toYaml(json, PUBLISHER_DOCUMENT_TEMPLATE_COMMENT), json };
}

/**
 * Converts a stored v2 page template to its as-code YAML.
 *
 * @alpha
 */
export function declarativePublisherPageTemplateToYamlV2(
    template: DeclarativePublisherPageTemplateV2,
    errorContext?: IErrorContext,
): { content: string; json: AacPublisherPageTemplateV2 } {
    const json = withId(pageTemplateToYaml(template, errorContext), template.id);
    return { content: toYaml(json, PUBLISHER_PAGE_TEMPLATE_COMMENT_V2), json };
}

/**
 * Converts the v2 document the frontend holds to its as-code YAML. A document without a reference
 * yet is written without an id.
 *
 * @alpha
 */
export function publisherDocumentDefinitionToYamlV2(
    document: IPublisherDocumentDefinitionV2,
    errorContext?: IErrorContext,
): { content: string; json: AacPublisherEntityWithOptionalIdV2<AacPublisherDocumentV2> } {
    const json = withOptionalId(documentToYaml(document, errorContext), refToId(document.ref, errorContext));
    return { content: toYaml(json, PUBLISHER_DOCUMENT_COMMENT), json };
}

/** @alpha */
export function publisherDocumentTemplateDefinitionToYamlV2(
    template: IPublisherDocumentTemplateDefinitionV2,
    errorContext?: IErrorContext,
): { content: string; json: AacPublisherEntityWithOptionalIdV2<AacPublisherDocumentTemplateV2> } {
    const json = withOptionalId(
        documentTemplateToYaml(template, errorContext),
        refToId(template.ref, errorContext),
    );
    return { content: toYaml(json, PUBLISHER_DOCUMENT_TEMPLATE_COMMENT), json };
}

/** @alpha */
export function publisherPageTemplateDefinitionToYamlV2(
    template: IPublisherPageTemplateDefinitionV2,
    errorContext?: IErrorContext,
): { content: string; json: AacPublisherEntityWithOptionalIdV2<AacPublisherPageTemplateV2> } {
    const json = withOptionalId(
        pageTemplateToYaml(template, errorContext),
        refToId(template.ref, errorContext),
    );
    return { content: toYaml(json, PUBLISHER_PAGE_TEMPLATE_COMMENT_V2), json };
}
