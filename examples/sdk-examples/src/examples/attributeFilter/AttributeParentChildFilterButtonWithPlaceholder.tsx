// (C) 2007-2020 GoodData Corporation
import React, { useState } from "react";
import {
    ErrorComponent,
    newPlaceholder,
    OnError,
    OnLoadingChanged,
    PlaceholdersProvider,
    newComposedPlaceholder,
    IPlaceholder,
} from "@gooddata/sdk-ui";
import { AttributeFilterButton } from "@gooddata/sdk-ui-filters";
import { BarChart } from "@gooddata/sdk-ui-charts";
import {
    attributeDisplayFormRef,
    IAttributeFilter,
    idRef,
    newPositiveAttributeFilter,
} from "@gooddata/sdk-model";
import { Ldm, LdmExt } from "../../ldm";

const stateFilterPlaceholder = newPlaceholder<IAttributeFilter>(
    newPositiveAttributeFilter(attributeDisplayFormRef(Ldm.LocationState), {
        uris: [],
    }),
);

const cityFilterPlaceholder = newPlaceholder<IAttributeFilter>(
    newPositiveAttributeFilter(attributeDisplayFormRef(Ldm.LocationCity), {
        uris: [],
    }),
);

const composedLocationFilterPlaceholder = newComposedPlaceholder<IPlaceholder<IAttributeFilter>[]>([
    stateFilterPlaceholder,
    cityFilterPlaceholder,
]);

const AttributeParentChildFilterButton: React.FC = () => {
    const [error, setError] = useState<any>();

    const onError: OnError = (...params) => {
        setError(params);
        // eslint-disable-next-line no-console
        console.info("AttributeFilterExample onLoadingChanged", ...params);
    };

    const onLoadingChanged: OnLoadingChanged = (...params) => {
        // eslint-disable-next-line no-console
        console.info("AttributeFilterExample onLoadingChanged", ...params);
    };

    return (
        <div className="s-attribute-filter">
            <div style={{ display: "flex" }}>
                <AttributeFilterButton connectToPlaceholder={stateFilterPlaceholder} />
                <AttributeFilterButton
                    parentFilters={[stateFilterPlaceholder]}
                    parentFilterOverAttribute={idRef(LdmExt.locationIdAttributeIdentifier)}
                    connectToPlaceholder={cityFilterPlaceholder}
                />
            </div>
            <div style={{ height: 300 }} className="s-line-chart">
                {error ? (
                    <ErrorComponent message={error} />
                ) : (
                    <BarChart
                        measures={[LdmExt.TotalSales2]}
                        viewBy={Ldm.LocationCity}
                        filters={[composedLocationFilterPlaceholder]}
                        onLoadingChanged={onLoadingChanged}
                        onError={onError}
                    />
                )}
            </div>
        </div>
    );
};

export const AttributeParentChildFilterButtonWithPlaceholder: React.FC = () => {
    return (
        <PlaceholdersProvider>
            <AttributeParentChildFilterButton />
        </PlaceholdersProvider>
    );
};
