// (C) 2007-2018 GoodData Corporation
import React, { useState, useLayoutEffect } from "react";
import { DashboardView } from "@gooddata/sdk-ui-ext/esm/internal";
import { idRef } from "@gooddata/sdk-model";
import { MAPBOX_TOKEN } from "../../constants/fixtures";
import {
    DashboardViewLayoutColumnModifications,
    DashboardViewLayoutTransform,
    DashboardViewLayoutColumnsSelector,
} from "@gooddata/sdk-ui-ext/esm/internal";
import identity from "lodash/identity";

const dashboardRef = idRef("aeO5PVgShc0T");

const config = { mapboxToken: MAPBOX_TOKEN };

// You can prepare your common modifications first
const makeColumnFullSize: DashboardViewLayoutColumnModifications<any> = (c) =>
    c.size({ xl: { widthAsGridColumnsCount: 12 } });

// You can prepare also your common layout selectors
const selectAllColumnsWithKpis: DashboardViewLayoutColumnsSelector<any> = (columns) =>
    columns.filter((c) => c.hasKpiWidgetContent());

const selectAllColumnsWithInsights: DashboardViewLayoutColumnsSelector<any> = (columns) =>
    columns.filter((c) => c.hasInsightWidgetContent());

// Define layout transforms
const layoutWithFullSizeColumns: DashboardViewLayoutTransform<any> = (layout) =>
    layout.modifyRows((row) => row.modifyColumns(makeColumnFullSize));

const layoutWith2Columns: DashboardViewLayoutTransform<any> = (layout) => {
    const facade = layout.facade();
    const flatColumns = facade.rows().flatMap((row) => {
        return [...row.columns().all()];
    });

    layout.removeRows();

    layout.addRow((row) => {
        flatColumns.forEach((column) => {
            row.addColumn({ widthAsGridColumnsCount: 6 }, (c) => c.content(column.content()));
        });
        return row;
    });

    return layout;
};

const layoutWithInsightsOnly: DashboardViewLayoutTransform<any> = (layout) =>
    layout.modifyRows((row) => row.removeColumns(selectAllColumnsWithKpis));

const layoutWithKpiOnly: DashboardViewLayoutTransform<any> = (layout) =>
    layout.modifyRows((row) => row.removeColumns(selectAllColumnsWithInsights));

const layoutWithChangedRowOrder: DashboardViewLayoutTransform<any> = (layout) => layout.moveRow(0, 1);

const layoutWithAddedWidget: DashboardViewLayoutTransform<any> = (layout) => {
    const rowIndex = 0;
    const columnIndex = 1;

    return layout.modifyRow(rowIndex, (r) =>
        r.addColumn(
            { widthAsGridColumnsCount: 8 },
            // You can set really everything as your custom content
            (c) =>
                c.content(
                    <Center style={{ background: "#333" }}>
                        <button onClick={() => alert("Hello world!")}>Click me!</button>
                    </Center>,
                ),
            columnIndex,
        ),
    );
};

const Center: React.FC<{ style?: React.CSSProperties }> = ({ children, style = {} }) => (
    <div
        style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            height: "100%",
            width: "100%",
            ...style,
        }}
    >
        {children}
    </div>
);

const transforms: Record<string, DashboardViewLayoutTransform<any>> = {
    originalLayout: identity,
    layoutWithFullSizeColumns,
    layoutWithInsightsOnly,
    layoutWithKpiOnly,
    layoutWith2Columns,
    layoutWithChangedRowOrder,
    layoutWithAddedWidget,
};

const transformNames: Record<string, string> = {
    originalLayout: "Original layout",
    layoutWithFullSizeColumns: "Rows layout",
    layoutWithInsightsOnly: "Show only insight widgets",
    layoutWithKpiOnly: "Show only kpi widgets",
    layoutWith2Columns: "Two columns layout",
    layoutWithChangedRowOrder: "With changed row order",
    layoutWithAddedWidget: "With widget added into the layout and rendered in your own way",
};

const buttonsBarStyle = { marginBottom: 10 };
const buttonStyle = { marginRight: 5, marginBottom: 5 };

const CustomDashboardView: React.FC = () => {
    const [transformName, setTransformName] = useState<string | undefined>("originalLayout");

    useLayoutEffect(() => {
        // Trigger resize event on layout transform change to ensure that charts are resized properly
        window.dispatchEvent(new Event("resize"));
    }, [transformName]);

    const transform = transformName ? transforms[transformName] : undefined;

    return (
        <>
            <div style={buttonsBarStyle}>
                {Object.keys(transforms).map((name) => {
                    return (
                        <button
                            key={name}
                            style={{ ...buttonStyle, fontWeight: transformName === name ? "bold" : "normal" }}
                            onClick={() => setTransformName(name)}
                        >
                            {transformNames[name]}
                        </button>
                    );
                })}
            </div>
            <DashboardView
                dashboard={dashboardRef}
                config={config}
                transformLayout={transform}
                widgetRenderer={({ predicates, customWidget, renderedWidget }) => {
                    if (predicates.isCustomWidget()) {
                        return <Center>{customWidget}</Center>;
                    }

                    // Fallback all other widgets to common rendering
                    return renderedWidget;
                }}
                isReadOnly
            />
        </>
    );
};

export default CustomDashboardView;
