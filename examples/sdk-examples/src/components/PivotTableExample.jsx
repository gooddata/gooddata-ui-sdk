// (C) 2007-2019 GoodData Corporation
import React, { Component } from "react";
import { PivotTable } from "@gooddata/sdk-ui";
import { newMeasure, newAttribute } from "@gooddata/sdk-model";
import PropTypes from "prop-types";

import "@gooddata/sdk-ui/styles/css/main.css";

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
} from "../utils/fixtures";

export class PivotTableExample extends Component {
    static propTypes = {
        className: PropTypes.string,
        withMeasures: PropTypes.bool,
        withAttributes: PropTypes.bool,
        withPivot: PropTypes.bool,
        hasError: PropTypes.bool,
    };

    static defaultProps = {
        className: undefined,
        withMeasures: false,
        withAttributes: false,
        withPivot: false,
        hasError: false,
    };

    render() {
        const { withMeasures, withAttributes, withPivot, hasError, className } = this.props;
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

        const columns = withPivot
            ? [newAttribute(quarterDateIdentifier), newAttribute(monthDateIdentifier)]
            : [];

        return (
            <div style={{ height: 300 }} className={className}>
                <PivotTable
                    projectId={hasError ? "incorrectProjectId" : projectId}
                    measures={measures}
                    rows={attributes}
                    columns={columns}
                    pageSize={20}
                />
            </div>
        );
    }
}

export default PivotTableExample;
