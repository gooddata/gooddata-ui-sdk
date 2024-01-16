// (C) 2022-2024 GoodData Corporation
import { renderModeAware } from "../../componentDefinition/index.js";

import { ViewModeDashboardRichText } from "./ViewModeDashboardRichText.js";
import { EditModeDashboardRichText } from "./EditModeDashboardRichText.js";

/**
 * Default implementation of the dashboard rich text widget.
 *
 * @public
 */
export const DefaultDashboardRichText = renderModeAware({
    view: ViewModeDashboardRichText,
    edit: EditModeDashboardRichText,
});
