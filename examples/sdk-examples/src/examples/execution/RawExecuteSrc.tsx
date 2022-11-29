// (C) 2007-2022 GoodData Corporation
import React from "react";
import {
    RawExecute,
    LoadingComponent,
    ErrorComponent,
    IExecuteErrorComponentProps,
    useBackendStrict,
} from "@gooddata/sdk-ui";
import { IResultAttributeHeader, IResultHeader } from "@gooddata/sdk-model";
import toPairs from "lodash/toPairs";
import groupBy from "lodash/groupBy";

import { workspace } from "../../constants/fixtures";
import * as Md from "../../md/full";

const getAttributeHeaderItemName = (x: IResultHeader) =>
    (x as IResultAttributeHeader).attributeHeaderItem.name;
const withIndex = (fn: any) => {
    let index = 0;
    return (...args: any) => fn(index++, ...args);
};

const CustomErrorComponent = ({ error }: IExecuteErrorComponentProps) => (
    <ErrorComponent
        message="There was an error getting your execution"
        description={JSON.stringify(error, null, "  ")}
    />
);

const RawExecuteExample: React.FC = () => {
    const backend = useBackendStrict();
    const execution = backend
        .workspace(workspace)
        .execution()
        .forItems([Md.LocationState, Md.LocationName.Default]);

    return (
        <RawExecute
            execution={execution}
            ErrorComponent={CustomErrorComponent}
            LoadingComponent={LoadingComponent}
        >
            {({ result }) => {
                const [[locationStateHeaders, locationNameHeaders]] = result!.dataView.headerItems;
                const locationStates = locationStateHeaders.map(getAttributeHeaderItemName);
                const locations = locationNameHeaders.map(getAttributeHeaderItemName);
                const locationsByState = groupBy(
                    locations,
                    withIndex((index: number) => locationStates[index]),
                );
                const locationStateLocationsPairs = toPairs(locationsByState);

                return (
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
            }}
        </RawExecute>
    );
};

export default RawExecuteExample;
