// (C) 2007-2019 GoodData Corporation

import { copyWithModifiedProps, scenariosFor } from "../../src";
import { IPivotTableProps, PivotTable } from "@gooddata/sdk-ui-pivot";
import { PivotTableWithTwoMeasuresAndSingleRowAttr } from "./base";
import { attributeLocalId, measureLocalId } from "@gooddata/sdk-model";
import { ReferenceLdm } from "@gooddata/reference-workspace";

const ATTRIBUTE_WIDTH = 400;
const MEASURE_WIDTH = 60;

const attributeColumnWidthItem = {
    attributeColumnWidthItem: {
        width: ATTRIBUTE_WIDTH,
        attributeIdentifier: attributeLocalId(ReferenceLdm.Product.Name),
    },
};

const measureColumnWidthItemSimple = {
    measureColumnWidthItem: {
        width: MEASURE_WIDTH,
        locators: [
            {
                measureLocatorItem: {
                    measureIdentifier: measureLocalId(ReferenceLdm.Amount),
                },
            },
        ],
    },
};

const justManualResizing = scenariosFor<IPivotTableProps>("PivotTable", PivotTable)
    .withGroupNames("manual-resizing", "no other options")
    .withVisualTestConfig({ screenshotSize: { width: 1200, height: 800 } })
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
    });
const withColumnAutoresize = scenariosFor<IPivotTableProps>("PivotTable", PivotTable)
    .withGroupNames("manual-resizing", "combined with column autoresize")
    .withVisualTestConfig({ screenshotSize: { width: 1200, height: 800 } })
    .withDefaultTags("vis-config-only", "mock-no-scenario-meta")
    .addCustomizedScenarios(
        justManualResizing,
        copyWithModifiedProps((props) => {
            props.config!.columnSizing!.defaultWidth = "viewport";

            return props;
        }),
    );
const withGrowToFit = scenariosFor<IPivotTableProps>("PivotTable", PivotTable)
    .withGroupNames("manual-resizing", "combined with growToFit")
    .withVisualTestConfig({ screenshotSize: { width: 1200, height: 800 } })
    .withDefaultTags("vis-config-only", "mock-no-scenario-meta")
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
    .addCustomizedScenarios(
        justManualResizing,
        copyWithModifiedProps((props) => {
            props.config!.columnSizing!.growToFit = true;
            props.config!.columnSizing!.defaultWidth = "viewport";

            return props;
        }),
    );
export default [justManualResizing, withColumnAutoresize, withGrowToFit, withAllAutoresizing];
