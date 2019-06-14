// (C) 2007-2019 GoodData Corporation
import React, { Component } from "react";
import { Headline, Model } from "@gooddata/react-components";

import "@gooddata/react-components/styles/css/main.css";

import ExampleWithExport from "./utils/ExampleWithExport";
import {
    dateDataSetUri,
    franchiseFeesIdentifier,
    franchiseFeesAdRoyaltyIdentifier,
    projectId,
} from "../utils/fixtures";

export class HeadlineExportExample extends Component {
    onLoadingChanged(...params) {
        // eslint-disable-next-line no-console
        console.info("HeadlineExportExample onLoadingChanged", ...params);
    }

    onError(...params) {
        // eslint-disable-next-line no-console
        console.info("HeadlineExportExample onError", ...params);
    }

    render() {
        const primaryMeasure = Model.measure(franchiseFeesIdentifier).format("#,##0");

        const secondaryMeasure = Model.measure(franchiseFeesAdRoyaltyIdentifier).format("#,##0");

        const filters = [Model.absoluteDateFilter(dateDataSetUri, "2017-01-01", "2017-12-31")];

        return (
            <ExampleWithExport>
                {onExportReady => (
                    <div className="s-headline" style={{ display: "flex" }}>
                        <Headline
                            projectId={projectId}
                            primaryMeasure={primaryMeasure}
                            secondaryMeasure={secondaryMeasure}
                            filters={filters}
                            onExportReady={onExportReady}
                            onLoadingChanged={this.onLoadingChanged}
                            onError={this.onError}
                        />
                    </div>
                )}
            </ExampleWithExport>
        );
    }
}

export default HeadlineExportExample;
