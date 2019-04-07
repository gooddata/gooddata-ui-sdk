// (C) 2007-2019 GoodData Corporation
import React, { Component } from "react";
import { Treemap, Model } from "@gooddata/react-components";

import "@gooddata/react-components/styles/css/main.css";

import {
    numberOfChecksIdentifier,
    locationCityDisplayFormIdentifier,
    locationStateDisplayFormIdentifier,
    projectId,
} from "../utils/fixtures";

export class TreeMapExample extends Component {
    onLoadingChanged(...params) {
        // eslint-disable-next-line no-console
        console.info("TreeMapExample onLoadingChanged", ...params);
    }

    onError(...params) {
        // eslint-disable-next-line no-console
        console.info("TreeMapExample onLoadingChanged", ...params);
    }

    render() {
        const numberOfChecks = Model.measure(numberOfChecksIdentifier)
            .format("#,##0")
            .alias("# Checks");

        const locationState = Model.attribute(locationStateDisplayFormIdentifier);

        const locationCity = Model.attribute(locationCityDisplayFormIdentifier);

        return (
            <div style={{ height: 300 }} className="s-tree-map">
                <Treemap
                    projectId={projectId}
                    measures={[numberOfChecks]}
                    viewBy={locationState}
                    segmentBy={locationCity}
                    onLoadingChanged={this.onLoadingChanged}
                    onError={this.onError}
                />
            </div>
        );
    }
}

export default TreeMapExample;
