// (C) 2025 GoodData Corporation

import { type PropsWithChildren, type ReactNode, useCallback, useMemo, useState } from "react";

import { isEqual } from "lodash-es";
import { defineMessages, useIntl } from "react-intl";

import { Dropdown, type IAlignPoint, InvertableSelect, SeparatorLine, UiButton } from "@gooddata/sdk-ui-kit";

const messages = defineMessages({
    apply: {
        id: "gs.list.apply",
    },
    cancel: {
        id: "gs.list.cancel",
    },
});

const alignPoints: IAlignPoint[] = [{ align: "bl tl" }, { align: "br tr" }];

export interface IStaticFilterProps<T> {
    dataTestId: string;
    label: string;
    options: T[];
    selection: T[];
    isSelectionInverted: boolean;
    onSelectionChange: (selection: T[], isInverted: boolean) => void;
    getItemKey?: (item: T) => string;
    getItemTitle?: (item: T) => string;
    noDataMessage?: ReactNode;
    statusBar?: ReactNode;
    actions?: ReactNode;
}

export function StaticFilter<T>(props: IStaticFilterProps<T>) {
    const {
        dataTestId,
        label,
        options,
        selection,
        isSelectionInverted,
        onSelectionChange,
        getItemTitle = identity,
        getItemKey = identity,
        noDataMessage,
        statusBar,
        actions,
    } = props;
    const intl = useIntl();

    const [searchString, setSearchString] = useState("");
    const [prevSelection, setPrevSelection] = useState(selection);
    const [localSelection, setLocalSelection] = useState(selection);
    const [localIsInverted, setLocalIsInverted] = useState(isSelectionInverted);

    function resetLocalState() {
        setPrevSelection(selection);
        setLocalSelection(selection);
        setLocalIsInverted(isSelectionInverted);
        setSearchString("");
    }

    const handleSelectionChange = useCallback((selection: T[], isInverted: boolean) => {
        setLocalSelection(selection);
        setLocalIsInverted(isInverted);
    }, []);

    function handleApply() {
        onSelectionChange(localSelection, localIsInverted);
    }

    // Reset local state when the parent selection changes
    // https://react.dev/learn/you-might-not-need-an-effect#adjusting-some-state-when-a-prop-changes
    if (!isEqual(prevSelection, selection)) {
        resetLocalState();
    }

    // The search bar should not appear until there are at least 7 items in the list.
    const isSearchBarVisible = options.length >= 7;
    const isSelectionEqual = isEqual(localSelection, selection) && localIsInverted === isSelectionInverted;
    const isSelectionEmpty = localIsInverted
        ? localSelection.length === options.length
        : localSelection.length === 0;

    const filteredOptions = useMemo(() => {
        return options.filter(
            (item) => !searchString || getItemTitle(item).toLowerCase().includes(searchString.toLowerCase()),
        );
    }, [options, searchString, getItemTitle]);

    return (
        <div data-testid={dataTestId}>
            <Dropdown
                alignPoints={alignPoints}
                onOpenStateChanged={(isOpen) => !isOpen && resetLocalState()}
                renderButton={({ toggleDropdown }) => (
                    <UiButton
                        label={label}
                        onClick={toggleDropdown}
                        size="small"
                        variant="secondary"
                        iconAfter="navigateDown"
                        badgeAfter={localSelection.length > 0 ? localSelection.length : undefined}
                    />
                )}
                renderBody={({ closeDropdown }) => {
                    return (
                        <>
                            <Header>{label}</Header>
                            <InvertableSelect
                                className="gd-analytics-catalog__filter__select-list"
                                width={240}
                                items={filteredOptions}
                                selectedItems={localSelection}
                                isInverted={localIsInverted}
                                getItemTitle={getItemTitle}
                                getItemKey={getItemKey}
                                searchString={searchString}
                                onSearch={setSearchString}
                                onSelect={handleSelectionChange}
                                renderSearchBar={
                                    isSearchBarVisible
                                        ? undefined
                                        : () => <div className="gd-analytics-catalog__filter__search-bar" />
                                }
                                renderNoData={() => <div className="gd-list-noResults">{noDataMessage}</div>}
                                renderStatusBar={statusBar ? () => <>{statusBar}</> : undefined}
                                totalItemsCount={options.length}
                            />
                            <Actions>
                                {actions ?? (
                                    <>
                                        <UiButton
                                            variant="secondary"
                                            size="small"
                                            onClick={closeDropdown}
                                            label={intl.formatMessage(messages.cancel)}
                                        />
                                        <UiButton
                                            variant="primary"
                                            size="small"
                                            onClick={() => {
                                                handleApply();
                                                closeDropdown();
                                            }}
                                            label={intl.formatMessage(messages.apply)}
                                            isDisabled={isSelectionEmpty || isSelectionEqual}
                                        />
                                    </>
                                )}
                            </Actions>
                        </>
                    );
                }}
            />
        </div>
    );
}

function Header({ children }: PropsWithChildren) {
    return <header className="gd-list-title gd-analytics-catalog__filter__header">{children}</header>;
}

function Actions({ children }: PropsWithChildren) {
    return (
        <div className="gd-invertable-select-actions">
            <SeparatorLine />
            <div className="gd-invertable-select-actions-buttons">{children}</div>
        </div>
    );
}

function identity<T>(item: T): string {
    return String(item);
}
