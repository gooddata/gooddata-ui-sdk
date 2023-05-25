// (C) 2020-2022 GoodData Corporation
import cloneDeep from "lodash/cloneDeep.js";
import { ITheme } from "@gooddata/sdk-model";
import isEmpty from "lodash/isEmpty.js";

/**
 * Default modifier applied to any theme passed to Dashboard component
 * @param theme - theme to modify
 * @beta
 */
export const defaultDashboardThemeModifier = (theme: ITheme): ITheme => {
    const modifiedTheme = cloneDeep(theme);

    if (theme?.dashboards?.content?.kpiWidget?.kpi) {
        // duplicate dashboard specific kpi customization to the generic kpi key
        modifiedTheme.kpi = {
            ...theme.dashboards.content.kpiWidget.kpi,
        };
    }

    const additionalCssProperties: string[] = [];

    /**
     * The second copy of --gd-chart/table-backgroundColor is necessary for rewriting in
     * the local scope. Works in pair with 'dash-item-content' class from dashboard.scss.
     */
    if (theme?.chart?.backgroundColor) {
        additionalCssProperties.push(
            `--gd-dashboards-content-widget-chart-backgroundColor: ${theme.chart.backgroundColor};`,
        );
    }
    if (theme?.table?.backgroundColor) {
        additionalCssProperties.push(
            `--gd-dashboards-content-widget-table-backgroundColor: ${theme.table.backgroundColor};`,
        );
    }

    if (!isEmpty(additionalCssProperties)) {
        const styleTag = document.createElement("style");
        styleTag.appendChild(document.createTextNode(`:root{${additionalCssProperties.join("")}}`));
        document.head.appendChild(styleTag);
    }

    return modifiedTheme;
};
