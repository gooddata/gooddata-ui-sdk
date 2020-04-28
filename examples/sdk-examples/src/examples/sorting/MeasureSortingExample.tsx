// (C) 2007-2019 GoodData Corporation

import React from "react";
import { ColumnChart } from "@gooddata/sdk-ui-charts";
import { newMeasure, newAttribute, newMeasureSort } from "@gooddata/sdk-model";

import { totalSalesIdentifier, monthDateIdentifier, projectId } from "../../constants/fixtures";
import { useBackend } from "../../context/auth";

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
