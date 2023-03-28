// (C) 2007-2023 GoodData Corporation
import React, { useState } from "react";
import { AttributeFilter } from "@gooddata/sdk-ui-filters";
import { BarChart } from "@gooddata/sdk-ui-charts";
import { idRef, newPositiveAttributeFilter, IAttributeFilter, modifyMeasure } from "@gooddata/sdk-model";

import * as Md from "../../../md/full";

const employeeNameDisplayFormIdentifier = "label.employee.employeename";

const SingleSelectionAttributeFilterBasicUsage = () => {
    const [filter, setFilter] = useState<IAttributeFilter>(
        newPositiveAttributeFilter(idRef(employeeNameDisplayFormIdentifier), ["Abbie Adams"]),
    );

    return (
        <div>
            <h4>Single selection Attribute filter - basic usage</h4>
            <AttributeFilter
                filter={filter}
                selectionMode="single"
                onApply={(filter, _isInverted, _selectionMode) => {
                    setFilter(filter);
                }}
            />
        </div>
    );
};

const TotalSales = modifyMeasure(Md.$TotalSales, (m) =>
    m.format("#,##0").alias("$ Total Sales").title("Total Sales"),
);

const SingleSelectionAttributeFilterConnectedToVisualization: React.FC = () => {
    const [filter, setFilter] = useState<IAttributeFilter>(
        newPositiveAttributeFilter(Md.LocationCity, {
            uris: ["/gdc/md/xms7ga4tf3g3nzucd8380o2bev8oeknp/obj/2208/elements?id=6340130"],
        }),
    );

    return (
        <div>
            <h4>Single selection Attribute filter - connected to visualization</h4>
            <AttributeFilter filter={filter} selectionMode="single" onApply={setFilter} />
            <div style={{ height: 300 }}>
                <BarChart measures={[TotalSales]} viewBy={Md.LocationCity} filters={[filter]} />
            </div>
        </div>
    );
};

export const SingleSelectionAttributeFilter = () => {
    return (
        <div>
            <SingleSelectionAttributeFilterBasicUsage />
            <SingleSelectionAttributeFilterConnectedToVisualization />
        </div>
    );
};

export default SingleSelectionAttributeFilter;
