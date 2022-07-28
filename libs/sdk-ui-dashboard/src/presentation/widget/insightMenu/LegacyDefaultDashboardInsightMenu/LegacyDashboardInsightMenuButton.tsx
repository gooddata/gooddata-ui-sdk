// (C) 2020-2022 GoodData Corporation
import { renderModeAware } from "../../../componentDefinition";
import { DefaultDashboardInsightMenuButton } from "../DefaultDashboardInsightMenu";
import { CustomDashboardInsightMenuButtonComponent } from "../types";
import { LegacyInsightMenuButton } from "./LegacyInsightMenu/LegacyInsightMenuButton";

/**
 * @internal
 */
export const LegacyDashboardInsightMenuButton = renderModeAware<CustomDashboardInsightMenuButtonComponent>({
    view: LegacyInsightMenuButton,
    edit: DefaultDashboardInsightMenuButton,
});
