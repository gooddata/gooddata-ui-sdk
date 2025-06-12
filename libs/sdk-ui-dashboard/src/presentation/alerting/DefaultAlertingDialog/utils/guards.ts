// (C) 2022-2025 GoodData Corporation
import { IAutomationAlert, IAutomationMetadataObject } from "@gooddata/sdk-model";

import { ARITHMETIC_OPERATORS } from "../constants.js";

/**
 * @internal
 */
export function isChangeOperator(alert?: IAutomationAlert): boolean {
    if (alert?.condition?.type === "relative") {
        return alert.condition.measure.operator === ARITHMETIC_OPERATORS.ARITHMETIC_OPERATOR_CHANGE;
    }
    return false;
}

/**
 * @internal
 */
export function isDifferenceOperator(alert?: IAutomationAlert): boolean {
    if (alert?.condition?.type === "relative") {
        return alert.condition.measure.operator === ARITHMETIC_OPERATORS.ARITHMETIC_OPERATOR_DIFFERENCE;
    }
    return false;
}

/**
 * @internal
 */
export function isChangeOrDifferenceOperator(alert?: IAutomationAlert): boolean {
    return isChangeOperator(alert) || isDifferenceOperator(alert);
}

/**
 * @internal
 */
export function isAlertValueDefined(alert?: IAutomationAlert): boolean {
    if (alert?.condition?.type === "relative") {
        return typeof alert.condition.threshold !== "undefined";
    }
    return typeof alert?.condition?.right !== "undefined";
}

/**
 * @internal
 */
export function isAlertRecipientsValid(alert?: IAutomationMetadataObject): boolean {
    return !!alert?.recipients?.length;
}
