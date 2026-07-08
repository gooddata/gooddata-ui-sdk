// (C) 2026 GoodData Corporation

import {
    type IExportTemplate,
    type IExportTemplateDashboardSlides,
    type IExportTemplateWidgetSlides,
    idRef,
} from "@gooddata/sdk-model";

/**
 * Structural view of the JSON:API export template attributes. Organization- and workspace-level
 * export template entities share the same attribute shape, so a single converter handles both.
 *
 * @internal
 */
interface IExportTemplateOutAttributes {
    name: string;
    dashboardSlidesTemplate?: IExportTemplateDashboardSlides | null;
    widgetSlidesTemplate?: IExportTemplateWidgetSlides | null;
}

/**
 * Converts a JSON:API export template entity into the {@link IExportTemplate} model.
 *
 * @internal
 */
export function convertExportTemplate(id: string, attributes: IExportTemplateOutAttributes): IExportTemplate {
    return {
        ref: idRef(id),
        name: attributes.name,
        dashboardSlidesTemplate: attributes.dashboardSlidesTemplate,
        widgetSlidesTemplate: attributes.widgetSlidesTemplate,
    };
}
