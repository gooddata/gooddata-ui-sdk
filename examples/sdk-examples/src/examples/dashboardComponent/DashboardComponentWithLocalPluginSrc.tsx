// (C) 2007-2022 GoodData Corporation
import React from "react";
import max from "lodash/max";
import {
    Legend,
    PolarAngleAxis,
    PolarGrid,
    PolarRadiusAxis,
    Radar,
    RadarChart,
    ResponsiveContainer,
    Tooltip,
} from "recharts";
import {
    CustomDashboardWidgetComponent,
    DashboardConfig,
    DashboardContext,
    DashboardPluginV1,
    ICustomWidget,
    IDashboardCustomizer,
    IDashboardEventHandling,
    newCustomWidget,
    newDashboardItem,
    newDashboardSection,
    useCustomWidgetExecutionDataView,
} from "@gooddata/sdk-ui-dashboard";
import { idRef } from "@gooddata/sdk-model";
import { useDashboardLoader } from "@gooddata/sdk-ui-loaders";
import { LoadingComponent } from "@gooddata/sdk-ui";

import { MAPBOX_TOKEN } from "../../constants/fixtures";
import * as Md from "../../md/full";

const dashboardRef = idRef("aeO5PVgShc0T");
const config: DashboardConfig = { mapboxToken: MAPBOX_TOKEN, isReadOnly: true };

const simpleCurrencyFormatter = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumSignificantDigits: 3,
});

/*
 * Component to render 'myCustomWidget'. If you create custom widget instance and also pass extra data,
 * then that data will be available in the `widget` prop.
 */
const MyCustomWidget: CustomDashboardWidgetComponent = ({ widget, LoadingComponent, ErrorComponent }) => {
    const dataViewTask = useCustomWidgetExecutionDataView({
        widget: widget as ICustomWidget,
        execution: {
            seriesBy: [Md.$TotalSales, Md.$FranchisedSales],
            slicesBy: [Md.LocationState],
        },
    });

    if (dataViewTask.status === "pending" || dataViewTask.status === "loading") {
        return <LoadingComponent />;
    }

    if (dataViewTask.status === "error") {
        return <ErrorComponent message={dataViewTask.error.message ?? "Unknown error"} />;
    }

    const data = dataViewTask.result
        .data()
        .slices()
        .toArray()
        .map((slice) => {
            const rawTotalSales = slice.dataPoints()[0].rawValue;
            const rawFranchisedSales = slice.dataPoints()[1].rawValue;
            return {
                title: slice.descriptor.sliceTitles()[0],
                totalSales: rawTotalSales ? parseFloat(rawTotalSales.toString()) : 0,
                franchisedSales: rawFranchisedSales ? parseFloat(rawFranchisedSales.toString()) : 0,
            };
        });

    const maxValue = max(data.map((i) => max([i.totalSales, i.franchisedSales])))!;

    return (
        <ResponsiveContainer height={240} width="90%">
            <RadarChart data={data}>
                <PolarGrid color="#94a1ad" />
                <PolarAngleAxis dataKey="title" color="#94a1ad" />
                <PolarRadiusAxis
                    angle={90}
                    color="#94a1ad"
                    domain={[0, maxValue]}
                    tickFormatter={simpleCurrencyFormatter.format}
                />
                <Radar
                    name="Total Sales"
                    dataKey="totalSales"
                    stroke="#14b2e2"
                    fill="#14b2e2"
                    fillOpacity={0.6}
                />
                <Radar
                    name="Franchised Sales"
                    dataKey="franchisedSales"
                    stroke="#00c18e"
                    fill="#00c18e"
                    fillOpacity={0.6}
                />
                <Tooltip />
                <Legend />
            </RadarChart>
        </ResponsiveContainer>
    );
};

class LocalPlugin extends DashboardPluginV1 {
    public readonly author = "John Doe";
    public readonly displayName = "Sample local plugin";
    public readonly version = "1.0";

    public register(
        _ctx: DashboardContext,
        customize: IDashboardCustomizer,
        _handlers: IDashboardEventHandling,
    ): void {
        customize.customWidgets().addCustomWidget("myCustomWidget", MyCustomWidget);
        customize.layout().customizeFluidLayout((_layout, customizer) => {
            customizer.addSection(
                0,
                newDashboardSection(
                    "Section Added By Plugin",
                    newDashboardItem(
                        newCustomWidget("myWidget1", "myCustomWidget", {
                            // specify which date data set to used when applying the date filter to this widget
                            // if not specified, the date filter is ignored
                            dateDataSet: Md.DateDatasets.Date,
                            // specify which attribute filters to ignore for this widget
                            // if empty or not specified, all attribute filters are used
                            ignoreDashboardFilters: [],
                        }),
                        {
                            xl: {
                                // all 12 columns of the grid will be 'allocated' for this this new item
                                gridWidth: 12,
                                // medium height to fit the chart
                                gridHeight: 12,
                            },
                        },
                    ),
                ),
            );
        });
    }
}

const LocalExtraPlugin = {
    factory: () => new LocalPlugin(),
};

const DashboardComponentWithLocalPlugin: React.FC = () => {
    const { status, result, error } = useDashboardLoader({
        dashboard: dashboardRef,
        // indicate that only local plugins should be used
        loadingMode: "staticOnly",
        // define the extra plugins, this can also be an array
        extraPlugins: LocalExtraPlugin,
    });

    if (status === "loading" || status === "pending") {
        return <LoadingComponent />;
    }

    if (error) {
        return <div>Error loading dashboard...</div>;
    }

    // the loader result returns the component to be used
    // and also props that need to be passed to it
    const { DashboardComponent, props: dashboardProps } = result!;
    return (
        <div>
            <DashboardComponent {...dashboardProps} config={config} />
        </div>
    );
};

export default DashboardComponentWithLocalPlugin;
