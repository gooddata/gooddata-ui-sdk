// (C) 2020-2026 GoodData Corporation

import { Fragment, type ReactNode, memo, useCallback, useEffect, useRef, useState } from "react";

import { type IMeasureValueFilter } from "@gooddata/sdk-model";
import { useIdPrefixed, useMediaQuery } from "@gooddata/sdk-ui-kit";

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
    buttonSubtitle?: string;
    buttonTitleExtension?: ReactNode;
    buttonDisabled?: boolean;
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
    buttonSubtitle,
    buttonTitleExtension,
    buttonDisabled,
    measureTitle,
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
    showSimplifiedSummary,
    catalogDimensionality,
    loadCatalogDimensionality,
    onDimensionalityChange,
    isLoadingCatalogDimensionality,
    withoutApply,
    BodyComponent,
    DropdownActionsComponent,
    enableMultipleConditions = false,
    enableRankingWithMvf,
    onApply,
    DropdownButtonComponent = DropdownButton,
    autoOpen,
    loadMetricDetails,
    isHeaderEnabled,
    onChange,
    alignPoints,
    fullscreenOnMobile,
    isViewMode,
}: IMeasureValueFilterProps) {
    const [displayDropdown, setDisplayDropdown] = useState(false);
    const dialogId = useIdPrefixed("mvf-dialog");
    const buttonRef = useRef<HTMLDivElement>(null);
    const autoOpenedRef = useRef<boolean>(false);
    const isMobile = useMediaQuery("mobileDevice");
    const useFullScreen = !!fullscreenOnMobile && isMobile;

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

    const renderDropdownButton = useCallback(
        (onClickHandler: () => void) => (
            <DropdownButtonComponent
                onClick={onClickHandler}
                isActive={displayDropdown}
                buttonTitle={buttonTitle}
                buttonSubtitle={buttonSubtitle}
                buttonTitleExtension={buttonTitleExtension}
                disabled={buttonDisabled}
                dropdownId={dialogId}
            />
        ),
        [
            DropdownButtonComponent,
            buttonDisabled,
            buttonSubtitle,
            buttonTitle,
            buttonTitleExtension,
            dialogId,
            displayDropdown,
        ],
    );

    return (
        <Fragment>
            {/* External trigger toggles open/close on click. */}
            <div ref={buttonRef}>{renderDropdownButton(toggleDropdown)}</div>
            {displayDropdown ? (
                <MeasureValueFilterDropdown
                    onApply={handleApply}
                    onChange={onChange}
                    withoutApply={withoutApply}
                    BodyComponent={BodyComponent}
                    DropdownActionsComponent={DropdownActionsComponent}
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
                    showSimplifiedSummary={showSimplifiedSummary}
                    catalogDimensionality={catalogDimensionality}
                    loadCatalogDimensionality={loadCatalogDimensionality}
                    onDimensionalityChange={onDimensionalityChange}
                    isLoadingCatalogDimensionality={isLoadingCatalogDimensionality}
                    enableMultipleConditions={enableMultipleConditions}
                    enableRankingWithMvf={enableRankingWithMvf}
                    anchorEl={buttonRef.current ?? undefined}
                    loadMetricDetails={loadMetricDetails}
                    isHeaderEnabled={isHeaderEnabled}
                    alignPoints={alignPoints}
                    fullscreenOnMobile={fullscreenOnMobile}
                    isViewMode={isViewMode}
                    dialogId={dialogId}
                    // Mobile header is the same visual button but dismisses via handleCancel
                    // so host onCancel cleanup (e.g. closing the configuration panel,
                    // clearing autoOpen) runs — toggleDropdown would skip that path.
                    mobileHeader={useFullScreen ? renderDropdownButton(handleCancel) : undefined}
                />
            ) : null}
        </Fragment>
    );
});
