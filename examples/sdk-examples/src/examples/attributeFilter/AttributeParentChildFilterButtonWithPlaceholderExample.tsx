// (C) 2007-2020 GoodData Corporation
import React from "react";
import {
    IPlaceholder,
    newComposedPlaceholder,
    newPlaceholder,
    OnError,
    OnLoadingChanged,
    PlaceholdersProvider,
} from "@gooddata/sdk-ui";
import { AttributeFilterButton } from "@gooddata/sdk-ui-filters";
import { BarChart } from "@gooddata/sdk-ui-charts";
import {
    attributeDisplayFormRef,
    IAttributeFilter,
    idRef,
    newNegativeAttributeFilter,
} from "@gooddata/sdk-model";
import { Md, MdExt } from "../../md";

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

    return (
        <div className="s-attribute-filter">
            <div style={{ display: "flex" }}>
                <AttributeFilterButton connectToPlaceholder={stateFilterPlaceholder} onError={onError} />
                <AttributeFilterButton
                    parentFilters={[stateFilterPlaceholder]}
                    parentFilterOverAttribute={idRef(MdExt.locationIdAttributeIdentifier)}
                    connectToPlaceholder={cityFilterPlaceholder}
                />
            </div>
            <div style={{ height: 300 }} className="s-line-chart">
                <BarChart
                    measures={[MdExt.TotalSales2]}
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
