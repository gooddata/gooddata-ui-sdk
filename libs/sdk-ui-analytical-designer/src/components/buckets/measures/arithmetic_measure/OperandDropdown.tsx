// (C) 2007-2026 GoodData Corporation

import { type ReactElement, memo, useCallback, useState } from "react";

import { connect } from "react-redux";
import { createSelector, createStructuredSelector } from "reselect";

import { Dropdown } from "@gooddata/sdk-ui-kit";

import { getOperandLocalIdentifiers, isValidArithmeticMeasure } from "../../../../models/bucket_item.js";
import { hasLocalIdentifier } from "../../../../models/decorated_bucket_item.js";
import {
    highlightBucketAndFilterItems,
    resetHighlightedBucketAndFilterItems,
} from "../../../../sagas/highlighting/highlighting_ui_actions.js";
import {
    type IBucketSequenceNumbers,
    getMeasureSequenceNumbers,
} from "../../../../selectors/measure_sequence_numbers_selector.js";
import { getDecoratedMeasures } from "../../../../services/decorated_buckets_service.js";
import { selectArithmeticMeasureOperand } from "../../../../store/arithmetic_measures/arithmetic_measures_actions.js";
import { type IAppState } from "../../../../store/types.js";
import { type IDecoratedBucketItem, type IDecoratedBucketItems } from "../../../../typings/buckets.js";
import { DROPDOWN_ALIGN_POINTS } from "../../../../utils/dropdown.js";
import { DropdownButtonWrapper } from "../../../DropdownButtonWrapper.js";

import { type IOperandDropdownItem } from "./model/operand_dropdown_item.js";
import { OperandDropdownBody } from "./OperandDropdownBody.js";
import { OperandDropdownButton } from "./OperandDropdownButton.js";

export interface IOperandDropdownOwnProps {
    localIdentifier: string;
    operandIndex: number;
}

export interface IOperandDropdownStateProps {
    availableMeasures: IOperandDropdownItem[];
    selectedMeasure: IOperandDropdownItem | null;
}

export interface IOperandDropdownDispatchProps {
    onSelect: (localIdentifier: string, operandIndex: number, selectedMeasureLocalIdentifier: string) => void;
    setHighlightedBucketItems: (bucketItemlocalIdentifiers: string[]) => void;
    resetHighlightedBucketItems: () => void;
}

export type IOperandDropdownProps = IOperandDropdownOwnProps &
    IOperandDropdownStateProps &
    IOperandDropdownDispatchProps;

const mapDispatchToProps: IOperandDropdownDispatchProps = {
    onSelect: selectArithmeticMeasureOperand,
    setHighlightedBucketItems: highlightBucketAndFilterItems,
    resetHighlightedBucketItems: resetHighlightedBucketAndFilterItems,
};

const makeMapStateToProps = () => {
    return createStructuredSelector({
        availableMeasures: createGetAvailableMeasuresSelector(),
        selectedMeasure: createGetSelectedMeasureSelector(),
    });
};

