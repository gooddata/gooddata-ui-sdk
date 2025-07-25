// (C) 2025 GoodData Corporation

import { IntlShape } from "react-intl";
import { AutomationColumnDefinition } from "./types.js";
import {
    IAlertComparisonOperator,
    IAlertRelativeArithmeticOperator,
    IAlertRelativeOperator,
    IAutomationAlert,
} from "@gooddata/sdk-model";
import { messages } from "./messages.js";
import { ARITHMETIC_OPERATORS, COMPARISON_OPERATORS, RELATIVE_OPERATORS } from "./constants.js";

export const getDefaultColumnDefinitions = (): Array<AutomationColumnDefinition> => {
    return [
        { name: "name" },
        { name: "dashboard" },
        { name: "recipients" },
        { name: "lastSent" },
        { name: "menu" },
    ];
};

export const formatDate = (date: string, intl: IntlShape) => {
    const dateObj = new Date(date);

    return intl.formatDate(dateObj, {
        dateStyle: "medium",
        timeStyle: "short",
    });
};

export const buildDashboardUrl = (workspaceId: string, dashboardId: string): string => {
    return `/dashboards/#/workspace/${workspaceId}/dashboard/${dashboardId}`;
};

export const buildAlertSubtitle = (intl: IntlShape, alert?: IAutomationAlert) => {
    if (alert?.condition.type === "relative") {
        const relativeOperatorTitle = getRelativeOperatorTitle(
            alert.condition.operator,
            alert.condition.measure.operator,
            intl,
        )?.toLowerCase();

        return (
            `${alert.condition.measure.left.title} ${relativeOperatorTitle} ${alert.condition.threshold}` +
            `${alert.condition.measure.operator === ARITHMETIC_OPERATORS.ARITHMETIC_OPERATOR_CHANGE ? " %" : ""}`
        );
    }
    if (alert?.condition.type === "comparison") {
        const comparisonOperatorTitle = getComparisonOperatorTitle(
            alert.condition.operator,
            intl,
        )?.toLowerCase();
        return `${alert.condition.left.title} ${comparisonOperatorTitle} ${alert.condition.right}`;
    }
    return "";
};

/**
 * @internal
 */
export const getComparisonOperatorTitle = (operator: IAlertComparisonOperator, intl: IntlShape): string => {
    const titleByOperator: Record<IAlertComparisonOperator, string> = {
        [COMPARISON_OPERATORS.COMPARISON_OPERATOR_LESS_THAN]: messages.comparisonOperatorLessThan.id,
        [COMPARISON_OPERATORS.COMPARISON_OPERATOR_LESS_THAN_OR_EQUAL_TO]:
            messages.comparisonOperatorLessThanOrEquals.id,
        [COMPARISON_OPERATORS.COMPARISON_OPERATOR_GREATER_THAN]: messages.comparisonOperatorGreaterThan.id,
        [COMPARISON_OPERATORS.COMPARISON_OPERATOR_GREATER_THAN_OR_EQUAL_TO]:
            messages.comparisonOperatorGreaterThanOrEquals.id,
    };

    return intl.formatMessage({ id: titleByOperator[operator] });
};

/**
 * @internal
 */
export const getRelativeOperatorTitle = (
    operator: IAlertRelativeOperator,
    art: IAlertRelativeArithmeticOperator,
    intl: IntlShape,
): string => {
    const titleByOperator: Record<`${IAlertRelativeArithmeticOperator}.${IAlertRelativeOperator}`, string> = {
        [`${ARITHMETIC_OPERATORS.ARITHMETIC_OPERATOR_CHANGE}.${RELATIVE_OPERATORS.RELATIVE_OPERATOR_INCREASE_BY}` as const]:
            messages.comparisonOperatorChangeIncreasesBy.id,
        [`${ARITHMETIC_OPERATORS.ARITHMETIC_OPERATOR_CHANGE}.${RELATIVE_OPERATORS.RELATIVE_OPERATOR_DECREASE_BY}` as const]:
            messages.comparisonOperatorChangeDecreasesBy.id,
        [`${ARITHMETIC_OPERATORS.ARITHMETIC_OPERATOR_CHANGE}.${RELATIVE_OPERATORS.RELATIVE_OPERATOR_CHANGES_BY}` as const]:
            messages.comparisonOperatorChangeChangesBy.id,
        [`${ARITHMETIC_OPERATORS.ARITHMETIC_OPERATOR_DIFFERENCE}.${RELATIVE_OPERATORS.RELATIVE_OPERATOR_INCREASE_BY}` as const]:
            messages.comparisonOperatorDifferenceIncreasesBy.id,
        [`${ARITHMETIC_OPERATORS.ARITHMETIC_OPERATOR_DIFFERENCE}.${RELATIVE_OPERATORS.RELATIVE_OPERATOR_DECREASE_BY}` as const]:
            messages.comparisonOperatorDifferenceDecreasesBy.id,
        [`${ARITHMETIC_OPERATORS.ARITHMETIC_OPERATOR_DIFFERENCE}.${RELATIVE_OPERATORS.RELATIVE_OPERATOR_CHANGES_BY}` as const]:
            messages.comparisonOperatorDifferenceChangesBy.id,
    };

    return intl.formatMessage({ id: titleByOperator[`${art}.${operator}`] });
};
