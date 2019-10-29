// (C) 2007-2019 GoodData Corporation
import React from "react";
import { Headline } from "@gooddata/sdk-ui";
import { newMeasure, newAbsoluteDateFilter } from "@gooddata/sdk-model";

import { ExampleWithExport } from "./ExampleWithExport";
import {
    dateDatasetIdentifier,
    franchiseFeesIdentifier,
    franchiseFeesAdRoyaltyIdentifier,
    projectId,
} from "../../constants/fixtures";
import { useBackend } from "../../context/auth";

const primaryMeasure = newMeasure(franchiseFeesIdentifier, m => m.format("#,##0"));

const secondaryMeasure = newMeasure(franchiseFeesAdRoyaltyIdentifier, m => m.format("#,##0"));

const filters = [newAbsoluteDateFilter(dateDatasetIdentifier, "2017-01-01", "2017-12-31")];

const style = { display: "flex" };

export const HeadlineExportExample: React.FC = () => {
    const backend = useBackend();

    return (
        <ExampleWithExport filters={filters}>
            {onExportReady => (
                <div className="s-headline" style={style}>
                    <Headline
                        backend={backend}
                        workspace={projectId}
                        primaryMeasure={primaryMeasure}
                        secondaryMeasure={secondaryMeasure}
                        filters={filters}
                        onExportReady={onExportReady}
                    />
                </div>
            )}
        </ExampleWithExport>
    );
};

export default HeadlineExportExample;
