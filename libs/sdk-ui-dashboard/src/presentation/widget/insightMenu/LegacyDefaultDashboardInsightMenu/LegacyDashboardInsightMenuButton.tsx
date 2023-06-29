// (C) 2020-2022 GoodData Corporation
import { renderModeAware } from "../../../componentDefinition/index.js";
import { DefaultDashboardInsightMenuButton } from "../DefaultDashboardInsightMenu/index.js";
import { CustomDashboardInsightMenuButtonComponent } from "../types.js";
import { LegacyInsightMenuButton } from "./LegacyInsightMenu/LegacyInsightMenuButton.js";

/**
 * @internal
 */
export const LegacyDashboardInsightMenuButton = renderModeAware<CustomDashboardInsightMenuButtonComponent>({
    view: LegacyInsightMenuButton,
    edit: DefaultDashboardInsightMenuButton,
});
