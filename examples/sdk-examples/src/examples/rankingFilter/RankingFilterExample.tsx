// (C) 2020-2022 GoodData Corporation
import React, { useState } from "react";
import { PivotTable } from "@gooddata/sdk-ui-pivot";
import {
    newRankingFilter,
    localIdRef,
    measureLocalId,
    attributeLocalId,
    IFilter,
    IRankingFilter,
    modifyMeasure,
} from "@gooddata/sdk-model";
import { RankingFilter, IMeasureDropdownItem, IAttributeDropdownItem } from "@gooddata/sdk-ui-filters";
import * as Md from "../../md/full";

const TotalSales = modifyMeasure(Md.$TotalSales, (m) =>
    m.format("#,##0").alias("$ Total Sales").title("Total Sales"),
);
const FranchisedSales = modifyMeasure(Md.$FranchisedSales, (m) => m.format("#,##0").title("Franchise Sales"));

const measures = [TotalSales, FranchisedSales];
const attributes = [Md.LocationState, Md.LocationName.Default];

export const measureDropdownItems: IMeasureDropdownItem[] = [
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

export const attributeDropdownItems: IAttributeDropdownItem[] = [
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
                onClick={() => setFilters([newRankingFilter(measureLocalId(FranchisedSales), "TOP", 3)])}
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
