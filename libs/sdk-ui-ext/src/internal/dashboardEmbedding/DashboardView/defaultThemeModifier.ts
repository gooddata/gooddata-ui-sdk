// (C) 2020 GoodData Corporation
import cloneDeep from "lodash/cloneDeep";
import { ITheme } from "@gooddata/sdk-backend-spi";

export const defaultThemeModifier = (theme: ITheme): ITheme => {
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