export const OperandDropdownBase = memo(function OperandDropdownBase({
    selectedMeasure,
    availableMeasures,
    onSelect,
    localIdentifier,
    operandIndex,
    setHighlightedBucketItems,
    resetHighlightedBucketItems,
}: IOperandDropdownProps): ReactElement {
    const [opened, setOpened] = useState(false);
    const [width, setWidth] = useState(0);

    const adjustDropdownWidth = useCallback((buttonRef: HTMLElement) => {
        if (buttonRef) {
            setWidth(buttonRef.getBoundingClientRect().width);
        }
    }, []);

    const onMeasureSelected = useCallback(
        (selectedMeasureLocalIdentifier: string) => {
            resetHighlightedBucketItems();
            onSelect(localIdentifier, operandIndex, selectedMeasureLocalIdentifier);
        },
        [onSelect, localIdentifier, operandIndex, resetHighlightedBucketItems],
    );

    const onItemMouseEnter = useCallback(
        (localIdentifier: string) => {
            setHighlightedBucketItems([localIdentifier]);
        },
        [setHighlightedBucketItems],
    );

    const onItemMouseLeave = useCallback(() => {
        resetHighlightedBucketItems();
    }, [resetHighlightedBucketItems]);

    const onOpenStateChanged = useCallback(
        (opened: boolean) => {
            if (!opened) {
                resetHighlightedBucketItems();
            }
            setOpened(opened);
        },
        [resetHighlightedBucketItems],
    );

    const renderDropdownButton = useCallback(
        (toggleDropdown: () => void): ReactElement => {
            const noMeasuresAvailable = availableMeasures.length === 0;
            return (
                <DropdownButtonWrapper setRef={adjustDropdownWidth}>
                    <OperandDropdownButton
                        disabled={noMeasuresAvailable}
                        selectedMeasure={selectedMeasure}
                        operandIndex={operandIndex}
                        opened={opened}
                        onClick={toggleDropdown}
                    />
                </DropdownButtonWrapper>
            );
        },
        [availableMeasures, selectedMeasure, operandIndex, opened, adjustDropdownWidth],
    );

    const selectedMeasureLocalIdentifier = selectedMeasure === null ? null : selectedMeasure.localIdentifier;

    return (
        <div className="adi-am-selector s-adi-am-selector">
            <Dropdown
                renderButton={({ toggleDropdown }) => renderDropdownButton(toggleDropdown)}
                alignPoints={DROPDOWN_ALIGN_POINTS}
                closeOnMouseDrag
                closeOnOutsideClick
                closeOnParentScroll
                onOpenStateChanged={onOpenStateChanged}
                renderBody={({ closeDropdown }) => (
                    <OperandDropdownBody
                        width={width}
                        measures={availableMeasures}
                        selectedMeasureLocalIdentifier={selectedMeasureLocalIdentifier}
                        onSelect={(measure) => {
                            onMeasureSelected(measure);
                            closeDropdown();
                        }}
                        onItemMouseEnter={onItemMouseEnter}
                        onItemMouseLeave={onItemMouseLeave}
                    />
                )}
            />
        </div>
    );
});

function isReferencedByArithmeticMeasure(
    measure: IDecoratedBucketItem,
    measures: IDecoratedBucketItems,
    localIdentifier: string,
): boolean {
    return getOperandLocalIdentifiers(measure.original).some((operandLocalIdentifier: string) => {
        if (operandLocalIdentifier === localIdentifier) {
            return true;
        }

        const operandMeasure = measures.find(
            (measure: IDecoratedBucketItem) => measure.localIdentifier === operandLocalIdentifier,
        );

        if (operandMeasure?.isArithmeticMeasure) {
            return isReferencedByArithmeticMeasure(operandMeasure, measures, localIdentifier);
        }

        return false;
    });
}

function isArithmeticMeasureCompatibleOperandMeasure(
    operandArithmeticMeasure: IDecoratedBucketItem,
    arithmeticMeasureLocalIdentifier: string,
    allMeasures: IDecoratedBucketItems,
): boolean {
    return (
        !hasLocalIdentifier(operandArithmeticMeasure, arithmeticMeasureLocalIdentifier) &&
        isValidArithmeticMeasure(operandArithmeticMeasure.original) &&
        !isReferencedByArithmeticMeasure(
            operandArithmeticMeasure,
            allMeasures,
            arithmeticMeasureLocalIdentifier,
        )
    );
}

function isDerivedMeasureCompatibleOperandMeasure(
    operandDerivedMeasure: IDecoratedBucketItem,
    arithmeticMeasureLocalIdentifier: string,
    allMeasures: IDecoratedBucketItems,
): boolean {
    const masterLocalIdentifier = operandDerivedMeasure.masterLocalIdentifier;

    const masterMeasure = allMeasures.find((measure: IDecoratedBucketItem) => {
        return masterLocalIdentifier === measure.localIdentifier;
    });

    return (
        !hasLocalIdentifier(masterMeasure, arithmeticMeasureLocalIdentifier) &&
        isCompatibleOperandMeasure(masterMeasure, arithmeticMeasureLocalIdentifier, allMeasures)
    );
}

