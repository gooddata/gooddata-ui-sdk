// (C) 2020-2022 GoodData Corporation
import { DefaultDashboardInsightMenu } from "../DefaultDashboardInsightMenu";
import { renderModeAware } from "../../../componentDefinition";
import { CustomDashboardInsightMenuComponent } from "../types";
import { LegacyInsightMenu } from "./LegacyInsightMenu";

/**
 * @internal
 */
export const LegacyDashboardInsightMenu = renderModeAware<CustomDashboardInsightMenuComponent>({
    view: LegacyInsightMenu,
    edit: DefaultDashboardInsightMenu,
});
