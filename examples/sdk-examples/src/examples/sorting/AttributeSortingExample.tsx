// (C) 2007-2019 GoodData Corporation

import React from "react";
import { ColumnChart } from "@gooddata/sdk-ui-charts";
import { newAttributeSort } from "@gooddata/sdk-model";
import { Ldm, LdmExt } from "../../md";

const style = { height: 300 };

export const AttributeSortingExample: React.FC = () => {
    return (
        <div style={style} className="s-attribute-sorting">
            <ColumnChart
                measures={[Ldm.$TotalSales]}
                viewBy={LdmExt.LocationCity}
                sortBy={[newAttributeSort(LdmExt.LocationCity, "desc")]}
            />
        </div>
    );
};
