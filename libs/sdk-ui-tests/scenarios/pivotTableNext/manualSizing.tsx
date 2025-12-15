// (C) 2007-2025 GoodData Corporation

import { ReferenceMd } from "@gooddata/reference-workspace";
import {
    type IPivotTableNextProps,
    PivotTableNext,
    newWidthForAllColumnsForMeasure,
    newWidthForAttributeColumn,
    setNewWidthForSelectedColumns,
} from "@gooddata/sdk-ui-pivot/next";

import {
    PivotTableWithSingleMeasureAndTwoRowsAndCols,
    PivotTableWithTwoMeasuresAndSingleRowAttr,
} from "./base.js";
import { copyWithModifiedProps, scenariosFor } from "../../src/index.js";

const ATTRIBUTE_WIDTH = 400;
const MEASURE_WIDTH = 60;

const attributeColumnWidthItem = newWidthForAttributeColumn(ReferenceMd.Product.Name, ATTRIBUTE_WIDTH);
const measureColumnWidthItemSimple = setNewWidthForSelectedColumns(ReferenceMd.Amount, [], MEASURE_WIDTH);
const weakMeasureColumnWidthItem = newWidthForAllColumnsForMeasure(ReferenceMd.Amount, MEASURE_WIDTH);

const justManualResizing = scenariosFor<IPivotTableNextProps>("PivotTableNext", PivotTableNext)
    .withGroupNames("manual-resizing", "no other options")
    .withVisualTestConfig({
        screenshotSize: { width: 1200, height: 800 },
        viewports: [{ label: "desktop", width: 1464, height: 768 }],
        misMatchThreshold: 0.01,
    })
    .withDefaultTags("vis-config-only", "mock-no-scenario-meta")
    .addScenario("simple table with custom attribute column size", {
        ...PivotTableWithTwoMeasuresAndSingleRowAttr,
        config: {
            columnSizing: {
                columnWidths: [attributeColumnWidthItem],
                defaultWidth: "unset",
                growToFit: false,
            },
        },
    })
    .addScenario("simple table with custom metric column size", {
        ...PivotTableWithTwoMeasuresAndSingleRowAttr,
        config: {
            columnSizing: {
                columnWidths: [measureColumnWidthItemSimple],
                defaultWidth: "unset",
                growToFit: false,
            },
        },
    })
    .addScenario("simple table with attribute and metric column size", {
        ...PivotTableWithTwoMeasuresAndSingleRowAttr,
        config: {
            columnSizing: {
                columnWidths: [attributeColumnWidthItem, measureColumnWidthItemSimple],
                defaultWidth: "unset",
                growToFit: false,
            },
        },
    })
    .addScenario(
        "table with multiple measure columns and weak measure size",
        {
            ...PivotTableWithSingleMeasureAndTwoRowsAndCols,
            config: {
                columnSizing: {
                    columnWidths: [weakMeasureColumnWidthItem],
                    defaultWidth: "unset",
                    growToFit: false,
                },
            },
        },
        (m) => m.withTags("no-plug-viz-tests"), // skip pluggable due to flaky sizing
    );

const withColumnAutoresize = scenariosFor<IPivotTableNextProps>("PivotTableNext", PivotTableNext)
    .withGroupNames("manual-resizing", "combined with column autoresize")
    .withVisualTestConfig({
        screenshotSize: { width: 1200, height: 800 },
        viewports: [{ label: "desktop", width: 1464, height: 768 }],
        misMatchThreshold: 0.01,
    })
    .withDefaultTags("vis-config-only", "mock-no-scenario-meta")
    .addCustomizedScenarios(
        justManualResizing,
        copyWithModifiedProps((props) => {
            props.config!.columnSizing!.defaultWidth = "autoresizeAll";

            return props;
        }),
    );
const withGrowToFit = scenariosFor<IPivotTableNextProps>("PivotTableNext", PivotTableNext)
    .withGroupNames("manual-resizing", "combined with growToFit")
    .withVisualTestConfig({
        screenshotSize: { width: 1200, height: 800 },
        viewports: [{ label: "desktop", width: 1464, height: 768 }],
        misMatchThreshold: 0.01,
    })
    .withDefaultTags("vis-config-only", "mock-no-scenario-meta")
    .addCustomizedScenarios(
        justManualResizing,
        copyWithModifiedProps((props) => {
            props.config!.columnSizing!.growToFit = true;

            return props;
        }),
    );
const withAllAutoresizing = scenariosFor<IPivotTableNextProps>("PivotTableNext", PivotTableNext)
    .withGroupNames("manual-resizing", "combined with growToFit and autoResize")
    .withVisualTestConfig({
        screenshotSize: { width: 1200, height: 800 },
        viewports: [{ label: "desktop", width: 1464, height: 768 }],
        misMatchThreshold: 0.01,
    })
    .withDefaultTags("vis-config-only", "mock-no-scenario-meta")
    .addCustomizedScenarios(
        justManualResizing,
        copyWithModifiedProps((props) => {
            props.config!.columnSizing!.growToFit = true;
            props.config!.columnSizing!.defaultWidth = "autoresizeAll";

            return props;
        }),
    );
export const manualSizing = [justManualResizing, withColumnAutoresize, withGrowToFit, withAllAutoresizing];
