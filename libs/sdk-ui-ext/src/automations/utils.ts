// (C) 2025 GoodData Corporation

import { IntlShape } from "react-intl";

import {
    IAlertComparisonOperator,
    IAlertRelativeArithmeticOperator,
    IAlertRelativeOperator,
    IAutomationMetadataObject,
} from "@gooddata/sdk-model";

import { ARITHMETIC_OPERATORS, COMPARISON_OPERATORS, RELATIVE_OPERATORS } from "./constants.js";
import { messages } from "./messages.js";
import {
    AutomationColumnDefinition,
    IAutomationUrlBuilder,
    IDashboardUrlBuilder,
    IWidgetUrlBuilder,
} from "./types.js";

export const getDefaultColumnDefinitions = (): Array<AutomationColumnDefinition> => {
    return [
        { name: "title" },
        { name: "dashboard" },
        { name: "recipients" },
        { name: "lastRun" },
        { name: "menu" },
    ];
};

export const defaultDashboardUrlBuilder: IDashboardUrlBuilder = (
    workspaceId: string,
    dashboardId: string,
) => {
    if (!workspaceId || !dashboardId) {
        return "";
    }
    return `/dashboards/#/workspace/${workspaceId}/dashboard/${dashboardId}`;
};

export const defaultWidgetUrlBuilder: IWidgetUrlBuilder = (
    workspaceId: string,
    dashboardId: string,
    widgetId: string,
) => {
    if (!workspaceId || !dashboardId || !widgetId) {
        return "";
    }
    return `${defaultDashboardUrlBuilder(workspaceId, dashboardId)}?widgetId=${widgetId}`;
};

const defaultAutomationUrlBuilder: IAutomationUrlBuilder = (
    workspaceId: string,
    dashboardId: string,
    automationId: string,
) => {
    if (!workspaceId || !dashboardId || !automationId) {
        return "";
    }
    return `${defaultDashboardUrlBuilder(workspaceId, dashboardId)}?automationId=${automationId}&openAutomationOnLoad=true`;
};

export const defaultEditAutomation = (
    automation: IAutomationMetadataObject,
    workspaceId: string,
    dashboardId: string,
) => {
    navigate(defaultAutomationUrlBuilder(workspaceId, dashboardId, automation.id));
};

export const navigate = (url: string) => {
    if (!url || url.length === 0) {
        return;
    }
    window.location.href = url;
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
