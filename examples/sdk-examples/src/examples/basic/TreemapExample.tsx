// (C) 2007-2019 GoodData Corporation
import React from "react";
import { Treemap } from "@gooddata/sdk-ui-charts";
import { newMeasure, newAttribute } from "@gooddata/sdk-model";

import {
    numberOfChecksIdentifier,
    locationCityDisplayFormIdentifier,
    locationStateDisplayFormIdentifier,
    workspace,
} from "../../constants/fixtures";
import { useBackend } from "../../context/auth";

const numberOfChecks = newMeasure(numberOfChecksIdentifier, m => m.format("#,##0").alias("# Checks"));

const locationState = newAttribute(locationStateDisplayFormIdentifier);

const locationCity = newAttribute(locationCityDisplayFormIdentifier);

const style = { height: 300 };

export const TreemapExample: React.FC = () => {
    const backend = useBackend();

    return (
        <div style={style} className="s-tree-map">
            <Treemap
                backend={backend}
                workspace={workspace}
                measures={[numberOfChecks]}
                viewBy={locationState}
                segmentBy={locationCity}
            />
        </div>
    );
};
