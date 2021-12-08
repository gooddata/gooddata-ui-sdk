// (C) 2007-2021 GoodData Corporation

import React from "react";
import { ColumnChart } from "@gooddata/sdk-ui-charts";
import { modifyAttribute, newAttributeSort } from "@gooddata/sdk-model";
import { Md } from "../../md";

const LocationCity = modifyAttribute(Md.LocationCity, (a) => a.localId("locationCity"));

const style = { height: 300 };

export const AttributeSortingExample: React.FC = () => {
    return (
        <div style={style} className="s-attribute-sorting">
            <ColumnChart
                measures={[Md.$TotalSales]}
                viewBy={LocationCity}
                sortBy={[newAttributeSort(LocationCity, "desc")]}
            />
        </div>
    );
};
