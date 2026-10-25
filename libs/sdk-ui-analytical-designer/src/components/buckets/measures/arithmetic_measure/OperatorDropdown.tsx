// (C) 2007-2026 GoodData Corporation

import { type ReactElement, memo, useState } from "react";

import { connect } from "react-redux";
import { createSelector, createStructuredSelector } from "reselect";

import { Dropdown } from "@gooddata/sdk-ui-kit";

import { getAllMeasures } from "../../../../selectors/buckets_selector.js";
import { selectArithmeticMeasureOperator } from "../../../../store/arithmetic_measures/arithmetic_measures_actions.js";
import { type IAppState } from "../../../../store/types.js";
import {
    ArithmeticOperatorType,
    type IOperatorDropdownItem,
} from "../../../../typings/arithmetic_measure.js";
import { type IRawBucketItem, type IRawBucketItems } from "../../../../typings/buckets.js";
import { DROPDOWN_ALIGN_POINTS } from "../../../../utils/dropdown.js";
import { DropdownButtonWrapper } from "../../../DropdownButtonWrapper.js";

import { OperatorDropdownBody } from "./OperatorDropdownBody.js";
import { OperatorDropdownButton } from "./OperatorDropdownButton.js";

export interface IOperatorDropdownOwnProps {
    localIdentifier: string;
}

export interface IOperatorDropdownStateProps {
    selectedOperator: ArithmeticOperatorType;
}

export interface IOperatorDropdownDispatchProps {
    onSelect: (localIdentifier: string, operator: ArithmeticOperatorType) => void;
}

export type IOperatorDropdownProps = IOperatorDropdownOwnProps &
    IOperatorDropdownStateProps &
    IOperatorDropdownDispatchProps;

export const availableOperators: IOperatorDropdownItem[] = [
    { type: ArithmeticOperatorType.SUM },
    { type: ArithmeticOperatorType.DIFFERENCE },
    { type: ArithmeticOperatorType.MULTIPLICATION, tooltip: true },
    { type: ArithmeticOperatorType.RATIO },
    { type: ArithmeticOperatorType.CHANGE, tooltip: true },
];

export const hintsForOperators = {
    [ArithmeticOperatorType.SUM]: "=A+B",
    [ArithmeticOperatorType.DIFFERENCE]: "=A−B",
    [ArithmeticOperatorType.MULTIPLICATION]: "=A×B",
    [ArithmeticOperatorType.RATIO]: "=A÷B",
    [ArithmeticOperatorType.CHANGE]: "=(A−B)/B",
};

export const OperatorDropdownBase = memo(function OperatorDropdownBase({
    selectedOperator,
    onSelect,
    localIdentifier,
}: IOperatorDropdownProps) {
    const [opened, setOpened] = useState(false);
    const [width, setWidth] = useState(0);

    const adjustDropdownWidth = (buttonRef: HTMLElement) => {
        if (buttonRef) {
            setWidth(buttonRef.getBoundingClientRect().width);
        }
    };

    const onOperatorSelected = (selectedOperator: ArithmeticOperatorType) => {
        onSelect(localIdentifier, selectedOperator);
    };

    const onOpenStateChanged = (opened: boolean) => {
        setOpened(opened);
    };

    const renderDropdownButton = (toggleDropdown: () => void): ReactElement => {
        return (
            <DropdownButtonWrapper setRef={adjustDropdownWidth}>
                <OperatorDropdownButton
                    selectedOperator={selectedOperator}
                    opened={opened}
                    onClick={toggleDropdown}
                />
            </DropdownButtonWrapper>
        );
    };

    return (
        <div className="adi-am-operator-selector">
            <Dropdown
                renderButton={({ toggleDropdown }) => renderDropdownButton(toggleDropdown)}
                alignPoints={DROPDOWN_ALIGN_POINTS}
                closeOnMouseDrag
                closeOnOutsideClick
                closeOnParentScroll
                onOpenStateChanged={onOpenStateChanged}
                renderBody={({ closeDropdown }) => (
                    <OperatorDropdownBody
                        width={width}
                        availableOperators={availableOperators}
                        selectedOperator={selectedOperator}
                        onSelect={(selected) => {
                            onOperatorSelected(selected);
                            closeDropdown();
                        }}
                    />
                )}
            />
            <div className="adi-am-operator-selector-hint s-adi-am-selector-hint">
                {hintsForOperators[selectedOperator]}
            </div>
        </div>
    );
});

const mapDispatchToProps: IOperatorDropdownDispatchProps = {
    onSelect: selectArithmeticMeasureOperator,
};

const getBucketItemLocalIdentifier = (_state: IAppState, props: IOperatorDropdownOwnProps): string => {
    return props.localIdentifier;
};

function createSelectedOperatorSelector() {
    return createSelector(
        getAllMeasures,
        getBucketItemLocalIdentifier,
        (measures: IRawBucketItems, localIdentifier: string) => {
            const selectedMeasure = [...(measures ?? [])].find(
                (item: IRawBucketItem) => item?.localIdentifier === localIdentifier,
            );
            return selectedMeasure?.operator as ArithmeticOperatorType;
        },
    );
}

const makeMapStateToProps = () => {
    return createStructuredSelector({
        selectedOperator: createSelectedOperatorSelector(),
    });
};

export const OperatorDropdown = connect<
    IOperatorDropdownStateProps,
    IOperatorDropdownDispatchProps,
    IOperatorDropdownOwnProps,
    IAppState
>(
    makeMapStateToProps,
    mapDispatchToProps,
)(OperatorDropdownBase);

export const OperatorDropdownTest = {
    createSelectedOperatorSelector,
};
