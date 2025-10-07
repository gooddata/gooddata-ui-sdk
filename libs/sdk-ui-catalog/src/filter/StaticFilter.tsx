// (C) 2025 GoodData Corporation

import { type PropsWithChildren, type ReactNode } from "react";

import { DropdownInvertableSelect, SeparatorLine } from "@gooddata/sdk-ui-kit";

export interface IStaticFilterProps<T> {
    dataTestId: string;
    options: T[];
    onChange: (selection: T[]) => void;
    getItemKey: (item: T) => string;
    getItemTitle: (item: T) => string;
    header: ReactNode;
    noDataMessage: ReactNode;
    statusBar?: ReactNode;
    actions?: ReactNode;
    initialValue?: T[];
}

export function StaticFilter<T>({
    options,
    onChange,
    getItemKey,
    getItemTitle,
    dataTestId,
    header,
    noDataMessage,
    statusBar,
    actions,
    initialValue = [],
}: IStaticFilterProps<T>) {
    // Always use inverted mode for simplicity. Empty external value means "All".
    const initialIsInverted = true;
    const initialSelection =
        initialValue.length === 0 ? [] : options.filter((item) => !initialValue.includes(item));

    const handleChange = (selection: T[], isInverted: boolean) => {
        const optionsSet = new Set(options.map(getItemKey));
        const selectionSet = new Set(selection.map(getItemKey));

        const nextSelection = isInverted
            ? options.filter((item) => !selectionSet.has(getItemKey(item)))
            : selection.filter((item) => optionsSet.has(getItemKey(item)));

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
                getItemTitle={getItemTitle}
                getItemKey={getItemKey}
                onChange={handleChange}
                header={<div className="gd-list-title gd-analytics-catalog__filter__header">{header}</div>}
                renderSearchBar={
                    showSearchBar
                        ? undefined
                        : () => <div className="gd-analytics-catalog__filter__search-bar" />
                }
                renderNoData={() => <div className="gd-list-noResults">{noDataMessage}</div>}
                renderActions={actions ? () => <Actions>{actions}</Actions> : undefined}
                renderStatusBar={statusBar ? () => <>{statusBar}</> : undefined}
            />
        </div>
    );
}

function Actions({ children }: PropsWithChildren) {
    return (
        <div className="gd-invertable-select-actions">
            <SeparatorLine />
            <div className="gd-invertable-select-actions-buttons">{children}</div>
        </div>
    );
}
