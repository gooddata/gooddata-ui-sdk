// (C) 2019-2026 GoodData Corporation

import { type ReactNode, memo, useCallback } from "react";

import {
    type IMeasureMetadataObject,
    type MeasureValueFilterCondition,
    type ObjRefInScope,
} from "@gooddata/sdk-model";
import { type ISeparators, IntlWrapper } from "@gooddata/sdk-ui";
import {
    FullScreenOverlay,
    type IAlignPoint,
    Overlay,
    UiFocusManager,
    useMediaQuery,
} from "@gooddata/sdk-ui-kit";

import { DropdownBody } from "./DropdownBody.js";
import { type MeasureValueFilterOperator } from "./types.js";
import {
    type IDimensionalityItem,
    type IMeasureValueFilterCustomComponentProps,
    type IMeasureValueFilterDropdownCallback,
    type WarningMessage,
} from "./typings.js";

const alignPoints = ["bl tl", "tl bl", "br tr", "tr br"];
/*
 * TODO: same thing is in sdk-ui-ext .. but filters must not depend on it. we may be in need of some lower-level
 *  project on which both of filters and ext can depend. perhaps the purpose of the new project would be to provide
 *  thin layer on top of goodstrap (?)
 */
const DROPDOWN_ALIGNMENTS = alignPoints.map((align) => ({ align, offset: { x: 1, y: 0 } }));
const MOBILE_DROPDOWN_ALIGN_POINTS: IAlignPoint[] = [{ align: "tl tl" }];

interface IDropdownProps extends IMeasureValueFilterCustomComponentProps {
    onApply: IMeasureValueFilterDropdownCallback;
    onChange?: IMeasureValueFilterDropdownCallback;
    withoutApply?: boolean;
    onCancel: () => void;
    operator?: MeasureValueFilterOperator | null;
    conditions?: MeasureValueFilterCondition[];
    enableMultipleConditions?: boolean;
    enableRankingWithMvf?: boolean;
    applyOnResult?: boolean;
    usePercentage?: boolean;
    warningMessage?: WarningMessage;
    locale?: string;
    anchorEl?: HTMLElement | string;
    separators?: ISeparators;
    format?: string;
    useShortFormat?: boolean;
    measureTitle?: string;
    displayTreatNullAsZeroOption?: boolean;
    treatNullAsZeroValue?: boolean;
    enableOperatorSelection?: boolean;
    dimensionality?: IDimensionalityItem[];
    insightDimensionality?: IDimensionalityItem[];
    isDimensionalityEnabled?: boolean;
    isFilterSummaryEnabled?: boolean;
    catalogDimensionality?: IDimensionalityItem[];
    loadCatalogDimensionality?: (dimensionality: ObjRefInScope[]) => Promise<IDimensionalityItem[]>;
    onDimensionalityChange?: (dimensionality: ObjRefInScope[]) => void;
    isLoadingCatalogDimensionality?: boolean;
    loadMetricDetails?: () => Promise<IMeasureMetadataObject | undefined>;
    isHeaderEnabled?: boolean;
    alignPoints?: IAlignPoint[];
    fullscreenOnMobile?: boolean;
    mobileHeader?: ReactNode;
}

const DropdownWithIntl = memo(function DropdownWithIntl(props: IDropdownProps) {
    const {
        operator = "ALL",
        usePercentage,
        warningMessage,
        locale,
        onCancel,
        anchorEl,
        separators,
        format,
        useShortFormat,
        measureTitle,
        displayTreatNullAsZeroOption = false,
        treatNullAsZeroValue = false,
        enableOperatorSelection,
        onApply: onApplyProp,
        onChange: onChangeProp,
        withoutApply,
        BodyComponent,
        DropdownActionsComponent,
        dimensionality,
        insightDimensionality,
        isDimensionalityEnabled,
        isFilterSummaryEnabled = true,
        catalogDimensionality,
        loadCatalogDimensionality,
        onDimensionalityChange,
        isLoadingCatalogDimensionality,
        conditions = [],
        enableMultipleConditions = false,
        enableRankingWithMvf,
        applyOnResult,
        loadMetricDetails,
        isHeaderEnabled,
        alignPoints,
        fullscreenOnMobile,
        mobileHeader,
    } = props;

    const isMobile = useMediaQuery("mobileDevice");
    const useFullScreen = !!fullscreenOnMobile && isMobile;

    const onApply: IMeasureValueFilterDropdownCallback = useCallback(
        (conditions, newDimensionality, applyOnResult) => {
            onApplyProp(conditions, newDimensionality, applyOnResult);
        },
        [onApplyProp],
    );

    const selectedOperator: MeasureValueFilterOperator = operator === null ? "ALL" : operator;

    const body = (
        <UiFocusManager enableFocusTrap enableAutofocus enableReturnFocusOnUnmount>
            <DropdownBody
                operator={selectedOperator}
                conditions={conditions}
                enableMultipleConditions={enableMultipleConditions}
                usePercentage={usePercentage}
                warningMessage={warningMessage}
                locale={locale}
                onChange={onChangeProp}
                withoutApply={withoutApply}
                BodyComponent={BodyComponent}
                DropdownActionsComponent={DropdownActionsComponent}
                onCancel={onCancel}
                onApply={onApply}
                separators={separators}
                format={format}
                useShortFormat={useShortFormat}
                measureTitle={measureTitle}
                displayTreatNullAsZeroOption={displayTreatNullAsZeroOption}
                treatNullAsZeroValue={treatNullAsZeroValue}
                enableOperatorSelection={enableOperatorSelection}
                dimensionality={dimensionality}
                insightDimensionality={insightDimensionality}
                isDimensionalityEnabled={isDimensionalityEnabled}
                isFilterSummaryEnabled={isFilterSummaryEnabled}
                catalogDimensionality={catalogDimensionality}
                loadCatalogDimensionality={loadCatalogDimensionality}
                onDimensionalityChange={onDimensionalityChange}
                isLoadingCatalogDimensionality={isLoadingCatalogDimensionality}
                enableRankingWithMvf={enableRankingWithMvf}
                applyOnResult={applyOnResult}
                loadMetricDetails={loadMetricDetails}
                isHeaderEnabled={isHeaderEnabled}
                isMobile={useFullScreen}
            />
        </UiFocusManager>
    );

    if (useFullScreen) {
        return (
            <FullScreenOverlay alignTo="body" alignPoints={MOBILE_DROPDOWN_ALIGN_POINTS} onClose={onCancel}>
                <div className="gd-mobile-dropdown-overlay overlay gd-flex-row-container gd-mvf-mobile-dropdown">
                    {mobileHeader ? (
                        <div className="gd-mobile-dropdown-header gd-flex-item gd-mvf-mobile-dropdown-header gd-is-mobile">
                            {mobileHeader}
                        </div>
                    ) : null}
                    <div className="gd-mobile-dropdown-content gd-flex-item-stretch gd-flex-row-container gd-mvf-mobile-dropdown-content">
                        {body}
                    </div>
                </div>
            </FullScreenOverlay>
        );
    }

    return (
        <Overlay
            alignTo={anchorEl}
            alignPoints={alignPoints ?? DROPDOWN_ALIGNMENTS}
            closeOnOutsideClick
            closeOnParentScroll
            closeOnMouseDrag
            onClose={onCancel}
        >
            {body}
        </Overlay>
    );
});

export function Dropdown(props: IDropdownProps) {
    return (
        <IntlWrapper locale={props.locale}>
            <DropdownWithIntl {...props} />
        </IntlWrapper>
    );
}
