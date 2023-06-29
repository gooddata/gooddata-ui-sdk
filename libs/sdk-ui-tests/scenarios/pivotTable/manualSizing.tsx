// (C) 2007-2019 GoodData Corporation

import { copyWithModifiedProps, scenariosFor } from "../../src/index.js";
import {
    IPivotTableProps,
    newWidthForAllColumnsForMeasure,
    newWidthForAttributeColumn,
    newWidthForSelectedColumns,
    PivotTable,
} from "@gooddata/sdk-ui-pivot";
import {
    PivotTableWithTwoMeasuresAndSingleRowAttr,
    PivotTableWithSingleMeasureAndTwoRowsAndCols,
} from "./base.js";
import { ReferenceMd } from "@gooddata/reference-workspace";

const ATTRIBUTE_WIDTH = 400;
const MEASURE_WIDTH = 60;

const attributeColumnWidthItem = newWidthForAttributeColumn(ReferenceMd.Product.Name, ATTRIBUTE_WIDTH);
const measureColumnWidthItemSimple = newWidthForSelectedColumns(ReferenceMd.Amount, [], MEASURE_WIDTH);
const weakMeasureColumnWidthItem = newWidthForAllColumnsForMeasure(ReferenceMd.Amount, MEASURE_WIDTH);

const justManualResizing = scenariosFor<IPivotTableProps>("PivotTable", PivotTable)
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

const withColumnAutoresize = scenariosFor<IPivotTableProps>("PivotTable", PivotTable)
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
const withGrowToFit = scenariosFor<IPivotTableProps>("PivotTable", PivotTable)
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
const withAllAutoresizing = scenariosFor<IPivotTableProps>("PivotTable", PivotTable)
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
