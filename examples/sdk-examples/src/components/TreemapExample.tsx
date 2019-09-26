// (C) 2007-2019 GoodData Corporation
import React from "react";
import { Treemap, Model } from "@gooddata/sdk-ui";

import "@gooddata/sdk-ui/styles/css/main.css";

import {
    numberOfChecksIdentifier,
    locationCityDisplayFormIdentifier,
    locationStateDisplayFormIdentifier,
    projectId,
} from "../utils/fixtures";
import { useBackend } from "../backend";

const numberOfChecks = Model.measure(numberOfChecksIdentifier)
    .format("#,##0")
    .alias("# Checks")
    .localIdentifier("numberOfChecks");

const locationState = Model.attribute(locationStateDisplayFormIdentifier).localIdentifier("locationState");

const locationCity = Model.attribute(locationCityDisplayFormIdentifier).localIdentifier("locationCity");

const style = { height: 300 };

export const TreemapExample: React.FC = () => {
    const backend = useBackend();

    return (
        <div style={style} className="s-tree-map">
            <Treemap
                backend={backend}
                workspace={projectId}
                measures={[numberOfChecks]}
                viewBy={locationState}
                segmentBy={locationCity}
            />
        </div>
    );
};
