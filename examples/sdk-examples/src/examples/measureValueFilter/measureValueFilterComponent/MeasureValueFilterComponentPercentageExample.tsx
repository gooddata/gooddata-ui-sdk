// (C) 2007-2020 GoodData Corporation
import React from "react";

import { MeasureValueFilter } from "@gooddata/sdk-ui-filters";
import { IMeasureValueFilter, measureLocalId } from "@gooddata/sdk-model";
import { PivotTable } from "@gooddata/sdk-ui-pivot";
import { LdmExt } from "../../../ldm";

const measureTitle = "Franchised Sales Ratio";

const measures = [LdmExt.FranchisedSalesAsPercent];

const attributes = [LdmExt.LocationName];

const defaultFilter = {
    measureValueFilter: {
        measure: measures,
    },
};

export class MeasureValueFilterComponentPercentageExample extends React.PureComponent {
    public state = {
        filters: [],
    };

    public onApply = (filter: IMeasureValueFilter) => {
        this.setState({ filters: [filter ?? defaultFilter] });
    };

    public render() {
        const { filters } = this.state;

        return (
            <React.Fragment>
                <MeasureValueFilter
                    onApply={this.onApply}
                    filter={filters[0]}
                    buttonTitle={measureTitle}
                    usePercentage
                    measureIdentifier={measureLocalId(LdmExt.FranchisedSalesAsPercent)}
                />
                <hr className="separator" />
                <div style={{ height: 300 }} className="s-pivot-table">
                    <PivotTable measures={measures} rows={attributes} filters={filters} />
                </div>
            </React.Fragment>
        );
    }
}

export default MeasureValueFilterComponentPercentageExample;
