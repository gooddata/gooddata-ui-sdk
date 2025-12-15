// (C) 2019-2025 GoodData Corporation

import { memo, useCallback } from "react";

import { type ObjRefInScope } from "@gooddata/sdk-model";
import { type ISeparators, IntlWrapper } from "@gooddata/sdk-ui";
import { Overlay } from "@gooddata/sdk-ui-kit";

import { DropdownBody } from "./DropdownBody.js";
import { type IMeasureValueFilterValue, type MeasureValueFilterOperator } from "./types.js";
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
        operator: MeasureValueFilterOperator | null,
        value: IMeasureValueFilterValue,
        treatNullValuesAsZero: boolean,
        dimensionality?: ObjRefInScope[],
    ) => void;
    onCancel: () => void;
    operator?: MeasureValueFilterOperator | null;
    value?: IMeasureValueFilterValue | null;
    usePercentage?: boolean;
    warningMessage?: WarningMessage;
    locale?: string;
    anchorEl?: HTMLElement | string;
    separators?: ISeparators;
    displayTreatNullAsZeroOption?: boolean;
    treatNullAsZeroValue?: boolean;
    enableOperatorSelection?: boolean;
    dimensionality?: IDimensionalityItem[];
    insightDimensionality?: IDimensionalityItem[];
    isDimensionalityEnabled?: boolean;
}

const DropdownWithIntl = memo(function DropdownWithIntl(props: IDropdownProps) {
    const {
        operator = "ALL",
        value = {},
        usePercentage,
        warningMessage,
        locale,
        onCancel,
        anchorEl,
        separators,
        displayTreatNullAsZeroOption = false,
        treatNullAsZeroValue = false,
        enableOperatorSelection,
        onApply: onApplyProp,
        dimensionality,
        insightDimensionality,
        isDimensionalityEnabled,
    } = props;

    const onApply = useCallback(
        (
            operator: MeasureValueFilterOperator | null,
            value: IMeasureValueFilterValue,
            treatNullValuesAsZero: boolean,
            newDimensionality?: ObjRefInScope[],
        ) => {
            onApplyProp(operator, value, treatNullValuesAsZero, newDimensionality);
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
                value={value ?? {}}
                usePercentage={usePercentage}
                warningMessage={warningMessage}
                locale={locale}
                onCancel={onCancel}
                onApply={onApply}
                separators={separators}
                displayTreatNullAsZeroOption={displayTreatNullAsZeroOption}
                treatNullAsZeroValue={treatNullAsZeroValue}
                enableOperatorSelection={enableOperatorSelection}
                dimensionality={dimensionality}
                insightDimensionality={insightDimensionality}
                isDimensionalityEnabled={isDimensionalityEnabled}
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
