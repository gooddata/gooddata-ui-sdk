// (C) 2019-2025 GoodData Corporation

import { ReactElement, ReactNode, useMemo, useState } from "react";

import { isEqual } from "lodash-es";
import { defineMessages, useIntl } from "react-intl";

import { UiButton } from "../@ui/UiButton/UiButton.js";
import {
    Dropdown,
    type IDropdownBodyRenderProps,
    type IDropdownButtonRenderProps,
} from "../Dropdown/Dropdown.js";
import {
    type IInvertableSelectRenderNoDataProps,
    type IInvertableSelectRenderSearchBarProps,
    type IInvertableSelectRenderStatusBarProps,
    InvertableSelect,
} from "../List/InvertableSelect/InvertableSelect.js";
import { useInvertableSelectionStatusText } from "../List/InvertableSelect/InvertableSelectSelectionStatus.js";
import { SeparatorLine } from "../SeparatorLine/SeparatorLine.js";
import { OverlayPositionType } from "../typings/overlay.js";
import type { IAlignPoint } from "../typings/positioning.js";

/**
 * @internal
 */
export interface IDropdownInvertableSelectProps<T> {
    /**
     * Text to show before the selection text.
     */
    title?: string;

    /**
     * List of options to show in the select.
     */
    options: T[];

    /**
     * Class name to apply to the dropdown.
     */
    className?: string;

    /**
     * Class name to apply to the dropdown body.
     */
    bodyClassName?: string;

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
     * Alignment points for the dropdown.
     */
    alignPoints?: IAlignPoint[];

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
     * Header to show above the select.
     */
    header?: ReactNode;

    /**
     * Render function for the status bar.
     */
    renderStatusBar?: (props: IInvertableSelectRenderStatusBarProps<T>) => ReactElement;

    /**
     * Render function for the search bar.
     */
    renderSearchBar?: (props: IInvertableSelectRenderSearchBarProps) => ReactElement;

    /**
     * Render function for the no data state.
     */
    renderNoData?: (props: IInvertableSelectRenderNoDataProps) => ReactElement;

    /**
     * Render function for the button.
     */
    renderButton?: (props: IDropdownButtonRenderProps) => ReactNode;

    /**
     * Render function for the actions.
     */
    renderActions?: (props: IDropdownBodyRenderProps) => ReactElement;

    /**
     * Overlay position type.
     */
    overlayPositionType?: OverlayPositionType;
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
        className,
        bodyClassName,
        width = 240,
        alignPoints,
        getItemTitle,
        getItemKey,
        initialValue,
        initialIsInverted,
        initialSearchString,
        overlayPositionType,
        header,
        renderStatusBar,
        renderSearchBar,
        renderNoData,
        renderActions,
    } = props;

    const [searchString, setSearchString] = useState<string>(initialSearchString ?? "");
    const [committedSelection, setCommitedSelection] = useState<T[]>(initialValue ?? []);
    const [committedIsInverted, setCommitedIsInverted] = useState<boolean>(initialIsInverted ?? true);
    const [selection, setSelection] = useState<T[]>(initialValue ?? []);
    const [isInverted, setIsInverted] = useState<boolean>(initialIsInverted ?? true);

    const { text, count } = useInvertableSelectionStatusText(
        committedSelection,
        committedIsInverted,
        getItemTitle,
    );

    const buttonText = title ? `${title}: ${text}` : text;

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

    const renderButton = useMemo((): IDropdownInvertableSelectProps<T>["renderButton"] => {
        return (
            props.renderButton ??
            (({ toggleDropdown }) => (
                <UiButton
                    label={buttonText}
                    badgeAfter={count}
                    onClick={toggleDropdown}
                    size="small"
                    variant="secondary"
                    iconAfter="navigateDown"
                />
            ))
        );
    }, [buttonText, count, props.renderButton]);

    return (
        <Dropdown
            className={className}
            alignPoints={alignPoints}
            overlayPositionType={overlayPositionType}
            onOpenStateChanged={(isOpen) => {
                if (!isOpen) {
                    resetTemporarySelection();
                }
            }}
            renderButton={renderButton}
            renderBody={(bodyProps) => {
                const { closeDropdown } = bodyProps;
                const isEmptySelection = !isInverted && selection.length === 0;
                const isSelectionEqual =
                    isEqual(selection, committedSelection) && isInverted === committedIsInverted;
                return (
                    <>
                        {header}
                        <InvertableSelect
                            width={width}
                            className={bodyClassName}
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
                            renderNoData={renderNoData}
                            totalItemsCount={filteredOptions.length}
                        />
                        {renderActions?.(bodyProps) ?? (
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
                        )}
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

function DropdownInvertableSelectActions({
    onApply,
    isApplyDisabled,
    onCancel,
}: IDropdownInvertableSelectActionsProps) {
    const intl = useIntl();
    const cancelText = intl.formatMessage(messages.cancel);
    const applyText = intl.formatMessage(messages.apply);

    return (
        <>
            <div className="gd-invertable-select-actions">
                <SeparatorLine />
                <div className="gd-invertable-select-actions-buttons">
                    <UiButton variant="secondary" size="small" onClick={onCancel} label={cancelText} />
                    <UiButton
                        variant="primary"
                        size="small"
                        onClick={onApply}
                        label={applyText}
                        isDisabled={isApplyDisabled}
                    />
                </div>
            </div>
        </>
    );
}
