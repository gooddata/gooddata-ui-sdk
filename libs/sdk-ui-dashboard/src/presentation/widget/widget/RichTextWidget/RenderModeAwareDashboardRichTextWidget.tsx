// (C) 2022-2025 GoodData Corporation
import { renderModeAware } from "../../../componentDefinition/index.js";
import { DefaultDashboardRichTextWidget } from "./DefaultDashboardRichTextWidget.js";
import { EditableDashboardRichTextWidget } from "./EditableDashboardRichTextWidget.js";
import { ExportableDashboardRichTextWidget } from "./ExportableDashboardRichTextWidget.js";

/**
 * @internal
 */
export const RenderModeAwareDashboardRichTextWidget = renderModeAware({
    view: DefaultDashboardRichTextWidget,
    edit: EditableDashboardRichTextWidget,
    export: ExportableDashboardRichTextWidget,
});
