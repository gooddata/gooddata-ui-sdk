// (C) 2007-2019 GoodData Corporation

import React from "react";
import { ColumnChart, Model } from "@gooddata/sdk-ui";

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
                measures={[Model.measure(totalSalesIdentifier).localIdentifier(totalSalesIdentifier)]}
                viewBy={Model.attribute(monthDateIdentifier).localIdentifier(monthDateIdentifier)}
                sortBy={[Model.measureSortItem(totalSalesIdentifier, "desc")]}
            />
        </div>
    );
};
