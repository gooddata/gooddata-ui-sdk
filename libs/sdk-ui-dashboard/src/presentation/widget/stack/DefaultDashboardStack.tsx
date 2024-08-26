// (C) 2022-2024 GoodData Corporation

import { ViewModeDashboardStack } from "./ViewModeDashboardStack.js";
import { EditModeDashboardStack } from "./EditModeDashboardStack.js";
import { renderModeAware } from "../../componentDefinition/index.js";

/**
 * @internal
 */
export const DefaultDashboardStack = renderModeAware({
    view: ViewModeDashboardStack,
    edit: EditModeDashboardStack,
});
