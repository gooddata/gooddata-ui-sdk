// (C) 2007-2025 GoodData Corporation

import { copyWithModifiedProps, scenariosFor } from "../../src/index.js";
import {
    PivotTableNext,
    IPivotTableNextProps,
    newWidthForAllColumnsForMeasure,
    newWidthForAttributeColumn,
    setNewWidthForSelectedColumns,
} from "@gooddata/sdk-ui-pivot/next";
import {
    PivotTableWithTwoMeasuresAndSingleRowAttr,
    PivotTableWithSingleMeasureAndTwoRowsAndCols,
} from "./base.js";
import { ReferenceMd } from "@gooddata/reference-workspace";

const ATTRIBUTE_WIDTH = 400;
const MEASURE_WIDTH = 60;

const attributeColumnWidthItem = newWidthForAttributeColumn(ReferenceMd.Product.Name, ATTRIBUTE_WIDTH);
const measureColumnWidthItemSimple = setNewWidthForSelectedColumns(ReferenceMd.Amount, [], MEASURE_WIDTH);
const weakMeasureColumnWidthItem = newWidthForAllColumnsForMeasure(ReferenceMd.Amount, MEASURE_WIDTH);

const justManualResizing = scenariosFor<IPivotTableNextProps>("PivotTableNext", PivotTableNext)
    .withGroupNames("manual-resizing", "no other options")
    .withVisualTestConfig({ screenshotSize: { width: 1200, height: 800 } })
    .withDefaultTags("vis-config-only", "mock-no-scenario-meta")
    .withDefaultBackendSettings({
        enableTableColumnsManualResizing: true,
    })
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
    .addScenario("table with multiple measure columns and weak measure size", {
        ...PivotTableWithSingleMeasureAndTwoRowsAndCols,
        config: {
            columnSizing: {
                columnWidths: [weakMeasureColumnWidthItem],
                defaultWidth: "unset",
                growToFit: false,
            },
        },
    });

const withColumnAutoresize = scenariosFor<IPivotTableNextProps>("PivotTableNext", PivotTableNext)
    .withGroupNames("manual-resizing", "combined with column autoresize")
    .withVisualTestConfig({ screenshotSize: { width: 1200, height: 800 } })
    .withDefaultTags("vis-config-only", "mock-no-scenario-meta")
    .withDefaultBackendSettings({
        enableTableColumnsManualResizing: true,
        enableTableColumnsAutoResizing: true,
    })
    .addCustomizedScenarios(
        justManualResizing,
        copyWithModifiedProps((props) => {
            props.config!.columnSizing!.defaultWidth = "autoresizeAll";

            return props;
        }),
    );
const withGrowToFit = scenariosFor<IPivotTableNextProps>("PivotTableNext", PivotTableNext)
    .withGroupNames("manual-resizing", "combined with growToFit")
    .withVisualTestConfig({ screenshotSize: { width: 1200, height: 800 } })
    .withDefaultTags("vis-config-only", "mock-no-scenario-meta")
    .withDefaultBackendSettings({
        enableTableColumnsManualResizing: true,
        enableTableColumnsGrowToFit: true,
    })
    .addCustomizedScenarios(
        justManualResizing,
        copyWithModifiedProps((props) => {
            props.config!.columnSizing!.growToFit = true;

            return props;
        }),
    );
const withAllAutoresizing = scenariosFor<IPivotTableNextProps>("PivotTableNext", PivotTableNext)
    .withGroupNames("manual-resizing", "combined with growToFit and autoResize")
    .withVisualTestConfig({ screenshotSize: { width: 1200, height: 800 } })
    .withDefaultTags("vis-config-only", "mock-no-scenario-meta")
    .withDefaultBackendSettings({
        enableTableColumnsManualResizing: true,
        enableTableColumnsAutoResizing: true,
        enableTableColumnsGrowToFit: true,
    })
    .addCustomizedScenarios(
        justManualResizing,
        copyWithModifiedProps((props) => {
            props.config!.columnSizing!.growToFit = true;
            props.config!.columnSizing!.defaultWidth = "autoresizeAll";

            return props;
        }),
    );
export default [justManualResizing, withColumnAutoresize, withGrowToFit, withAllAutoresizing];
