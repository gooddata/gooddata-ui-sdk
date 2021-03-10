// (C) 2007-2018 GoodData Corporation
import React, { useState, useLayoutEffect } from "react";
import {
    DashboardView,
    DashboardLayoutItemModifications,
    DashboardLayoutTransform,
    DashboardLayoutItemsSelector,
} from "@gooddata/sdk-ui-ext";
import { idRef } from "@gooddata/sdk-model";
import { MAPBOX_TOKEN } from "../../constants/fixtures";
import identity from "lodash/identity";

const dashboardRef = idRef("aeO5PVgShc0T");

const config = { mapboxToken: MAPBOX_TOKEN };

// You can prepare your common modifications first
const makeItemFullSize: DashboardLayoutItemModifications = (item) => item.size({ xl: { gridWidth: 12 } });

// You can prepare also your common layout selectors
const selectAllItemsWithKpis: DashboardLayoutItemsSelector = (items) =>
    items.filter((item) => item.isKpiWidgetItem());

const selectAllItemsWithInsights: DashboardLayoutItemsSelector = (items) =>
    items.filter((item) => item.isInsightWidgetItem());

// Define layout transforms
const layoutWithFullSizeItems: DashboardLayoutTransform = (layout) =>
    layout.modifySections((section) => section.modifyItems(makeItemFullSize));

const layoutWithHalfSizeItems: DashboardLayoutTransform = (layout) => {
    const facade = layout.facade();
    const flatItems = facade.sections().flatMap((section) => {
        return section.items().all();
    });

    layout.removeSections();

    layout.addSection((section) => {
        flatItems.forEach((item) => {
            section.addItem({ gridWidth: 6 }, (i) => i.widget(item.widget()));
        });
        return section;
    });

    return layout;
};

const layoutWithInsightsOnly: DashboardLayoutTransform = (layout) =>
    layout.modifySections((section) => section.removeItems(selectAllItemsWithKpis)).removeEmptySections();

const layoutWithKpiOnly: DashboardLayoutTransform = (layout) =>
    layout.modifySections((section) => section.removeItems(selectAllItemsWithInsights)).removeEmptySections();

const layoutWithChangedSectionOrder: DashboardLayoutTransform = (layout) => layout.moveSection(0, 1);

const layoutWithAddedWidget: DashboardLayoutTransform = (layout) => {
    const sectionIndex = 0;
    const itemIndex = 1;

    return layout.modifySection(sectionIndex, (section) =>
        section.addItem(
            { gridWidth: 8 },
            // You can set really everything as your custom content
            (item) =>
                item.widget(
                    <Center style={{ background: "#333" }}>
                        <button onClick={() => alert("Hello world!")}>Click me!</button>
                    </Center>,
                ),
            itemIndex,
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

const transforms: Record<string, DashboardLayoutTransform> = {
    originalLayout: identity,
    layoutWithFullSizeItems,
    layoutWithInsightsOnly,
    layoutWithKpiOnly,
    layoutWithHalfSizeItems,
    layoutWithChangedSectionOrder,
    layoutWithAddedWidget,
};

const transformNames: Record<string, string> = {
    originalLayout: "Original layout",
    layoutWithFullSizeItems: "Rows layout",
    layoutWithInsightsOnly: "Show only insight widgets",
    layoutWithKpiOnly: "Show only kpi widgets",
    layoutWithHalfSizeItems: "Two columns layout",
    layoutWithChangedSectionOrder: "With changed section order",
    layoutWithAddedWidget: "With widget added into the layout and rendered in your own way",
};

const buttonsBarStyle = { marginBottom: 10 };
const buttonStyle = { marginRight: 5, marginBottom: 5 };

const DashboardViewWithAdvancedCustomizations: React.FC = () => {
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

export default DashboardViewWithAdvancedCustomizations;
