// (C) 2020 GoodData Corporation
import React, { useState } from "react";
import { MdExt } from "../../md";
import { PivotTable } from "@gooddata/sdk-ui-pivot";
import {
    newRankingFilter,
    localIdRef,
    measureLocalId,
    attributeLocalId,
    IFilter,
    IRankingFilter,
} from "@gooddata/sdk-model";
import { RankingFilter, IMeasureDropdownItem, IAttributeDropdownItem } from "@gooddata/sdk-ui-filters";

const measures = [MdExt.TotalSales2, MdExt.FranchisedSales];
const attributes = [MdExt.LocationState, MdExt.LocationName];

export const measureDropdownItems: IMeasureDropdownItem[] = [
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

export const attributeDropdownItems: IAttributeDropdownItem[] = [
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

export const RankingFilterExample: React.FC = () => {
    const [filters, setFilters] = useState<IFilter[]>([]);
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
                <RankingFilter
                    measureItems={measureDropdownItems}
                    attributeItems={attributeDropdownItems}
                    filter={filters[0] as IRankingFilter}
                    onApply={(filter) => setFilters([filter])}
                    buttonTitle={"Ranking filter configuration"}
                />
            )}
            <hr className="separator" />
            <div style={{ height: 300 }} className="s-pivot-table">
                <PivotTable measures={measures} rows={attributes} filters={filters} />
            </div>
        </React.Fragment>
    );
};
