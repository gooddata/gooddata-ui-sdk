// (C) 2019-2026 GoodData Corporation

import { memo, useCallback } from "react";

import { type MeasureValueFilterCondition, type ObjRefInScope } from "@gooddata/sdk-model";
import { type ISeparators, IntlWrapper } from "@gooddata/sdk-ui";
import { Overlay } from "@gooddata/sdk-ui-kit";

import { DropdownBody } from "./DropdownBody.js";
import { type MeasureValueFilterOperator } from "./types.js";
import { type IDimensionalityItem, type WarningMessage } from "./typings.js";

const alignPoints = ["bl tl", "tl bl", "br tr", "tr br"];
/*
 * TODO: same thing is in sdk-ui-ext .. but filters must not depend on it. we may be in need of some lower-level
 *  project on which both of filters and ext can depend. perhaps the purpose of the new project would be to provide
 *  thin layer on top of goodstrap (?)
 */
const DROPDOWN_ALIGNMENTS = alignPoints.map((align) => ({ align, offset: { x: 1, y: 0 } }));

interface IDropdownProps {
    onApply: (
        conditions: MeasureValueFilterCondition[] | null,
        dimensionality?: ObjRefInScope[],
        applyOnResult?: boolean,
    ) => void;
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
    catalogDimensionality?: IDimensionalityItem[];
    loadCatalogDimensionality?: (dimensionality: ObjRefInScope[]) => Promise<IDimensionalityItem[]>;
    onDimensionalityChange?: (dimensionality: ObjRefInScope[]) => void;
    isLoadingCatalogDimensionality?: boolean;
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
        dimensionality,
        insightDimensionality,
        isDimensionalityEnabled,
        catalogDimensionality,
        loadCatalogDimensionality,
        onDimensionalityChange,
        isLoadingCatalogDimensionality,
        conditions = [],
        enableMultipleConditions = false,
        enableRankingWithMvf,
        applyOnResult,
    } = props;

    const onApply = useCallback(
        (
            conditions: MeasureValueFilterCondition[] | null,
            newDimensionality?: ObjRefInScope[],
            applyOnResult?: boolean,
        ) => {
            onApplyProp(conditions, newDimensionality, applyOnResult);
        },
        [onApplyProp],
    );

    const selectedOperator: MeasureValueFilterOperator = operator === null ? "ALL" : operator;

    return (
        <Overlay
            alignTo={anchorEl}
            alignPoints={DROPDOWN_ALIGNMENTS}
            closeOnOutsideClick
            closeOnParentScroll
            closeOnMouseDrag
            onClose={onCancel}
        >
            <DropdownBody
                operator={selectedOperator}
                conditions={conditions}
                enableMultipleConditions={enableMultipleConditions}
                usePercentage={usePercentage}
                warningMessage={warningMessage}
                locale={locale}
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
                catalogDimensionality={catalogDimensionality}
                loadCatalogDimensionality={loadCatalogDimensionality}
                onDimensionalityChange={onDimensionalityChange}
                isLoadingCatalogDimensionality={isLoadingCatalogDimensionality}
                enableRankingWithMvf={enableRankingWithMvf}
                applyOnResult={applyOnResult}
            />
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
