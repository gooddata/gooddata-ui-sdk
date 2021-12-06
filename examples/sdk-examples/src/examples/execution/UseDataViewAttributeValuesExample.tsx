// (C) 2007-2019 GoodData Corporation
import React from "react";
import { LoadingComponent, ErrorComponent, useExecutionDataView } from "@gooddata/sdk-ui";
import toPairs from "lodash/toPairs";
import groupBy from "lodash/groupBy";

import { workspace } from "../../constants/fixtures";
import { Ldm } from "../../md";
import { useBackend } from "../../context/auth";

const getAttributeHeaderItemName = (x: any) => x.attributeHeaderItem.name;
const withIndex = (fn: any) => {
    let index = 0;
    return (...args: any) => fn(index++, ...args);
};

export const UseDataViewAttributeValuesExample: React.FC = () => {
    const backend = useBackend();
    const execution = backend
        .workspace(workspace)
        .execution()
        .forItems([Ldm.LocationState, Ldm.LocationName.Default]);
    const { result, error, status } = useExecutionDataView({ execution });

    let renderAttributeValues: React.ReactNode = null;
    if (result) {
        const [[locationStateHeaders, locationNameHeaders]] = result.dataView.headerItems;
        const locationStates = locationStateHeaders.map(getAttributeHeaderItemName);
        const locations = locationNameHeaders.map(getAttributeHeaderItemName);
        const locationsByState = groupBy(
            locations,
            withIndex((index: number) => locationStates[index]),
        );
        const locationStateLocationsPairs = toPairs(locationsByState);
        renderAttributeValues = (
            <div>
                <ul className="attribute-values s-execute-attribute-values">
                    {locationStateLocationsPairs.map(([locationState, _locations]) => (
                        <li key={locationState}>
                            <strong>{locationState}</strong>
                            <ul>
                                {_locations.map((location) => (
                                    <li key={location}>{location}</li>
                                ))}
                            </ul>
                        </li>
                    ))}
                </ul>
            </div>
        );
    }

    return (
        <div>
            {status === "error" && (
                <ErrorComponent
                    message="There was an error getting your execution"
                    description={JSON.stringify(error, null, "  ")}
                />
            )}
            {status === "loading" && <LoadingComponent />}
            {status === "success" && renderAttributeValues}
        </div>
    );
};
