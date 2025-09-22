// (C) 2025 GoodData Corporation

import { ReactNode } from "react";

import { DropdownInvertableSelect } from "@gooddata/sdk-ui-kit";

export interface IStaticFilterProps {
    dataTestId: string;
    options: string[];
    onChange: (selection: string[]) => void;
    header: ReactNode;
    noDataMessage: ReactNode;
    initialValue?: string[];
}

export function StaticFilter(props: IStaticFilterProps) {
    const { options, onChange, dataTestId, header, noDataMessage, initialValue = [] } = props;

    // Always use inverted mode for simplicity. Empty external value means "All".
    const initialIsInverted = true;
    const initialSelection =
        initialValue.length === 0 ? [] : options.filter((item) => !initialValue.includes(item));

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
                initialValue={initialSelection}
                initialIsInverted={initialIsInverted}
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
