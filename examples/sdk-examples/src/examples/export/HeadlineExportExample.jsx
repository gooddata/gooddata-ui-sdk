// (C) 2007-2019 GoodData Corporation
import React, { Component } from "react";
import { Headline } from "@gooddata/sdk-ui";
import { newMeasure, newAbsoluteDateFilter } from "@gooddata/sdk-model";

import "@gooddata/sdk-ui/styles/css/main.css";

import ExampleWithExport from "../../components/ExampleWithExport";
import {
    dateDataSetUri,
    franchiseFeesIdentifier,
    franchiseFeesAdRoyaltyIdentifier,
    projectId,
} from "../../constants/fixtures";

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
        const primaryMeasure = newMeasure(franchiseFeesIdentifier, m => m.format("#,##0"));

        const secondaryMeasure = newMeasure(franchiseFeesAdRoyaltyIdentifier, m => m.format("#,##0"));

        const filters = [newAbsoluteDateFilter(dateDataSetUri, "2017-01-01", "2017-12-31")];

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
