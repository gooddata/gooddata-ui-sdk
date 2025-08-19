// (C) 2019-2025 GoodData Corporation
import React, { useCallback, useMemo, useState } from "react";

import cx from "classnames";
import { IntlShape, useIntl } from "react-intl";

import { DateFilterGranularity } from "@gooddata/sdk-model";
import {
    IInvalidDatapoint,
    createInvalidDatapoint,
    createInvalidNode,
    useValidationContextValue,
} from "@gooddata/sdk-ui";
import { IAccessibilityConfigBase, useIdPrefixed } from "@gooddata/sdk-ui-kit";

import {
    IRelativeRangeDynamicSelectProps,
    RelativeRangeDynamicSelect,
} from "../DynamicSelect/RelativeRangeDynamicSelect.js";
import { DynamicSelectItem } from "../DynamicSelect/types.js";
import {
    findRelativeDateFilterOptionByLabel,
    findRelativeDateFilterOptionByValue,
    getRelativeDateFilterItems,
} from "../DynamicSelect/utils.js";
import { DateFilterOption, IUiRelativeDateFilterForm } from "../interfaces/index.js";
import { itemToString } from "../Select/utils.js";
import { defaultVisibleItemsRange } from "../Select/VirtualizedSelectMenu.js";

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
    error: IInvalidDatapoint | null;
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

    return (
        <SelectWrapper
            label={label}
            labelId={labelId}
            errorMessage={error?.message}
            errorId={error?.id ?? ""}
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
                    ...(error && { descriptionId: error.id }),
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

    const validationContextValue = useValidationContextValue(
        createInvalidNode({
            id: "RelativeRangePicker",
            children: {
                from: createInvalidNode({ id: "from" }),
                to: createInvalidNode({ id: "to" }),
            },
        }),
    );
    const { setInvalidDatapoints, getInvalidDatapoints } = validationContextValue;
    const fromError = getInvalidDatapoints({ path: ["from"] })[0] ?? null;
    const toError = getInvalidDatapoints({ path: ["to"] })[0] ?? null;

    const setError = useCallback(
        (section: "from" | "to", error: string | null) => {
            setInvalidDatapoints(
                () => [
                    !!error &&
                        createInvalidDatapoint({
                            message: error,
                        }),
                ],
                [section],
            );
        },
        [setInvalidDatapoints],
    );

    const getItems = useMemo(
        () => getItemsFactory(selectedFilterOption.granularity, isMobile, intl),
        [selectedFilterOption.granularity, isMobile, intl],
    );

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
                setError("from", null);
            }
        },
        [onSelectedFilterOptionChange, selectedFilterOption, getItems, setError],
    );

    const handleToChange = useCallback(
        (to: number | undefined): void => {
            onSelectedFilterOptionChange({ ...selectedFilterOption, to });
            if (to !== undefined) {
                setToInputValue(getInputValueFromValue(to, getItems(to?.toString())));
                setError("to", null);
            }
        },
        [onSelectedFilterOptionChange, selectedFilterOption, getItems, setError],
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
                setError("from", null);
                const items = getItems(value);
                const matchingItem = findRelativeDateFilterOptionByLabel(items, value);
                if (matchingItem) {
                    handleFromChange(matchingItem.value);
                }
            }
        },
        [validator, handleFromChange, setError, getItems],
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
                setError("to", null);
                const items = getItems(value);
                const matchingItem = findRelativeDateFilterOptionByLabel(items, value);
                if (matchingItem) {
                    handleToChange(matchingItem.value);
                }
            }
        },
        [validator, handleToChange, setError, getItems],
    );

    const handleFromBlur = useCallback((): void => {
        const validationResult = validator(fromInputValue);
        if (validationResult) {
            switch (validationResult) {
                case RelativeRangePickerErrorType.INVALID_VALUE:
                    setError("from", intl.formatMessage({ id: "filters.relative.from.invalid.value" }));
                    break;
                case RelativeRangePickerErrorType.EMPTY_VALUE:
                    setError("from", intl.formatMessage({ id: "filters.relative.from.empty.value" }));
                    break;
            }
            handleFromChange(undefined);
        } else {
            setError("from", null);
        }
    }, [validator, fromInputValue, handleFromChange, setError, intl]);

    const handleToBlur = useCallback((): void => {
        const validationResult = validator(toInputValue);
        if (validationResult) {
            switch (validationResult) {
                case RelativeRangePickerErrorType.INVALID_VALUE:
                    setError("to", intl.formatMessage({ id: "filters.relative.to.invalid.value" }));
                    break;
                case RelativeRangePickerErrorType.EMPTY_VALUE:
                    setError("to", intl.formatMessage({ id: "filters.relative.to.empty.value" }));
                    break;
            }
            handleToChange(undefined);
        } else {
            setError("to", null);
        }
    }, [validator, toInputValue, handleToChange, setError, intl]);

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
