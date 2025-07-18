// (C) 2007-2025 GoodData Corporation
import { Repeater, getColorMappingPredicate } from "@gooddata/sdk-ui-charts";
import { InsightView } from "@gooddata/sdk-ui-ext";
import { idRef } from "@gooddata/sdk-model";
import { Dashboard } from "@gooddata/sdk-ui-dashboard";
import {
    AmountBOP,
    Probability,
    AvgAmount,
    Product,
    DateDatasets,
    Insights,
    Dashboards,
} from "../../../../../../reference_workspace/workspace_objects/goodsales/current_reference_workspace_objects_tiger";

const style = { height: 1000 };

export function RepeaterFullConfigs() {
    return (
        <div style={style}>
            <Repeater
                attribute={Product.Name}
                columns={[Product.Image, Product.Link, AmountBOP, AvgAmount, Probability]}
                viewBy={DateDatasets.Closed.ClosedYear.Default}
                config={{
                    rowHeight: "large",
                    cellImageSizing: "fill",
                    cellTextWrapping: "wrap",
                    cellVerticalAlign: "middle",
                    hyperLinks: {
                        ["a_label.f_product.product.link"]: {
                            staticElementsText: "Show more when clicking",
                        },
                    },
                    inlineVisualizations: {
                        ["m_amount_bop"]: {
                            type: "column",
                        },
                        ["m_avg._amount"]: {
                            type: "line",
                        },
                    },
                    colorMapping: [
                        {
                            predicate: getColorMappingPredicate("m_avg._amount"),
                            color: { type: "guid", value: "15" },
                        },
                        {
                            predicate: getColorMappingPredicate("m_amount_bop"),
                            color: { type: "guid", value: "4" },
                        },
                    ],
                    colorPalette: [
                        { guid: "4", fill: { r: 241, g: 134, b: 0 } },
                        { guid: "15", fill: { r: 181, g: 60, b: 51 } },
                    ],
                }}
            />
        </div>
    );
}

export function RepeaterInsightView() {
    return (
        <div style={style}>
            <InsightView insight={idRef(Insights.Repeater)} />
        </div>
    );
}

export function RepeaterDashboard() {
    return (
        <div style={style}>
            <Dashboard dashboard={idRef(Dashboards.RepeaterDashboard)} />;
        </div>
    );
}

export function RepeaterNoColumn() {
    return (
        <div style={style}>
            <Repeater attribute={Product.Name} />
        </div>
    );
}

export function RepeaterNoMetric() {
    return (
        <div style={style}>
            <Repeater attribute={Product.Name} columns={[Product.Image]} />
        </div>
    );
}
