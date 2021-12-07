// (C) 2007-2020 GoodData Corporation
import React from "react";
import { IMeasureValueFilter, measureLocalId, modifyAttribute, modifyMeasure } from "@gooddata/sdk-model";
import { MeasureValueFilter } from "@gooddata/sdk-ui-filters";
import { PivotTable } from "@gooddata/sdk-ui-pivot";

import { Md } from "../../../md";

const FranchisedSales = modifyMeasure(Md.$FranchisedSales, (m) =>
    m.format("#,##0").title("Franchise Sales").localId("franchiseSales"),
);
const LocationName = modifyAttribute(Md.LocationName.Default, (a) => a.localId("LocationName"));

const measureTitle = "Franchised Sales";
const measures = [FranchisedSales];

const attributes = [LocationName];

const defaultFilter = {
    measureValueFilter: {
        measure: measures,
    },
};

export class MeasureValueFilterComponentExample extends React.PureComponent {
    public state = {
        filters: [],
    };

    public onApply = (filter: IMeasureValueFilter): void => {
        this.setState({ filters: [filter ?? defaultFilter] });
    };

    public render(): React.ReactNode {
        const { filters } = this.state;
        return (
            <React.Fragment>
                <MeasureValueFilter
                    onApply={this.onApply}
                    filter={filters[0]}
                    buttonTitle={measureTitle}
                    measureIdentifier={measureLocalId(FranchisedSales)}
                />
                <hr className="separator" />
                <div style={{ height: 300 }} className="s-pivot-table">
                    <PivotTable measures={measures} rows={attributes} filters={filters} />
                </div>
            </React.Fragment>
        );
    }
}

export default MeasureValueFilterComponentExample;
