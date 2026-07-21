// (C) 2026 GoodData Corporation

import { type JsonApiExportDefinitionOutMeta } from "@gooddata/api-client-tiger";
import {
    type IExportTemplate,
    type IExportTemplateDashboardSlides,
    type IExportTemplateWidgetSlides,
    idRef,
} from "@gooddata/sdk-model";

import { isInheritedObject } from "./ObjectInheritance.js";

/**
 * Structural view of a JSON:API export template entity. Organization- and workspace-level export
 * template entities share this shape (attributes + inheritance `meta`), so a single converter handles
 * both — mirroring how {@link convertMemoryItem} accepts either scope's generated type.
 *
 * @internal
 */
interface IExportTemplateOutEntity {
    id: string;
    type: string;
    meta?: JsonApiExportDefinitionOutMeta;
    attributes: {
        name: string;
        dashboardSlidesTemplate?: IExportTemplateDashboardSlides | null;
        widgetSlidesTemplate?: IExportTemplateWidgetSlides | null;
    };
}

/**
 * Converts a JSON:API export template entity into the {@link IExportTemplate} model.
 *
 * @internal
 */
export function convertExportTemplate(entity: IExportTemplateOutEntity): IExportTemplate {
    return {
        ref: idRef(entity.id),
        name: entity.attributes.name,
        dashboardSlidesTemplate: entity.attributes.dashboardSlidesTemplate,
        widgetSlidesTemplate: entity.attributes.widgetSlidesTemplate,
        // Templates inherited from a parent workspace (or the organization) come back with a PARENT
        // origin and are read-only in the current scope.
        isInherited: isInheritedObject(entity),
    };
}
