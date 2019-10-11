// (C) 2007-2019 GoodData Corporation

import React from "react";
import { ColumnChart } from "@gooddata/sdk-ui";
import { newMeasure, newAttribute, newMeasureSort } from "@gooddata/sdk-model";

import "@gooddata/sdk-ui/styles/css/main.css";

import { totalSalesIdentifier, monthDateIdentifier, projectId } from "../utils/fixtures";
import { useBackend } from "../backend";

const style = { height: 300 };

export const MeasureSortingExample: React.FC = () => {
    const backend = useBackend();

    return (
        <div style={style} className="s-measure-sorting">
            <ColumnChart
                backend={backend}
                workspace={projectId}
                measures={[newMeasure(totalSalesIdentifier, m => m.localId(totalSalesIdentifier))]}
                viewBy={newAttribute(monthDateIdentifier)}
                sortBy={[newMeasureSort(totalSalesIdentifier, "desc")]}
            />
        </div>
    );
};
