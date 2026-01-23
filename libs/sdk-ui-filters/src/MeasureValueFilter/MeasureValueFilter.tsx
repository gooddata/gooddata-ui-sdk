// (C) 2020-2026 GoodData Corporation

import { Fragment, memo, useCallback, useRef, useState } from "react";

import { type IMeasureValueFilter } from "@gooddata/sdk-model";

import { DropdownButton } from "./MeasureValueFilterButton.js";
import { MeasureValueFilterDropdown } from "./MeasureValueFilterDropdown.js";
import { type IMeasureValueFilterCommonProps } from "./typings.js";

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
    onCancel = () => {},
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
    dimensionality,
    insightDimensionality,
    isDimensionalityEnabled,
    catalogDimensionality,
    onDimensionalityChange,
    isLoadingCatalogDimensionality,
    enableMultipleConditions = false,
    onApply,
}: IMeasureValueFilterProps) {
    const [displayDropdown, setDisplayDropdown] = useState(false);
    const buttonRef = useRef<HTMLDivElement>(null);

    const handleApply = useCallback(
        (filter: IMeasureValueFilter | null) => {
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
                <DropdownButton
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
                    dimensionality={dimensionality}
                    insightDimensionality={insightDimensionality}
                    isDimensionalityEnabled={isDimensionalityEnabled}
                    catalogDimensionality={catalogDimensionality}
                    onDimensionalityChange={onDimensionalityChange}
                    isLoadingCatalogDimensionality={isLoadingCatalogDimensionality}
                    enableMultipleConditions={enableMultipleConditions}
                    anchorEl={buttonRef.current ?? undefined}
                />
            ) : null}
        </Fragment>
    );
});
