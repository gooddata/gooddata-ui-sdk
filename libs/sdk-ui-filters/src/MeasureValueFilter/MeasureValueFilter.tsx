// (C) 2020-2025 GoodData Corporation

import { Fragment, memo, useCallback, useRef, useState } from "react";

import { noop } from "lodash-es";

import { IMeasureValueFilter } from "@gooddata/sdk-model";

import MeasureValueFilterButton from "./MeasureValueFilterButton.js";
import { MeasureValueFilterDropdown } from "./MeasureValueFilterDropdown.js";
import { IMeasureValueFilterCommonProps } from "./typings.js";

/**
 * @beta
 */
export interface IMeasureValueFilterProps extends IMeasureValueFilterCommonProps {
    buttonTitle: string;
    onCancel?: () => void;
}

/**
 * @beta
 */
export interface IMeasureValueFilterState {
    displayDropdown: boolean;
}

/**
 * @beta
 */
export const MeasureValueFilter = memo(function MeasureValueFilter({
    onCancel = noop,
    filter,
    measureIdentifier,
    buttonTitle,
    usePercentage,
    warningMessage,
    locale,
    separators,
    displayTreatNullAsZeroOption,
    treatNullAsZeroDefaultValue,
    enableOperatorSelection,
    onApply,
}: IMeasureValueFilterProps) {
    const [displayDropdown, setDisplayDropdown] = useState(false);
    const buttonRef = useRef<HTMLDivElement>(null);

    const handleApply = useCallback(
        (filter: IMeasureValueFilter) => {
            setDisplayDropdown(false);
            onApply(filter);
        },
        [onApply],
    );

    const handleCancel = useCallback(() => {
        setDisplayDropdown(false);
        onCancel();
    }, [onCancel]);

    const toggleDropdown = useCallback(() => {
        setDisplayDropdown((state) => !state);
    }, []);

    return (
        <Fragment>
            <div ref={buttonRef}>
                <MeasureValueFilterButton
                    onClick={toggleDropdown}
                    isActive={displayDropdown}
                    buttonTitle={buttonTitle}
                />
            </div>
            {displayDropdown ? (
                <MeasureValueFilterDropdown
                    onApply={handleApply}
                    onCancel={handleCancel}
                    filter={filter}
                    measureIdentifier={measureIdentifier}
                    usePercentage={usePercentage}
                    warningMessage={warningMessage}
                    locale={locale}
                    separators={separators}
                    displayTreatNullAsZeroOption={displayTreatNullAsZeroOption}
                    treatNullAsZeroDefaultValue={treatNullAsZeroDefaultValue}
                    enableOperatorSelection={enableOperatorSelection}
                    anchorEl={buttonRef.current}
                />
            ) : null}
        </Fragment>
    );
});
