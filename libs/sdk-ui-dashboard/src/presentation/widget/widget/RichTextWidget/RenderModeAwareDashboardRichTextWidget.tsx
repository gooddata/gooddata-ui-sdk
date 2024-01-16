// (C) 2022-2024 GoodData Corporation
import { renderModeAware } from "../../../componentDefinition/index.js";
import { DefaultDashboardRichTextWidget } from "./DefaultDashboardRichTextWidget.js";
import { EditableDashboardRichTextWidget } from "./EditableDashboardRichTextWidget.js";

/**
 * @internal
 */
export const RenderModeAwareDashboardRichTextWidget = renderModeAware({
    view: DefaultDashboardRichTextWidget,
    edit: EditableDashboardRichTextWidget,
});