function isCompatibleOperandMeasure(
    measure: IDecoratedBucketItem,
    arithmeticMeasureLocalIdentifier: string,
    allMeasures: IDecoratedBucketItems,
): boolean {
    if (measure.isArithmeticMeasure) {
        return isArithmeticMeasureCompatibleOperandMeasure(
            measure,
            arithmeticMeasureLocalIdentifier,
            allMeasures,
        );
    } else if (measure.isDerived) {
        return isDerivedMeasureCompatibleOperandMeasure(
            measure,
            arithmeticMeasureLocalIdentifier,
            allMeasures,
        );
    }

    return true;
}

function getCompatibleOperandMeasures(
    arithmeticMeasureLocalIdentifier: string,
    allMeasures: IDecoratedBucketItems,
) {
    return allMeasures.filter((measure: IDecoratedBucketItem) =>
        isCompatibleOperandMeasure(measure, arithmeticMeasureLocalIdentifier, allMeasures),
    );
}

function buildOperandDropdownItem(
    selectedMeasure: IDecoratedBucketItem,
    measureSequenceNumbers: IBucketSequenceNumbers,
): IOperandDropdownItem {
    const localIdentifier = selectedMeasure.localIdentifier;
    return {
        title: selectedMeasure.label,
        sequenceNumber: measureSequenceNumbers[localIdentifier],
        localIdentifier,
    };
}

function createGetAvailableMeasuresSelector() {
    return createSelector(
        getDecoratedMeasures,
        getBucketItemLocalIdentifier,
        getMeasureSequenceNumbers,
        (
            measures: IDecoratedBucketItems,
            arithmeticMeasureLocalIdentifier: string,
            measureSequenceNumbers: IBucketSequenceNumbers,
        ): IOperandDropdownItem[] => {
            const compatibleOperandMeasures = getCompatibleOperandMeasures(
                arithmeticMeasureLocalIdentifier,
                measures,
            );

            const result: IOperandDropdownItem[] = [];

            compatibleOperandMeasures.forEach((measure: IDecoratedBucketItem) => {
                result.push(buildOperandDropdownItem(measure, measureSequenceNumbers));
            });
            return result;
        },
    );
}

function createGetSelectedMeasureSelector() {
    return createSelector(
        getDecoratedMeasures,
        getBucketItemLocalIdentifier,
        getOperandIndex,
        getMeasureSequenceNumbers,
        (
            measures: IDecoratedBucketItems,
            localIdentifier: string,
            operandIndex: number,
            measureSequenceNumbers: IBucketSequenceNumbers,
        ): IOperandDropdownItem | null => {
            const arithmeticMeasure = measures.find(
                (measure: IDecoratedBucketItem) => measure.localIdentifier === localIdentifier,
            );
            const operands = getOperandLocalIdentifiers(arithmeticMeasure.original);
            const selectedMeasureLocalIdentifier = operands[operandIndex];

            if (selectedMeasureLocalIdentifier === null) {
                return null;
            }

            const selectedMeasure: IDecoratedBucketItem = measures.find(
                (measure: IDecoratedBucketItem) => measure.localIdentifier === selectedMeasureLocalIdentifier,
            );

            if (!selectedMeasure) {
                return null;
            }

            return buildOperandDropdownItem(selectedMeasure, measureSequenceNumbers);
        },
    );
}

const getBucketItemLocalIdentifier = (_state: IAppState, props: IOperandDropdownOwnProps): string => {
    return props.localIdentifier;
};

const getOperandIndex = (_state: IAppState, props: IOperandDropdownOwnProps): number => {
    return props.operandIndex;
};

export const OperandDropdown = connect<
    IOperandDropdownStateProps,
    IOperandDropdownDispatchProps,
    IOperandDropdownOwnProps,
    IAppState
>(
    makeMapStateToProps,
    mapDispatchToProps,
)(OperandDropdownBase);

export const OperandDropdownTest = {
    createGetAvailableMeasuresSelector,
    createGetSelectedMeasureSelector,
};
