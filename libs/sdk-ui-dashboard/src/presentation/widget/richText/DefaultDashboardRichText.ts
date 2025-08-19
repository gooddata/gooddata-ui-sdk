// (C) 2022-2025 GoodData Corporation

import { EditModeDashboardRichText } from "./EditModeDashboardRichText.js";
import { ExportModeDashboardRichText } from "./ExportModeDashboardRichText.js";
import { ViewModeDashboardRichText } from "./ViewModeDashboardRichText.js";
import { renderModeAware } from "../../componentDefinition/index.js";

/**
 * Default implementation of the dashboard rich text widget.
 *
 * @public
 */
export const DefaultDashboardRichText = renderModeAware({
    view: ViewModeDashboardRichText,
    edit: EditModeDashboardRichText,
    export: ExportModeDashboardRichText,
});
