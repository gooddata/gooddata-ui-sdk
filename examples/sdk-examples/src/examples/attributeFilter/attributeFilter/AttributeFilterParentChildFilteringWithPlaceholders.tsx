// (C) 2007-2022 GoodData Corporation
import React from "react";
import { IPlaceholder, newComposedPlaceholder, newPlaceholder, PlaceholdersProvider } from "@gooddata/sdk-ui";
import { AttributeFilter } from "@gooddata/sdk-ui-filters";
import { BarChart } from "@gooddata/sdk-ui-charts";
import {
    attributeDisplayFormRef,
    IAttributeFilter,
    idRef,
    modifyMeasure,
    newNegativeAttributeFilter,
} from "@gooddata/sdk-model";
import * as Md from "../../../md/full";

const locationIdAttributeIdentifier = "attr.restaurantlocation.locationid";
const TotalSales = modifyMeasure(Md.$TotalSales, (m) =>
    m.format("#,##0").alias("$ Total Sales").title("Total Sales"),
);

const stateFilterPlaceholder = newPlaceholder<IAttributeFilter>(
    newNegativeAttributeFilter(attributeDisplayFormRef(Md.LocationState), {
        uris: [],
    }),
);

const cityFilterPlaceholder = newPlaceholder<IAttributeFilter>(
    newNegativeAttributeFilter(attributeDisplayFormRef(Md.LocationCity), {
        uris: [],
    }),
);

const composedLocationFilterPlaceholder = newComposedPlaceholder<IPlaceholder<IAttributeFilter>[]>([
    stateFilterPlaceholder,
    cityFilterPlaceholder,
]);

const AttributeFilterParentChildFilteringWithPlaceholders: React.FC = () => {
    return (
        <PlaceholdersProvider>
            <div>
                <div style={{ display: "flex" }}>
                    <AttributeFilter connectToPlaceholder={stateFilterPlaceholder} />
                    <AttributeFilter
                        connectToPlaceholder={cityFilterPlaceholder}
                        parentFilters={[stateFilterPlaceholder]}
                        parentFilterOverAttribute={idRef(locationIdAttributeIdentifier)}
                    />
                </div>
                <div style={{ height: 300 }} className="s-line-chart">
                    <BarChart
                        measures={[TotalSales]}
                        viewBy={Md.LocationCity}
                        filters={[composedLocationFilterPlaceholder]}
                    />
                </div>
            </div>
        </PlaceholdersProvider>
    );
};

export default AttributeFilterParentChildFilteringWithPlaceholders;
