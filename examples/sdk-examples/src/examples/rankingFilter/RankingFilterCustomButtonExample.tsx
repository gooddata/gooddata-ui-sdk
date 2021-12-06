// (C) 2020 GoodData Corporation
import React, { useState } from "react";
import { MdExt } from "../../md";
import { PivotTable } from "@gooddata/sdk-ui-pivot";
import {
    newRankingFilter,
    measureLocalId,
    localIdRef,
    attributeLocalId,
    IFilter,
    IRankingFilter,
} from "@gooddata/sdk-model";
import {
    IMeasureDropdownItem,
    IAttributeDropdownItem,
    RankingFilterDropdown,
} from "@gooddata/sdk-ui-filters";
import classNames from "classnames";

const measures = [MdExt.TotalSales2, MdExt.FranchisedSales];
const attributes = [MdExt.LocationState, MdExt.LocationName];

const measureDropdownItems: IMeasureDropdownItem[] = [
    {
        title: "$ Total sales",
        ref: localIdRef(measureLocalId(MdExt.TotalSales2)),
        sequenceNumber: "M1",
    },
    {
        title: "Franchised sales",
        ref: localIdRef(measureLocalId(MdExt.FranchisedSales)),
        sequenceNumber: "M2",
    },
];

const attributeDropdownItems: IAttributeDropdownItem[] = [
    {
        title: "Location state",
        ref: localIdRef(attributeLocalId(MdExt.LocationState)),
        type: "ATTRIBUTE",
    },
    {
        title: "Location",
        ref: localIdRef(attributeLocalId(MdExt.LocationName)),
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
        "gd-button-small",
        "gd-button-positive",
        "button-dropdown",
        "gd-icon-right",
        "custom-button",
        { "gd-icon-navigateup": isActive, "gd-icon-navigatedown": !isActive },
    );

    return (
        <button className={className} onClick={onClick}>
            Custom ranking filter button
        </button>
    );
};

const PresetButtonComponent: React.FC<{ title: string; isActive: boolean; onClick: () => void }> = ({
    title,
    isActive,
    onClick,
}) => (
    <button
        className={`gd-button gd-button-secondary gd-button-small ${
            isActive ? "is-active" : ""
        } s-filter-button`}
        onClick={onClick}
    >
        {title}
    </button>
);

export const RankingFilterCustomButtonExample: React.FC = () => {
    const [filters, setFilters] = useState<IFilter[]>([]);
    const [isOpen, toggleDropdown] = useState(false);

    const handleApply = (filter: IFilter) => {
        setFilters([filter]);
        toggleDropdown(false);
    };
    return (
        <React.Fragment>
            <PresetButtonComponent
                title="No filter"
                isActive={filters.length === 0}
                onClick={() => setFilters([])}
            />
            <PresetButtonComponent
                title="Apply ranking filter"
                isActive={filters.length > 0}
                onClick={() => setFilters([newRankingFilter(MdExt.franchiseSalesLocalId, "TOP", 3)])}
            />
            {filters.length > 0 && (
                <React.Fragment>
                    <DropdownButton onClick={() => toggleDropdown(!isOpen)} isActive={isOpen} />
                    {isOpen && (
                        <RankingFilterDropdown
                            measureItems={measureDropdownItems}
                            attributeItems={attributeDropdownItems}
                            filter={filters[0] as IRankingFilter}
                            onApply={handleApply}
                            onCancel={() => toggleDropdown(false)}
                            anchorEl=".custom-button"
                        />
                    )}
                </React.Fragment>
            )}
            <hr className="separator" />
            <div style={{ height: 300 }} className="s-pivot-table">
                <PivotTable measures={measures} rows={attributes} filters={filters} />
            </div>
        </React.Fragment>
    );
};
