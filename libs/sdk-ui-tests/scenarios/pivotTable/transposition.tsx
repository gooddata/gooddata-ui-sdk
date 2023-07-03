// (C) 2007-2019 GoodData Corporation

import { IPivotTableProps, PivotTable } from "@gooddata/sdk-ui-pivot";
import { scenariosFor } from "../../src/index.js";
import {
    PivotTableWithSingleMeasureAndTwoRowsAndCols,
    PivotTableWithTwoMeasuresAndSingleRowAttr,
} from "./base.js";

export default scenariosFor<IPivotTableProps>("PivotTable", PivotTable)
    .withGroupNames("transposition")
    .withVisualTestConfig({ screenshotSize: { width: 1000, height: 800 } })
    .addScenario("single measure pivot with both attributes and metrics in rows", {
        ...PivotTableWithSingleMeasureAndTwoRowsAndCols,
        config: {
            measureGroupDimension: "rows",
            // columnSizing: {
            //     defaultWidth: "autoresizeAll"
            // }
        },
    })
    .addScenario("two measures with single row attr with metrics in rows", {
        ...PivotTableWithTwoMeasuresAndSingleRowAttr,
        config: {
            measureGroupDimension: "rows",
            // columnSizing: {
            //     defaultWidth: "autoresizeAll"
            // }
        },
    });
