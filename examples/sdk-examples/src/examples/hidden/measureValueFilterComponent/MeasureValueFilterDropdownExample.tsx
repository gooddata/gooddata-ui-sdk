// (C) 2007-2019 GoodData Corporation
import React, { useState } from "react";
import { MeasureValueFilterDropdown } from "@gooddata/sdk-ui-filters";
import { newMeasure, newAttribute } from "@gooddata/sdk-model";
import { PivotTable } from "@gooddata/sdk-ui-pivot";

import {
    franchiseFeesIdentifier,
    franchisedSalesIdentifier,
    locationNameDisplayFormIdentifier,
} from "../../../constants/fixtures";

const franchiseFeesMeasure = newMeasure(franchiseFeesIdentifier, m =>
    m.format("#,##0").title("Franchise Fees"),
);

const franchiseSalesMeasure = newMeasure(franchisedSalesIdentifier, m =>
    m.format("#,##0").title("Franchise Sales"),
);

const measures = [franchiseFeesMeasure, franchiseSalesMeasure];

const attributes = [newAttribute(locationNameDisplayFormIdentifier)];

const style = { height: 300 };

export const MeasureValueFilterDropdownExample: React.FC = () => {
    const [state, setState] = useState({ filter: null });

    const onApply = filter => {
        setState({ filter });
    };

    const { filter } = state;

    return (
        <div>
            <MeasureValueFilterDropdown
                onApply={onApply}
                // measureTitle={franchiseSalesMeasure.measure.title}
                measureIdentifier={franchiseSalesMeasure.measure.localIdentifier}
                filter={filter || null}
            />
            <hr className="separator" />
            <div style={style} className="s-pivot-table">
                <PivotTable measures={measures} rows={attributes} filters={filter ? [filter] : []} />
            </div>
        </div>
    );
};
