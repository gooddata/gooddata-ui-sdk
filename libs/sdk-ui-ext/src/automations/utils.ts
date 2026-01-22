// (C) 2025-2026 GoodData Corporation

import { CronExpressionParser } from "cron-parser";
import { type IntlShape } from "react-intl";

import {
    type IAlertAnomalyDetectionGranularity,
    type IAlertAnomalyDetectionSensitivity,
    type IAlertComparisonOperator,
    type IAlertRelativeArithmeticOperator,
    type IAlertRelativeOperator,
    type IAutomationMetadataObject,
    type IAutomationRecipient,
    type IExportDefinitionMetadataObject,
} from "@gooddata/sdk-model";
import { ErrorCodes, buildAutomationUrl, convertError, navigate } from "@gooddata/sdk-ui";

import { ARITHMETIC_OPERATORS, COMPARISON_OPERATORS, RELATIVE_OPERATORS } from "./constants.js";
import { messages } from "./messages.js";
import { type AutomationsType } from "./types.js";

export const getWorkspaceId = (
    automation: IAutomationMetadataObject,
    fallbackWorkspaceId: string | undefined,
) => {
    return automation.workspace?.id ?? fallbackWorkspaceId;
};

export const defaultEditAutomation = (
    automation: IAutomationMetadataObject,
    workspaceId: string | undefined,
    dashboardId: string | undefined,
) => {
    const targetWorkspaceId = getWorkspaceId(automation, workspaceId);
    navigate(
        buildAutomationUrl({
            workspaceId: targetWorkspaceId,
            dashboardId,
            automationId: automation.id,
        }),
    );
};

const trimString = (value: string | undefined): string | undefined => {
    const trimmed = value?.trim();
    return trimmed || undefined;
};

export const getRecipientName = (recipient: IAutomationRecipient): string =>
    trimString(recipient.name) ||
    ("email" in recipient ? trimString(recipient.email) : undefined) ||
    trimString(recipient.id) ||
    "";

export const getNextRunFromCron = (cron: string | undefined) => {
    if (!cron) {
        return undefined;
    }
    return CronExpressionParser.parse(cron).next().toDate().toISOString();
};

export const getFirstAutomationExportDefinition = (
    automation: IAutomationMetadataObject,
): IExportDefinitionMetadataObject | undefined => {
    if (automation.exportDefinitions?.length) {
        return automation.exportDefinitions[0];
    }
    return undefined;
};
export const getWidgetId = (automation: IAutomationMetadataObject, type: AutomationsType): string => {
    if (type === "schedule") {
        const exportDefinition = getFirstAutomationExportDefinition(automation);
        if (exportDefinition?.requestPayload?.type === "visualizationObject") {
            return exportDefinition?.requestPayload?.content?.widget ?? "";
        }
        return "";
    }
    return automation?.metadata?.widget ?? "";
};

export const getWidgetName = (automation: IAutomationMetadataObject, type: AutomationsType): string => {
    if (type === "schedule") {
        const exportDefinition = getFirstAutomationExportDefinition(automation);
        if (exportDefinition?.requestPayload?.type === "visualizationObject") {
            return exportDefinition?.title ?? "";
        }
        return "";
    }
    return automation?.details?.widgetName ?? "";
};

export const isRequestHeaderTooLargeError = (error: unknown): boolean => {
    const sdkError = convertError(error);
    if (sdkError.getMessage() === ErrorCodes.HEADERS_TOO_LARGE) {
        return true;
    }
    return error instanceof Error && error.message === ErrorCodes.HEADERS_TOO_LARGE;
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

export function getAnomalyDetectionOperatorTitle(
    title: string,
    _sensitivity: IAlertAnomalyDetectionSensitivity,
    _granularity: IAlertAnomalyDetectionGranularity,
    intl: IntlShape,
): string {
    return [title, intl.formatMessage({ id: messages.anomalyDetectionOperator.id })].join(" ");
}

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
