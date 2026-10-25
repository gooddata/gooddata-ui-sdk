// (C) 2026 GoodData Corporation

import { createAction } from "@reduxjs/toolkit";

import {
    type IArithmeticMeasureAddResult,
    type IArithmeticMeasureOperandResult,
    type IArithmeticMeasureOperatorResult,
} from "./arithmetic_measures_operations.js";

/**
 * THE SEMANTIC EVENTS OF THE ARITHMETIC-MEASURE FAMILY — same contract as
 * `buckets_operation_events.ts`: the payload is the operation's RESULT, carried unconditionally,
 * unchanged values arriving by reference. The type strings are NEW and stay out of the
 * frozen `ActionTypeKeys` enum; deliberately NOT undoable — time travel keys on the
 * `UI_*_ARITHMETIC_MEASURE_*` triggers, which still reach the store first.
 */
export enum ArithmeticMeasuresOperationActionTypeKeys {
    STORE_ARITHMETIC_MEASURE_ADDED = "STORE/ARITHMETIC_MEASURES/MEASURE_ADDED",
    STORE_ARITHMETIC_MEASURE_OPERAND_SELECTED = "STORE/ARITHMETIC_MEASURES/OPERAND_SELECTED",
    STORE_ARITHMETIC_MEASURE_OPERATOR_SELECTED = "STORE/ARITHMETIC_MEASURES/OPERATOR_SELECTED",
}

/**
 * A fresh (operand-less) arithmetic measure joined the named bucket and its measure slot expanded
 * (`STORE_ADD_ARITHMETIC_MEASURE`). Not committed at all for fewer than two measures.
 */
export const arithmeticMeasureAdded = createAction(
    ArithmeticMeasuresOperationActionTypeKeys.STORE_ARITHMETIC_MEASURE_ADDED,
    (payload: IArithmeticMeasureAddResult) => ({ payload }),
);

/**
 * One operand slot of an arithmetic measure was pointed at a measure
 * (`STORE_SELECT_ARITHMETIC_MEASURE_OPERAND`) — the widest of the three: a derived operand runs
 * the removal chain, a completed pair can queue a derived measure for the plug viz.
 */
export const arithmeticMeasureOperandSelected = createAction(
    ArithmeticMeasuresOperationActionTypeKeys.STORE_ARITHMETIC_MEASURE_OPERAND_SELECTED,
    (payload: IArithmeticMeasureOperandResult) => ({ payload }),
);

/** The measure's operator changed and its format followed (`STORE_SELECT_ARITHMETIC_MEASURE_OPERATOR`). */
export const arithmeticMeasureOperatorSelected = createAction(
    ArithmeticMeasuresOperationActionTypeKeys.STORE_ARITHMETIC_MEASURE_OPERATOR_SELECTED,
    (payload: IArithmeticMeasureOperatorResult) => ({ payload }),
);
