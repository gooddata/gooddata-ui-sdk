// (C) 2007-2019 GoodData Corporation
import React from "react";
import { ComboChart } from "@gooddata/sdk-ui-charts";
import { newAttribute, newMeasure } from "@gooddata/sdk-model";

import {
    projectId,
    franchiseFeesAdRoyaltyIdentifier,
    franchiseFeesInitialFranchiseFeeIdentifier,
    locationResortIdentifier,
} from "../../constants/fixtures";
import { useBackend } from "../../context/auth";

const columnMeasures = [newMeasure(franchiseFeesInitialFranchiseFeeIdentifier, m => m.format("#,##0"))];

const lineMeasures = [newMeasure(franchiseFeesAdRoyaltyIdentifier, m => m.format("#,##0"))];

const locationResort = newAttribute(locationResortIdentifier);

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
