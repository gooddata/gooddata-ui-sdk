// (C) 2007-2022 GoodData Corporation
import React, { useEffect } from "react";
import {
    IPlaceholder,
    newComposedPlaceholder,
    newPlaceholder,
    OnError,
    OnLoadingChanged,
    PlaceholdersProvider,
    usePlaceholder,
    useResolveValueWithPlaceholders,
} from "@gooddata/sdk-ui";
import { AttributeFilterButton } from "@gooddata/sdk-ui-filters";
import { BarChart } from "@gooddata/sdk-ui-charts";
import {
    attributeDisplayFormRef,
    IAttributeFilter,
    idRef,
    modifyMeasure,
    newNegativeAttributeFilter,
} from "@gooddata/sdk-model";
import * as Md from "../../md/full";

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

const AttributeParentChildFilterButtonWithPlaceholder: React.FC = () => {
    const onError: OnError = (...params) => {
        // eslint-disable-next-line no-console
        console.info("AttributeFilterExample error", ...params);
    };

    const onLoadingChanged: OnLoadingChanged = (...params) => {
        // eslint-disable-next-line no-console
        console.info("AttributeFilterExample onLoadingChanged", ...params);
    };

    const parentFilter = useResolveValueWithPlaceholders(stateFilterPlaceholder);

    const [, setChildFilter] = usePlaceholder(cityFilterPlaceholder);

    /**
     * What happens with the component depending on the child filters is handled outside the AttributeFilterButton component.
     */
    useEffect(() => {
        setChildFilter(
            newNegativeAttributeFilter(attributeDisplayFormRef(Md.LocationCity), {
                uris: [],
            }),
        );
    }, [parentFilter, setChildFilter]);

    return (
        <div className="s-attribute-filter">
            <div style={{ display: "flex" }}>
                <AttributeFilterButton connectToPlaceholder={stateFilterPlaceholder} onError={onError} />
                <AttributeFilterButton
                    parentFilters={[stateFilterPlaceholder]}
                    parentFilterOverAttribute={idRef(locationIdAttributeIdentifier)}
                    connectToPlaceholder={cityFilterPlaceholder}
                />
            </div>
            <div style={{ height: 300 }} className="s-line-chart">
                <BarChart
                    measures={[TotalSales]}
                    viewBy={Md.LocationCity}
                    filters={[composedLocationFilterPlaceholder]}
                    onLoadingChanged={onLoadingChanged}
                    onError={onError}
                />
            </div>
        </div>
    );
};

export const AttributeParentChildFilterButtonWithPlaceholderExample: React.FC = () => {
    return (
        <PlaceholdersProvider>
            <AttributeParentChildFilterButtonWithPlaceholder />
        </PlaceholdersProvider>
    );
};
