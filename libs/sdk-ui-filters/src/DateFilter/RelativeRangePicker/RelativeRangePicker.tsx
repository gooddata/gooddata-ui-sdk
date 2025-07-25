// (C) 2019-2025 GoodData Corporation
import React, { useState, useCallback, useMemo } from "react";
import cx from "classnames";

import {
    RelativeRangeDynamicSelect,
    IRelativeRangeDynamicSelectProps,
} from "../DynamicSelect/RelativeRangeDynamicSelect.js";
import {
    findRelativeDateFilterOptionByLabel,
    findRelativeDateFilterOptionByValue,
    getRelativeDateFilterItems,
} from "../DynamicSelect/utils.js";
import { IntlShape, useIntl } from "react-intl";

import { defaultVisibleItemsRange } from "../Select/VirtualizedSelectMenu.js";
import { IUiRelativeDateFilterForm, DateFilterOption } from "../interfaces/index.js";
import { IAccessibilityConfigBase, useIdPrefixed } from "@gooddata/sdk-ui-kit";
import { DynamicSelectItem } from "../DynamicSelect/types.js";
import { itemToString } from "../Select/utils.js";
import { DateFilterGranularity } from "@gooddata/sdk-model";

enum RelativeRangePickerErrorType {
    INVALID_VALUE = "INVALID_VALUE",
    EMPTY_VALUE = "EMPTY_VALUE",
}

interface ISelectWrapperProps {
    errorId: string;
    label: string;
    labelId: string;
    errorMessage: string;
    children: React.ReactNode;
    className?: string;
}

const SelectWrapper = (props: ISelectWrapperProps) => {
    return (
        <div
            className={cx(
                props.className,
                "gd-relative-range-picker-select-wrapper s-relative-range-picker-select-wrapper",
            )}
        >
            <label className="gd-label" id={props.labelId}>
                {props.label}
            </label>
            {props.children}
            {props.errorMessage ? (
                <div
                    id={props.errorId}
                    className="s-gd-relative-range-picker-error gd-relative-range-picker-select-wrapper__error-message"
                >
                    {props.errorMessage}
                </div>
            ) : null}
        </div>
    );
};

interface IRelativeRangePickerProps {
    selectedFilterOption: IUiRelativeDateFilterForm;
    onSelectedFilterOptionChange: (dateFilterOption: DateFilterOption) => void;
    isMobile: boolean;
    accessibilityConfig?: IAccessibilityConfigBase;
    id?: string;
}

const getItemsFactory = (
    granularity: DateFilterGranularity,
    isMobile: boolean,
    intl: IntlShape,
): ((value: string) => DynamicSelectItem[]) => {
    return (value: string): DynamicSelectItem[] => {
        const items = getRelativeDateFilterItems(value, granularity, intl);

        // separators are not needed in mobile as all the items have borders
        return isMobile ? items.filter((item) => item.type !== "separator") : items;
    };
};

const getInputValueFromValue = (value: number | undefined, items: DynamicSelectItem[]): string => {
    const selectedItem = value !== undefined ? findRelativeDateFilterOptionByValue(items, value) : null;

    return selectedItem ? itemToString(selectedItem) : value ? value.toString() : "";
};

interface IRelativeRangePickerSelectProps {
    label: string;
    value: number | undefined;
    inputValue: string;
    error: string | null;
    onChange: (value: number | undefined) => void;
    onInputChange: (value: string) => void;
    onBlur: () => void;
    commonProps: IRelativeRangeDynamicSelectProps;
    intl: IntlShape;
    isMobile: boolean;
    className?: string;
    wrapperClassName?: string;
}

const RelativeRangePickerSelect = React.memo((props: IRelativeRangePickerSelectProps) => {
    const {
        label,
        value,
        inputValue,
        error,
        onChange,
        onInputChange,
        onBlur,
        commonProps,
        intl,
        isMobile,
        className,
        wrapperClassName,
    } = props;

    const labelId = useIdPrefixed("label");
    const errorId = useIdPrefixed("error");

    return (
        <SelectWrapper
            label={label}
            labelId={labelId}
            errorMessage={error}
            errorId={errorId}
            className={wrapperClassName}
        >
            <RelativeRangeDynamicSelect
                {...commonProps}
                value={value}
                onChange={onChange}
                inputValue={inputValue}
                onInputValueChange={onInputChange}
                onBlur={onBlur}
                placeholder={intl.formatMessage({ id: "filters.relative.placeholder" })}
                className={cx(className, "gd-relative-range-picker-picker", {
                    "gd-relative-range-picker-picker-mobile": isMobile,
                    "has-error": error !== null,
                })}
                accessibilityConfig={{
                    labelId,
                    ...(error && { descriptionId: errorId }),
                }}
            />
        </SelectWrapper>
    );
});

const mobileVisibleItemsRange = 5;

