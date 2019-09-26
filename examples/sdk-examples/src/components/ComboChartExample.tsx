// (C) 2007-2019 GoodData Corporation
import React from "react";
import { ComboChart, Model } from "@gooddata/sdk-ui";

import "@gooddata/sdk-ui/styles/css/main.css";

import {
    projectId,
    franchiseFeesAdRoyaltyIdentifier,
    franchiseFeesInitialFranchiseFeeIdentifier,
    locationResortIdentifier,
} from "../utils/fixtures";
import { useBackend } from "../backend";

const columnMeasures = [
    Model.measure(franchiseFeesInitialFranchiseFeeIdentifier)
        .format("#,##0")
        .localIdentifier("franchiseFeesInitialFranchiseFeeIdentifier"),
];

const lineMeasures = [
    Model.measure(franchiseFeesAdRoyaltyIdentifier)
        .format("#,##0")
        .localIdentifier("franchiseFeesAdRoyaltyIdentifier"),
];

const locationResort = Model.attribute(locationResortIdentifier).localIdentifier("location_resort");

const style = { height: 300 };

export const ComboChartExample: React.FC = () => {
    const backend = useBackend();

    return (
        <div style={style} className="s-combo-chart">
            <ComboChart
                backend={backend}
                workspace={projectId}
                primaryMeasures={columnMeasures}
                secondaryMeasures={lineMeasures}
                viewBy={locationResort}
            />
        </div>
    );
};
