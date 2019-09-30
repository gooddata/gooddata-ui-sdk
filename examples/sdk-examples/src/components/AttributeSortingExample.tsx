// (C) 2007-2019 GoodData Corporation

import React from "react";
import { ColumnChart, Model } from "@gooddata/sdk-ui";

import "@gooddata/sdk-ui/styles/css/main.css";

import { totalSalesIdentifier, locationCityDisplayFormIdentifier, projectId } from "../utils/fixtures";
import { useBackend } from "../backend";

const style = { height: 300 };

export const AttributeSortingExample: React.FC = () => {
    const backend = useBackend();

    return (
        <div style={style} className="s-attribute-sorting">
            <ColumnChart
                backend={backend}
                workspace={projectId}
                measures={[Model.measure(totalSalesIdentifier).localIdentifier("totalSales")]}
                viewBy={Model.attribute(locationCityDisplayFormIdentifier).localIdentifier(
                    locationCityDisplayFormIdentifier,
                )}
                sortBy={[Model.attributeSortItem(locationCityDisplayFormIdentifier, "desc")]}
            />
        </div>
    );
};
