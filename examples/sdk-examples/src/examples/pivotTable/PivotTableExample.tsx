// (C) 2007-2019 GoodData Corporation
import React, { Component } from "react";
import { PivotTable } from "@gooddata/sdk-ui";
import { newMeasure, newAttribute } from "@gooddata/sdk-model";

import {
    projectId,
    quarterDateIdentifier,
    monthDateIdentifier,
    locationStateDisplayFormIdentifier,
    locationNameDisplayFormIdentifier,
    franchiseFeesIdentifier,
    franchiseFeesAdRoyaltyIdentifier,
    franchiseFeesInitialFranchiseFeeIdentifier,
    franchiseFeesIdentifierOngoingRoyalty,
    menuCategoryAttributeDFIdentifier,
} from "../../constants/fixtures";
import { useBackend } from "../../context/auth";

interface IPivotTableExampleProps {
    className?: string;
    withMeasures?: boolean;
    withAttributes?: boolean;
    withPivot?: boolean;
    hasError?: boolean;
}

const style = { height: 300 };

export const PivotTableExample: React.FC<IPivotTableExampleProps> = ({
    withMeasures,
    withAttributes,
    withPivot,
    hasError,
    className,
}) => {
    const backend = useBackend();

    const measures = withMeasures
        ? [
              newMeasure(franchiseFeesIdentifier, m => m.format("#,##0")),
              newMeasure(franchiseFeesAdRoyaltyIdentifier, m => m.format("#,##0")),
              newMeasure(franchiseFeesInitialFranchiseFeeIdentifier, m => m.format("#,##0")),
              newMeasure(franchiseFeesIdentifierOngoingRoyalty, m => m.format("#,##0")),
          ]
        : [];

    const attributes = withAttributes
        ? [
              newAttribute(locationStateDisplayFormIdentifier),
              newAttribute(locationNameDisplayFormIdentifier),
              newAttribute(menuCategoryAttributeDFIdentifier),
          ]
        : [];

    const columns = withPivot ? [newAttribute(quarterDateIdentifier), newAttribute(monthDateIdentifier)] : [];

    return (
        <div style={style} className={className}>
            <PivotTable
                backend={backend}
                workspace={hasError ? "incorrectProjectId" : projectId}
                measures={measures}
                rows={attributes}
                columns={columns}
                pageSize={20}
            />
        </div>
    );
};
