// (C) 2007-2019 GoodData Corporation

import React from "react";
import { ColumnChart } from "@gooddata/sdk-ui";
import { newAttribute, newMeasure, newAttributeSort } from "@gooddata/sdk-model";

import { totalSalesIdentifier, locationCityDisplayFormIdentifier, projectId } from "../../constants/fixtures";
import { useBackend } from "../../context/auth";

const style = { height: 300 };

export const AttributeSortingExample: React.FC = () => {
    const backend = useBackend();

    return (
        <div style={style} className="s-attribute-sorting">
            <ColumnChart
                backend={backend}
                workspace={projectId}
                measures={[newMeasure(totalSalesIdentifier)]}
                viewBy={newAttribute(locationCityDisplayFormIdentifier, a =>
                    a.localId(locationCityDisplayFormIdentifier),
                )}
                sortBy={[newAttributeSort(locationCityDisplayFormIdentifier, "desc")]}
            />
        </div>
    );
};
