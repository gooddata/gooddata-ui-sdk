// (C) 2007-2022 GoodData Corporation

import React from "react";
import { ColumnChart } from "@gooddata/sdk-ui-charts";
import { newAttributeSort } from "@gooddata/sdk-model";
import * as Md from "../../md/full";

const style = { height: 300 };

export const AttributeSortingExample: React.FC = () => {
    return (
        <div style={style} className="s-attribute-sorting">
            <ColumnChart
                measures={[Md.$TotalSales]}
                viewBy={Md.LocationCity}
                sortBy={[newAttributeSort(Md.LocationCity, "desc")]}
            />
        </div>
    );
};
