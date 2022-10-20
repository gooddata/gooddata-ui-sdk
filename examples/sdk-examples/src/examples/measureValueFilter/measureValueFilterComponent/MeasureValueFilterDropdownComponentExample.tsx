// (C) 2007-2022 GoodData Corporation
import React, { useState } from "react";
import classNames from "classnames";
import { PivotTable } from "@gooddata/sdk-ui-pivot";
import { MeasureValueFilterDropdown } from "@gooddata/sdk-ui-filters";
import { IMeasureValueFilter, measureLocalId, localIdRef, modifyMeasure } from "@gooddata/sdk-model";
import * as Md from "../../../md/full";

const FranchisedSales = modifyMeasure(Md.$FranchisedSales, (m) => m.format("#,##0").title("Franchise Sales"));

const measures = [FranchisedSales];

const attributes = [Md.LocationName.Default];

const defaultFilter: IMeasureValueFilter = {
    measureValueFilter: {
        measure: localIdRef(measureLocalId(measures[0])),
    },
};

interface IMeasureValueFilterDropdownButton {
    isActive: boolean;
    measureTitle: string;
    onClick: () => any;
}

const DropdownButton = ({ isActive, measureTitle, onClick }: IMeasureValueFilterDropdownButton) => {
    const className = classNames(
        "gd-mvf-dropdown-button",
        "s-mvf-dropdown-button",
        "gd-button",
        "gd-button-secondary",
        "button-dropdown",
        "gd-icon-right",
        { "gd-icon-navigateup": isActive, "gd-icon-navigatedown": !isActive },
    );

    return (
        <button className={className} onClick={onClick}>
            {measureTitle}
        </button>
    );
};

export const MeasureValueFilterComponentExample: React.FC = () => {
    const [displayDropdown, setDisplayDropdown] = useState<boolean>(false);
    const [filters, setFilters] = useState<IMeasureValueFilter[]>([]);

    const ref = React.createRef<HTMLDivElement>();

    const onApply = (filter: IMeasureValueFilter): void => {
        setFilters([filter ?? defaultFilter]);
        setDisplayDropdown(false);
    };

    const onCancel = (): void => {
        setDisplayDropdown(false);
    };

    const toggleDropdown = (): void => {
        setDisplayDropdown((current) => !current);
    };

    return (
        <React.Fragment>
            <div ref={ref}>
                <DropdownButton
                    onClick={toggleDropdown}
                    isActive={displayDropdown}
                    measureTitle="Custom button"
                />
            </div>
            {displayDropdown ? (
                <MeasureValueFilterDropdown
                    onApply={onApply}
                    onCancel={onCancel}
                    filter={filters[0]}
                    anchorEl={ref.current!}
                    measureIdentifier={measureLocalId(FranchisedSales)}
                />
            ) : null}
            <hr className="separator" />
            <div style={{ height: 300 }} className="s-pivot-table">
                <PivotTable measures={measures} rows={attributes} filters={filters} />
            </div>
        </React.Fragment>
    );
};

export default MeasureValueFilterComponentExample;
