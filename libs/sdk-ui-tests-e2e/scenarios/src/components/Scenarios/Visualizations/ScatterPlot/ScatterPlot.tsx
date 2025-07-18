// (C) 2024-2025 GoodData Corporation
import { ScatterPlot, getColorMappingPredicate } from "@gooddata/sdk-ui-charts";
import { InsightView } from "@gooddata/sdk-ui-ext";
import { idRef } from "@gooddata/sdk-model";
import { Dashboard } from "@gooddata/sdk-ui-dashboard";
import {
    AmountBOP,
    AvgAmount,
    Department,
    DateDatasets,
    Insights,
    Dashboards,
} from "../../../../../../reference_workspace/workspace_objects/goodsales/current_reference_workspace_objects_tiger";

const style = { height: 500 };

export function ScatterPlotSegmentation() {
    return (
        <div style={style} className="s-scatter-plot">
            <ScatterPlot
                xAxisMeasure={AmountBOP}
                yAxisMeasure={AvgAmount}
                attribute={Department.Default}
                segmentBy={DateDatasets.Closed.ClosedYear.Default}
                config={{
                    colorMapping: [
                        { predicate: getColorMappingPredicate("2010"), color: { type: "guid", value: "14" } },
                        { predicate: getColorMappingPredicate("2011"), color: { type: "guid", value: "16" } },
                        { predicate: getColorMappingPredicate("2012"), color: { type: "guid", value: "15" } },
                        { predicate: getColorMappingPredicate("2013"), color: { type: "guid", value: "10" } },
                        { predicate: getColorMappingPredicate("2014"), color: { type: "guid", value: "7" } },
                        { predicate: getColorMappingPredicate("2016"), color: { type: "guid", value: "13" } },
                        {
                            predicate: getColorMappingPredicate("2017"),
                            color: { type: "rgb", value: { b: 136, g: 0, r: 153 } },
                        },
                    ],
                    colorPalette: [
                        { guid: "7", fill: { r: 148, g: 161, b: 174 } },
                        { guid: "10", fill: { r: 238, g: 135, b: 128 } },
                        { guid: "13", fill: { r: 41, g: 117, b: 170 } },
                        { guid: "14", fill: { r: 4, g: 140, b: 103 } },
                        { guid: "15", fill: { r: 181, g: 60, b: 51 } },
                        { guid: "16", fill: { r: 163, g: 101, b: 46 } },
                    ],
                }}
            />
        </div>
    );
}

export function ScatterPlotSegmentationInsightView() {
    return (
        <div style={style} className="s-scatter-plot">
            <InsightView insight={idRef(Insights.ScatterPlotSegmentByAttribute)} />
        </div>
    );
}

export function ScatterPlotSegmentationDashboard() {
    return (
        <div style={style}>
            <Dashboard dashboard={idRef(Dashboards.DashboardScatterPlotSegmentation)} />;
        </div>
    );
}
