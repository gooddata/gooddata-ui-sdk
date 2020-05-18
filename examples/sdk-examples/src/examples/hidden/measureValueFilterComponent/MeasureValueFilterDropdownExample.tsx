// (C) 2007-2019 GoodData Corporation
import React, { useState } from "react";
import { MeasureValueFilterDropdown } from "@gooddata/sdk-ui-filters";
import { PivotTable } from "@gooddata/sdk-ui-pivot";
import { measureIdentifier, IMeasureValueFilter } from "@gooddata/sdk-model";

import { Ldm, LdmExt } from "../../../ldm";

const measures = [LdmExt.FranchiseFees, LdmExt.FranchisedSales];
const attributes = [Ldm.LocationName.Default];
const style = { height: 300 };

export const MeasureValueFilterDropdownExample: React.FC = () => {
    const [filter, setFilter] = useState<IMeasureValueFilter | undefined>();

    const onApply = (filter: IMeasureValueFilter) => {
        setFilter(filter);
    };

    return (
        <div>
            <MeasureValueFilterDropdown
                onApply={onApply}
                // measureTitle={franchiseSalesMeasure.measure.title}
                measureIdentifier={measureIdentifier(LdmExt.FranchiseFees)}
                filter={filter || undefined}
            />
            <hr className="separator" />
            <div style={style} className="s-pivot-table">
                <PivotTable measures={measures} rows={attributes} filters={filter ? [filter!] : []} />
            </div>
        </div>
    );
};
