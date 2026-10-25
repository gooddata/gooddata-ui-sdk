// (C) 2019-2026 GoodData Corporation

import { createAction } from "@reduxjs/toolkit";

import { ActionTypeKeys } from "../../constants/actions.js";
import { type ArithmeticOperatorType } from "../../typings/arithmetic_measure.js";

/**
 * These type keys live in the global ActionTypeKeys enum because the time-travel whitelist matches
 * on them there, so their values must not change.
 */
export const addArithmeticMeasure = createAction(
    ActionTypeKeys.UI_ADD_ARITHMETIC_MEASURE,
    (bucketLocalIdentifier: string) => ({ payload: { bucketLocalIdentifier } }),
);

export const selectArithmeticMeasureOperand = createAction(
    ActionTypeKeys.UI_SELECT_ARITHMETIC_MEASURE_OPERAND,
    (
        measureLocalIdentifier: string,
        operandIndex: number,
        selectedOperandMeasureLocalIdentifier: string,
    ) => ({
        payload: {
            measureLocalIdentifier,
            operandIndex,
            selectedOperandMeasureLocalIdentifier,
        },
    }),
);

export const selectArithmeticMeasureOperator = createAction(
    ActionTypeKeys.UI_SELECT_ARITHMETIC_MEASURE_OPERATOR,
    (measureLocalIdentifier: string, operator: ArithmeticOperatorType) => ({
        payload: {
            measureLocalIdentifier,
            operator,
        },
    }),
);

export const storeAddArithmeticMeasure = createAction(
    ActionTypeKeys.STORE_ADD_ARITHMETIC_MEASURE,
    (bucketLocalIdentifier: string) => ({ payload: { bucketLocalIdentifier } }),
);

export const storeSelectArithmeticMeasureOperand = createAction(
    ActionTypeKeys.STORE_SELECT_ARITHMETIC_MEASURE_OPERAND,
    (
        measureLocalIdentifier: string,
        operandIndex: number,
        selectedOperandMeasureLocalIdentifier: string,
    ) => ({
        payload: {
            measureLocalIdentifier,
            operandIndex,
            selectedOperandMeasureLocalIdentifier,
        },
    }),
);

export const storeSelectArithmeticMeasureOperator = createAction(
    ActionTypeKeys.STORE_SELECT_ARITHMETIC_MEASURE_OPERATOR,
    (measureLocalIdentifier: string, operator: ArithmeticOperatorType) => ({
        payload: {
            measureLocalIdentifier,
            operator,
        },
    }),
);
