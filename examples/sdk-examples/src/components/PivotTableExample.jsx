// (C) 2007-2019 GoodData Corporation
import React, { Component } from "react";
import { PivotTable, Model } from "@gooddata/sdk-ui";
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
                  Model.measure(franchiseFeesIdentifier)
                      .format("#,##0")
                      .localIdentifier("franchiseFees"),
                  Model.measure(franchiseFeesAdRoyaltyIdentifier)
                      .format("#,##0")
                      .localIdentifier("franchiseFeesAdRoyalty"),
                  Model.measure(franchiseFeesInitialFranchiseFeeIdentifier)
                      .format("#,##0")
                      .localIdentifier("franchiseFeesInitialFranchiseFee"),
                  Model.measure(franchiseFeesIdentifierOngoingRoyalty)
                      .format("#,##0")
                      .localIdentifier("franchiseFeesOngoingRoyalty"),
              ]
            : [];

        const attributes = withAttributes
            ? [
                  Model.attribute(locationStateDisplayFormIdentifier).localIdentifier("locationState"),
                  Model.attribute(locationNameDisplayFormIdentifier).localIdentifier("locationName"),
                  Model.attribute(menuCategoryAttributeDFIdentifier).localIdentifier("menuCategory"),
              ]
            : [];

        const columns = withPivot
            ? [
                  Model.attribute(quarterDateIdentifier).localIdentifier("quarter"),
                  Model.attribute(monthDateIdentifier).localIdentifier("month"),
              ]
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
