// (C) 2022-2025 GoodData Corporation
import { renderModeAware } from "../../componentDefinition/index.js";

import { ViewModeDashboardRichText } from "./ViewModeDashboardRichText.js";
import { EditModeDashboardRichText } from "./EditModeDashboardRichText.js";
import { ExportModeDashboardRichText } from "./ExportModeDashboardRichText.js";

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
