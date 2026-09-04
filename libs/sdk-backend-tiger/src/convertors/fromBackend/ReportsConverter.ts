// (C) 2026 GoodData Corporation

import {
    type JsonApiReportOut,
    type JsonApiReportOutWithLinks,
    type JsonApiReportPageLayoutOut,
    type JsonApiReportPageLayoutOutWithLinks,
    type JsonApiReportTemplateOut,
    type JsonApiReportTemplateOutWithLinks,
    type JsonApiUserIdentifierOutWithLinks,
} from "@gooddata/api-client-tiger";
import {
    type IReport,
    type IReportContent,
    type IReportPageLayout,
    type IReportPageLayoutContent,
    type IReportTemplate,
    idRef,
} from "@gooddata/sdk-model";

import { isInheritedObject } from "./ObjectInheritance.js";
import { convertUserIdentifier } from "./UsersConverter.js";

// Content is stored verbatim as free-form JSON, so the wire type carries no structure and the
// model type is restored by assertion. Callers that must not trust it use the content type-guards.
function asContent<T>(content: object): T {
    return content as T;
}

export function convertReportPageLayout(
    entity: JsonApiReportPageLayoutOut | JsonApiReportPageLayoutOutWithLinks,
    included: JsonApiUserIdentifierOutWithLinks[] = [],
): IReportPageLayout {
    return {
        type: "reportPageLayout",
        ref: idRef(entity.id, "reportPageLayout"),
        title: entity.attributes.title,
        description: entity.attributes.description,
        tags: entity.attributes.tags,
        content: asContent<IReportPageLayoutContent>(entity.attributes.content),
        isLocked: isInheritedObject(entity),
        created: entity.attributes.createdAt ?? undefined,
        updated: entity.attributes.modifiedAt ?? undefined,
        createdBy: convertUserIdentifier(entity.relationships?.createdBy, included),
        updatedBy: convertUserIdentifier(entity.relationships?.modifiedBy, included),
    };
}

export function convertReportTemplate(
    entity: JsonApiReportTemplateOut | JsonApiReportTemplateOutWithLinks,
    included: JsonApiUserIdentifierOutWithLinks[] = [],
): IReportTemplate {
    return {
        type: "reportTemplate",
        ref: idRef(entity.id, "reportTemplate"),
        title: entity.attributes.title,
        description: entity.attributes.description,
        tags: entity.attributes.tags,
        content: asContent<IReportContent>(entity.attributes.content),
        isLocked: isInheritedObject(entity),
        created: entity.attributes.createdAt ?? undefined,
        updated: entity.attributes.modifiedAt ?? undefined,
        createdBy: convertUserIdentifier(entity.relationships?.createdBy, included),
        updatedBy: convertUserIdentifier(entity.relationships?.modifiedBy, included),
    };
}

export function convertReport(
    entity: JsonApiReportOut | JsonApiReportOutWithLinks,
    included: JsonApiUserIdentifierOutWithLinks[] = [],
): IReport {
    return {
        type: "report",
        ref: idRef(entity.id, "report"),
        title: entity.attributes.title,
        description: entity.attributes.description,
        tags: entity.attributes.tags,
        periodStart: entity.attributes.periodStart,
        periodEnd: entity.attributes.periodEnd,
        content: asContent<IReportContent>(entity.attributes.content),
        variableValues: entity.attributes.variableValues ?? undefined,
        isLocked: isInheritedObject(entity),
        created: entity.attributes.createdAt ?? undefined,
        updated: entity.attributes.modifiedAt ?? undefined,
        createdBy: convertUserIdentifier(entity.relationships?.createdBy, included),
        updatedBy: convertUserIdentifier(entity.relationships?.modifiedBy, included),
    };
}
