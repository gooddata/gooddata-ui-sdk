// (C) 2025 GoodData Corporation

import React from "react";

import { DropdownInvertableSelect } from "@gooddata/sdk-ui-kit";

export interface IStaticFilterProps {
    dataTestId: string;
    options: string[];
    onChange: (selection: string[]) => void;
    header: React.ReactNode;
    noDataMessage: React.ReactNode;
}

export function StaticFilter({ options, onChange, dataTestId, header, noDataMessage }: IStaticFilterProps) {
    const handleChange = (selection: string[], isInverted: boolean) => {
        const optionsSet = new Set(options);
        const selectionSet = new Set(selection);
        const nextSelection = isInverted
            ? options.filter((item) => !selectionSet.has(item))
            : selection.filter((item) => optionsSet.has(item));
        if (options.length === nextSelection.length) {
            onChange([]);
        } else {
            onChange(nextSelection);
        }
    };

    // The search bar should not appear until there are at least 7 items in the list.
    const showSearchBar = options.length >= 7;

    return (
        <div data-testid={dataTestId}>
            <DropdownInvertableSelect
                options={options}
                alignPoints={[{ align: "bl tl" }, { align: "br tr" }]}
                getItemTitle={(item) => item}
                getItemKey={(item) => item}
                onChange={handleChange}
                header={<div className="gd-list-title gd-analytics-catalog__filter__header">{header}</div>}
                renderSearchBar={
                    showSearchBar
                        ? undefined
                        : () => <div className="gd-analytics-catalog__filter__search-bar" />
                }
                renderNoData={() => <div className="gd-list-noResults">{noDataMessage}</div>}
            />
        </div>
    );
}
