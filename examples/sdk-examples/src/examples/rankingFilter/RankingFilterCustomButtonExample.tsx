// (C) 2020-2022 GoodData Corporation
import React, { useState } from "react";
import { PivotTable } from "@gooddata/sdk-ui-pivot";
import {
    newRankingFilter,
    measureLocalId,
    localIdRef,
    attributeLocalId,
    IFilter,
    IRankingFilter,
    modifyMeasure,
} from "@gooddata/sdk-model";
import {
    IMeasureDropdownItem,
    IAttributeDropdownItem,
    RankingFilterDropdown,
} from "@gooddata/sdk-ui-filters";
import classNames from "classnames";
import * as Md from "../../md/full";

const TotalSales = modifyMeasure(Md.$TotalSales, (m) =>
    m.format("#,##0").alias("$ Total Sales").title("Total Sales"),
);
const FranchisedSales = modifyMeasure(Md.$FranchisedSales, (m) => m.format("#,##0").title("Franchise Sales"));

const measures = [TotalSales, FranchisedSales];
const attributes = [Md.LocationState, Md.LocationName.Default];

const measureDropdownItems: IMeasureDropdownItem[] = [
    {
        title: "$ Total sales",
        ref: localIdRef(measureLocalId(TotalSales)),
        sequenceNumber: "M1",
    },
    {
        title: "Franchised sales",
        ref: localIdRef(measureLocalId(FranchisedSales)),
        sequenceNumber: "M2",
    },
];

const attributeDropdownItems: IAttributeDropdownItem[] = [
    {
        title: "Location state",
        ref: localIdRef(attributeLocalId(Md.LocationState)),
        type: "ATTRIBUTE",
    },
    {
        title: "Location",
        ref: localIdRef(attributeLocalId(Md.LocationName.Default)),
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
                onClick={() => setFilters([newRankingFilter(measureLocalId(FranchisedSales), "TOP", 3)])}
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
