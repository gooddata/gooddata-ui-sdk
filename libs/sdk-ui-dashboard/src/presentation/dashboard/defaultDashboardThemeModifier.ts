// (C) 2020-2022 GoodData Corporation
import cloneDeep from "lodash/cloneDeep";
import { ITheme } from "@gooddata/sdk-model";

/**
 * Default modifier applied to any theme passed to Dashboard component
 * @param theme - theme to modify
 * @beta
 */
export const defaultDashboardThemeModifier = (theme: ITheme): ITheme => {
    if (theme?.dashboards?.content?.kpiWidget?.kpi) {
        // duplicate dashboard specific kpi customization to the generic kpi key
        const themeWithKpi = cloneDeep(theme);
        themeWithKpi.kpi = {
            ...theme.dashboards.content.kpiWidget.kpi,
        };
        return themeWithKpi;
    }
    return theme;
};
