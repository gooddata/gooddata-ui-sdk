// (C) 2019-2025 GoodData Corporation
import React, { ReactElement, useState } from "react";

import isEqual from "lodash/isEqual.js";
import { defineMessages, useIntl } from "react-intl";

import { Button } from "../Button/Button.js";
import { Dropdown } from "../Dropdown/Dropdown.js";
import {
    IInvertableSelectRenderSearchBarProps,
    IInvertableSelectRenderStatusBarProps,
    InvertableSelect,
} from "../List/InvertableSelect/InvertableSelect.js";
import { useInvertableSelectionStatusText } from "../List/InvertableSelect/InvertableSelectSelectionStatus.js";
import { SeparatorLine } from "../SeparatorLine/SeparatorLine.js";

/**
 * @internal
 */
export interface IDropdownInvertableSelectProps<T> {
    /**
     * Text to show before the selection text.
     */
    title: string;

    /**
     * List of options to show in the select.
     */
    options: T[];

    /**
     * Function to get the title of an item.
     */
    getItemTitle: (item: T) => string;

    /**
     * Function to retrieve the unique key of an item.
     */
    getItemKey: (item: T) => string;

    /**
     * Callback function that is called when the selection changes.
     */
    onChange: (selectedItems: T[], isInverted: boolean) => void;

    /**
     * Width of the select.
     */
    width?: number;

    /**
     * Initial selected items.
     */
    initialValue?: T[];

    /**
     * Indicates whether the initial selection is inverted.
     */
    initialIsInverted?: boolean;

    /**
     * Initial search text.
     */
    initialSearchString?: string;

    /**
     * Render function for the status bar.
     */
    renderStatusBar?: (props: IInvertableSelectRenderStatusBarProps<T>) => ReactElement;

    /**
     * Render function for the search bar.
     */
    renderSearchBar?: (props: IInvertableSelectRenderSearchBarProps) => ReactElement;
}

const messages = defineMessages({
    apply: {
        id: "gs.list.apply",
    },
    cancel: {
        id: "gs.list.cancel",
    },
});

/**
 * @internal
 */
export function DropdownInvertableSelect<T>(props: IDropdownInvertableSelectProps<T>) {
    const {
        title,
        options,
        onChange,
        width = 240,
        getItemTitle,
        getItemKey,
        initialValue,
        initialIsInverted,
        initialSearchString,
        renderStatusBar,
        renderSearchBar,
    } = props;

    const [searchString, setSearchString] = useState<string>(initialSearchString ?? "");
    const [committedSelection, setCommitedSelection] = useState<T[]>(initialValue ?? []);
    const [committedIsInverted, setCommitedIsInverted] = useState<boolean>(initialIsInverted ?? true);
    const [selection, setSelection] = useState<T[]>(initialValue ?? []);
    const [isInverted, setIsInverted] = useState<boolean>(initialIsInverted ?? true);

    const selectionStatusText = useInvertableSelectionStatusText(
        committedSelection,
        committedIsInverted,
        getItemTitle,
    );

    const buttonText = `${title}: ${selectionStatusText}`;

    const onSearch = (searchString: string) => {
        setSearchString(searchString);
    };

    const onSelect = (selectedItems: T[], isInverted: boolean) => {
        setSelection(selectedItems);
        setIsInverted(isInverted);
    };

    const resetTemporarySelection = () => {
        setSelection(committedSelection);
        setIsInverted(committedIsInverted);
        setSearchString("");
    };

    const onApply = () => {
        setCommitedSelection(selection);
        setCommitedIsInverted(isInverted);
        onChange(selection, isInverted);
    };

    const filteredOptions = options.filter((option) => {
        return !searchString || getItemTitle(option).toLowerCase().includes(searchString.toLowerCase());
    });

    return (
        <Dropdown
            onOpenStateChanged={(isOpen) => {
                if (!isOpen) {
                    resetTemporarySelection();
                }
            }}
            renderButton={({ toggleDropdown }) => (
                <Button
                    title={buttonText}
                    value={buttonText}
                    onClick={toggleDropdown}
                    size="small"
                    variant="secondary"
                />
            )}
            renderBody={({ closeDropdown }) => {
                const isEmptySelection = !isInverted && selection.length === 0;
                const isSelectionEqual =
                    isEqual(selection, committedSelection) && isInverted === committedIsInverted;
                return (
                    <>
                        <InvertableSelect
                            width={width}
                            items={filteredOptions}
                            getItemTitle={getItemTitle}
                            getItemKey={getItemKey}
                            isInverted={isInverted}
                            searchString={searchString}
                            onSearch={onSearch}
                            selectedItems={selection}
                            onSelect={onSelect}
                            renderStatusBar={renderStatusBar}
                            renderSearchBar={renderSearchBar}
                            totalItemsCount={filteredOptions.length}
                        />
                        <DropdownInvertableSelectActions
                            onApply={() => {
                                onApply();
                                closeDropdown();
                            }}
                            onCancel={() => {
                                closeDropdown();
                            }}
                            isApplyDisabled={isEmptySelection || isSelectionEqual}
                        />
                    </>
                );
            }}
        ></Dropdown>
    );
}

export interface IDropdownInvertableSelectActionsProps {
    onApply: () => void;
    onCancel: () => void;
    isApplyDisabled?: boolean;
}

function DropdownInvertableSelectActions(props: IDropdownInvertableSelectActionsProps) {
    const { onApply, isApplyDisabled, onCancel } = props;
    const intl = useIntl();
    const cancelText = intl.formatMessage(messages.cancel);
    const applyText = intl.formatMessage(messages.apply);

    return (
        <>
            <div className="gd-invertable-select-actions">
                <SeparatorLine />
                <div className="gd-invertable-select-actions-buttons">
                    <Button
                        variant="secondary"
                        size="small"
                        className="cancel-button s-cancel"
                        onClick={onCancel}
                        value={cancelText}
                        title={cancelText}
                    />
                    <Button
                        disabled={isApplyDisabled}
                        intent="action"
                        size="small"
                        className="s-apply"
                        onClick={onApply}
                        value={applyText}
                        title={applyText}
                    />
                </div>
            </div>
        </>
    );
}