export function RelativeRangePicker({
    selectedFilterOption,
    isMobile,
    accessibilityConfig,
    id,
    onSelectedFilterOptionChange,
}: IRelativeRangePickerProps) {
    const intl = useIntl();

    const getItems = useMemo(
        () => getItemsFactory(selectedFilterOption.granularity, isMobile, intl),
        [selectedFilterOption.granularity, isMobile, intl],
    );

    const [fromError, setFromError] = useState<string | null>(null);
    const [toError, setToError] = useState<string | null>(null);
    const [fromInputValue, setFromInputValue] = useState<string>(
        getInputValueFromValue(
            selectedFilterOption.from,
            selectedFilterOption.from !== undefined ? getItems(selectedFilterOption.from.toString()) : [],
        ),
    );
    const [toInputValue, setToInputValue] = useState<string>(
        getInputValueFromValue(
            selectedFilterOption.to,
            selectedFilterOption.to !== undefined ? getItems(selectedFilterOption.to.toString()) : [],
        ),
    );

    const commonProps = useMemo(
        () => ({
            visibleItemsRange: isMobile ? mobileVisibleItemsRange : defaultVisibleItemsRange,
            optionClassName: "s-relative-date-filter-option s-do-not-close-dropdown-on-click",
            getItems,
            inputValue: "",
            onInputValueChange: () => {},
        }),
        [isMobile, getItems],
    );

    const handleFromChange = useCallback(
        (from: number | undefined): void => {
            onSelectedFilterOptionChange({ ...selectedFilterOption, from });
            if (from !== undefined) {
                setFromInputValue(getInputValueFromValue(from, getItems(from?.toString())));
                setFromError(null);
            }
        },
        [selectedFilterOption, onSelectedFilterOptionChange, getItems],
    );

    const handleToChange = useCallback(
        (to: number | undefined): void => {
            onSelectedFilterOptionChange({ ...selectedFilterOption, to });
            if (to !== undefined) {
                setToInputValue(getInputValueFromValue(to, getItems(to?.toString())));
                setToError(null);
            }
        },
        [selectedFilterOption, onSelectedFilterOptionChange, getItems],
    );

    const validator = useCallback(
        (inputValue: string): RelativeRangePickerErrorType | null => {
            if (inputValue === "") {
                return RelativeRangePickerErrorType.EMPTY_VALUE;
            }
            const items = getItems(inputValue);
            const matchingItem = findRelativeDateFilterOptionByLabel(items, inputValue);
            if (matchingItem) {
                return null;
            }
            return RelativeRangePickerErrorType.INVALID_VALUE;
        },
        [getItems],
    );

    const handleFromInputChange = useCallback(
        (value: string): void => {
            setFromInputValue(value);
            // During typing, we only validate but don't show errors
            const validationResult = validator(value);
            if (validationResult) {
                // Store the error but don't show it yet
                handleFromChange(undefined);
            } else {
                setFromError(null);
                const items = getItems(value);
                const matchingItem = findRelativeDateFilterOptionByLabel(items, value);
                if (matchingItem) {
                    handleFromChange(matchingItem.value);
                }
            }
        },
        [validator, handleFromChange, getItems],
    );

    const handleToInputChange = useCallback(
        (value: string): void => {
            setToInputValue(value);
            // During typing, we only validate but don't show errors
            const validationResult = validator(value);
            if (validationResult) {
                // Store the error but don't show it yet
                handleToChange(undefined);
            } else {
                setToError(null);
                const items = getItems(value);
                const matchingItem = findRelativeDateFilterOptionByLabel(items, value);
                if (matchingItem) {
                    handleToChange(matchingItem.value);
                }
            }
        },
        [validator, handleToChange, getItems],
    );

    const handleFromBlur = useCallback((): void => {
        const validationResult = validator(fromInputValue);
        if (validationResult) {
            switch (validationResult) {
                case RelativeRangePickerErrorType.INVALID_VALUE:
                    setFromError(intl.formatMessage({ id: "filters.relative.from.invalid.value" }));
                    break;
                case RelativeRangePickerErrorType.EMPTY_VALUE:
                    setFromError(intl.formatMessage({ id: "filters.relative.from.empty.value" }));
                    break;
            }
            handleFromChange(undefined);
        } else {
            setFromError(null);
        }
    }, [validator, fromInputValue, intl, handleFromChange]);

    const handleToBlur = useCallback((): void => {
        const validationResult = validator(toInputValue);
        if (validationResult) {
            switch (validationResult) {
                case RelativeRangePickerErrorType.INVALID_VALUE:
                    setToError(intl.formatMessage({ id: "filters.relative.to.invalid.value" }));
                    break;
                case RelativeRangePickerErrorType.EMPTY_VALUE:
                    setToError(intl.formatMessage({ id: "filters.relative.to.empty.value" }));
                    break;
            }
            handleToChange(undefined);
        } else {
            setToError(null);
        }
    }, [validator, toInputValue, intl, handleToChange]);

    return (
        <div
            id={id}
            className="gd-relative-range-picker s-relative-range-picker"
            role={accessibilityConfig?.role}
            aria-labelledby={accessibilityConfig?.ariaLabelledBy}
        >
            <RelativeRangePickerSelect
                className="s-relative-range-picker-from"
                wrapperClassName="s-relative-range-picker-from-wrapper"
                label={intl.formatMessage({ id: "filters.relative.from.label" })}
                value={selectedFilterOption.from}
                inputValue={fromInputValue}
                error={fromError}
                onChange={handleFromChange}
                onInputChange={handleFromInputChange}
                onBlur={handleFromBlur}
                commonProps={commonProps}
                intl={intl}
                isMobile={isMobile}
            />
            <RelativeRangePickerSelect
                className="s-relative-range-picker-to"
                wrapperClassName="s-relative-range-picker-to-wrapper"
                label={intl.formatMessage({ id: "filters.relative.to.label" })}
                value={selectedFilterOption.to}
                inputValue={toInputValue}
                error={toError}
                onChange={handleToChange}
                onInputChange={handleToInputChange}
                onBlur={handleToBlur}
                commonProps={commonProps}
                intl={intl}
                isMobile={isMobile}
            />
        </div>
    );
}
