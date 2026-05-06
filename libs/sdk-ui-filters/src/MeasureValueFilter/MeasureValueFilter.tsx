// (C) 2020-2026 GoodData Corporation

import { Fragment, memo, useCallback, useEffect, useRef, useState } from "react";

import { type IMeasureValueFilter } from "@gooddata/sdk-model";

import { DropdownButton } from "./MeasureValueFilterButton.js";
import { MeasureValueFilterDropdown } from "./MeasureValueFilterDropdown.js";
import {
    type IMeasureValueFilterCommonProps,
    type IMeasureValueFilterCustomComponentsProps,
} from "./typings.js";

/**
 * @beta
 */
export interface IMeasureValueFilterProps
    extends IMeasureValueFilterCommonProps, IMeasureValueFilterCustomComponentsProps {
    buttonTitle: string;
    onCancel?: () => void;
    /**
     * When toggled from falsy to truthy, opens the dropdown once. A re-render with
     * the same truthy value will not re-open it after the user has dismissed it.
     *
     * @beta
     */
    autoOpen?: boolean;
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
    format,
    useShortFormat,
    displayTreatNullAsZeroOption,
    treatNullAsZeroDefaultValue,
    enableOperatorSelection,
    dimensionality,
    insightDimensionality,
    isDimensionalityEnabled,
    isFilterSummaryEnabled,
    catalogDimensionality,
    loadCatalogDimensionality,
    onDimensionalityChange,
    isLoadingCatalogDimensionality,
    enableMultipleConditions = false,
    enableRankingWithMvf,
    onApply,
    DropdownButtonComponent = DropdownButton,
    autoOpen,
    loadMetricDetails,
    measureTitle,
    isHeaderEnabled,
}: IMeasureValueFilterProps) {
    const [displayDropdown, setDisplayDropdown] = useState(!!autoOpen);
    const buttonRef = useRef<HTMLDivElement>(null);
    const autoOpenedRef = useRef<boolean>(!!autoOpen);

    useEffect(() => {
        if (autoOpen && !autoOpenedRef.current) {
            autoOpenedRef.current = true;
            setDisplayDropdown(true);
        } else if (!autoOpen) {
            autoOpenedRef.current = false;
        }
    }, [autoOpen]);

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
                <DropdownButtonComponent
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
                    measureTitle={measureTitle}
                    usePercentage={usePercentage}
                    warningMessage={warningMessage}
                    locale={locale}
                    separators={separators}
                    format={format}
                    useShortFormat={useShortFormat}
                    displayTreatNullAsZeroOption={displayTreatNullAsZeroOption}
                    treatNullAsZeroDefaultValue={treatNullAsZeroDefaultValue}
                    enableOperatorSelection={enableOperatorSelection}
                    dimensionality={dimensionality}
                    insightDimensionality={insightDimensionality}
                    isDimensionalityEnabled={isDimensionalityEnabled}
                    isFilterSummaryEnabled={isFilterSummaryEnabled}
                    catalogDimensionality={catalogDimensionality}
                    loadCatalogDimensionality={loadCatalogDimensionality}
                    onDimensionalityChange={onDimensionalityChange}
                    isLoadingCatalogDimensionality={isLoadingCatalogDimensionality}
                    enableMultipleConditions={enableMultipleConditions}
                    enableRankingWithMvf={enableRankingWithMvf}
                    anchorEl={buttonRef.current ?? undefined}
                    loadMetricDetails={loadMetricDetails}
                    isHeaderEnabled={isHeaderEnabled}
                />
            ) : null}
        </Fragment>
    );
});
