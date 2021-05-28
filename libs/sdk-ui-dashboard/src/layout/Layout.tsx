// (C) 2020 GoodData Corporation
import React, { useMemo } from "react";
import {
    ErrorComponent as DefaultError,
    ILocale,
    LoadingComponent as DefaultLoading,
    VisType,
} from "@gooddata/sdk-ui";
import { ObjRef, IInsight, insightVisualizationUrl, areObjRefsEqual } from "@gooddata/sdk-model";
import {
    FilterContextItem,
    isDashboardLayoutEmpty,
    IUserWorkspaceSettings,
    IWidget,
} from "@gooddata/sdk-backend-spi";
import { IDashboardViewProps } from "@gooddata/sdk-ui-ext";
import { DashboardViewProvider } from "@gooddata/sdk-ui-ext/esm/dashboardView/DashboardViewProvider";
import { filterArrayToFilterContextItems } from "@gooddata/sdk-ui-ext/esm/internal";
import { DashboardRenderer } from "@gooddata/sdk-ui-ext/esm/dashboardView/DashboardRenderer";
// Selectors
import { useDashboardSelector } from "../model/state/dashboardStore";
import { attributesWithDrillDownSelector } from "../model/state/catalog/catalogSelectors";
import { alertsSelector } from "../model/state/alerts/alertsSelectors";
import { layoutSelector } from "../model/state/layout/layoutSelectors";
import { filterContextSelector } from "../model/state/filterContext/filterContextSelectors";
import { insightsSelector } from "../model/state/insights/insightsSelectors";
import { EmptyDashboardError } from "@gooddata/sdk-ui-ext/src/dashboardView/EmptyDashboardError";
import {
    settingsSelector,
    colorPaletteSelector,
    configSelector,
} from "../model/state/config/configSelectors";

/**
 * @internal
 */
export interface LayoutProps {
    dashboardRef: ObjRef;
    drillableItems?: IDashboardViewProps["drillableItems"];
    filters?: IDashboardViewProps["filters"];
    transformLayout?: IDashboardViewProps["transformLayout"];
    widgetRenderer?: IDashboardViewProps["widgetRenderer"];
    ErrorComponent?: IDashboardViewProps["ErrorComponent"];
    LoadingComponent?: IDashboardViewProps["LoadingComponent"];
}

/**
 * @internal
 */

export const Layout: React.FC<LayoutProps> = (props) => {
    const {
        dashboardRef,
        ErrorComponent = DefaultError,
        LoadingComponent = DefaultLoading,
        drillableItems,
        filters,
        transformLayout,
        widgetRenderer,
    } = props;
    const config = useDashboardSelector(configSelector);
    const settings = useDashboardSelector(settingsSelector);
    const colorPalette = useDashboardSelector(colorPaletteSelector);
    const drillDownAttributes = useDashboardSelector(attributesWithDrillDownSelector);
    const alerts = useDashboardSelector(alertsSelector);
    const layout = useDashboardSelector(layoutSelector);
    const filterContext = useDashboardSelector(filterContextSelector);
    const insights = useDashboardSelector(insightsSelector);

    const getInsightByRef = (insightRef: ObjRef): IInsight | undefined => {
        return insights.find((i) => areObjRefsEqual(i.insight.ref, insightRef));
    };

    const getVisType = (widget: IWidget): VisType => {
        if (widget.type === "kpi") {
            // TODO:
            return undefined as any;
        }
        const insight = getInsightByRef(widget.insight);
        return insightVisualizationUrl(insight!).split(":")[1] as VisType;
    };

    const effectiveConfig = useMemo(() => {
        return {
            mapboxToken: "",
            disableKpiDrillUnderline: settings?.disableKpiDashboardHeadlineUnderline,
            locale: config?.locale,
            separators: config?.separators,
        };
    }, [settings, config]);

    // TODO: move to selector
    const sanitizedFilters = useMemo<FilterContextItem[] | undefined>(() => {
        return filters ? filterArrayToFilterContextItems(filters) : undefined;
    }, [filters]);

    return (
        <DashboardViewProvider
            config={effectiveConfig}
            settings={settings as IUserWorkspaceSettings}
            colorPalette={colorPalette}
            drillDownAttributes={drillDownAttributes}
            alerts={alerts}
            isReadOnly={false} // TODO
            locale={config?.locale as ILocale}
        >
            {isDashboardLayoutEmpty(layout) ? (
                <EmptyDashboardError ErrorComponent={ErrorComponent} />
            ) : (
                <DashboardRenderer
                    transformLayout={transformLayout}
                    dashboardRef={dashboardRef}
                    dashboardLayout={layout}
                    filters={sanitizedFilters}
                    filterContext={filterContext}
                    drillableItems={drillableItems}
                    ErrorComponent={ErrorComponent}
                    LoadingComponent={LoadingComponent}
                    className="gd-dashboards-root"
                    getVisType={getVisType}
                    getInsightByRef={getInsightByRef}
                    widgetRenderer={widgetRenderer!}
                    areSectionHeadersEnabled={settings?.enableSectionHeaders}
                    // TODO: replace with event handlers
                    // onFiltersChange={onFiltersChange}
                    // onDrill={onDrill}
                    // onError={onError}
                />
            )}
        </DashboardViewProvider>
    );
};
