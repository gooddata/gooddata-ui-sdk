// (C) 2020 GoodData Corporation
import React, { useState } from "react";
import { LdmExt } from "../../ldm";
import { PivotTable } from "@gooddata/sdk-ui-pivot";
import { newRankingFilter, measureLocalId, localIdRef, attributeLocalId } from "@gooddata/sdk-model";
import {
    IMeasureDropdownItem,
    IAttributeDropdownItem,
    RankingFilterDropdown,
} from "@gooddata/sdk-ui-filters";
import classNames from "classnames";

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

interface IRankingFilterDropdownButton {
    isActive: boolean;
    onClick: () => any;
}

const DropdownButton = ({ isActive, onClick }: IRankingFilterDropdownButton) => {
    const className = classNames(
        "gd-button",
        "gd-button-secondary",
        "button-dropdown",
        "icon-right",
        "custom-button",
        { "icon-navigateup": isActive, "icon-navigatedown": !isActive },
    );

    return (
        <button className={className} onClick={onClick}>
            Custom ranking filter button
        </button>
    );
};

export const RankingFilterCustomButtonExample: React.FC = () => {
    const [filter, setFilter] = useState(newRankingFilter(LdmExt.franchiseSalesLocalId, "TOP", 3));
    const [isOpen, toggleDropdown] = useState(false);
    return (
        <React.Fragment>
            <DropdownButton onClick={() => toggleDropdown(!isOpen)} isActive={isOpen} />
            {isOpen && (
                <RankingFilterDropdown
                    measureItems={measureDropdownItems}
                    attributeItems={attributeDropdownItems}
                    filter={filter}
                    onApply={setFilter}
                    onCancel={() => toggleDropdown(false)}
                    anchorEl=".custom-button"
                />
            )}
            <hr className="separator" />
            <div style={{ height: 300 }} className="s-pivot-table">
                <PivotTable measures={measures} rows={attributes} filters={[filter]} />
            </div>
        </React.Fragment>
    );
};
