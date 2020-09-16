// (C) 2020 GoodData Corporation
import React, { useState } from "react";
import { LdmExt } from "../../ldm";
import { PivotTable } from "@gooddata/sdk-ui-pivot";
import { newRankingFilter, localIdRef, measureLocalId, attributeLocalId } from "@gooddata/sdk-model";
import { RankingFilter, IMeasureDropdownItem, IAttributeDropdownItem } from "@gooddata/sdk-ui-filters";

const measures = [LdmExt.FranchiseFees, LdmExt.FranchisedSales];
const attributes = [LdmExt.LocationState, LdmExt.LocationName];

const measureDropdownItems: IMeasureDropdownItem[] = [
    {
        title: "Franchise fees",
        ref: localIdRef(measureLocalId(LdmExt.FranchiseFees)),
        sequenceNumber: "M1",
    },
    {
        title: "Franchised sales",
        ref: localIdRef(measureLocalId(LdmExt.FranchisedSales)),
        sequenceNumber: "M2",
    },
];

const attributeDropdownItems: IAttributeDropdownItem[] = [
    {
        title: "Location state",
        ref: localIdRef(attributeLocalId(LdmExt.LocationState)),
        type: "ATTRIBUTE",
    },
    {
        title: "Location",
        ref: localIdRef(attributeLocalId(LdmExt.LocationName)),
        type: "ATTRIBUTE",
    },
];

export const RankingFilterExample: React.FC = () => {
    const [filter, setFilter] = useState(newRankingFilter(LdmExt.franchiseSalesLocalId, "TOP", 3));
    return (
        <React.Fragment>
            <RankingFilter
                measureItems={measureDropdownItems}
                attributeItems={attributeDropdownItems}
                filter={filter}
                onApply={(filter) => setFilter(filter)}
                buttonTitle={"Ranking filter"}
            />
            <hr className="separator" />
            <div style={{ height: 300 }} className="s-pivot-table">
                <PivotTable measures={measures} rows={attributes} filters={[filter]} />
            </div>
        </React.Fragment>
    );
};
