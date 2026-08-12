// (C) 2026 GoodData Corporation

import {
    type IAutomationMetadataObjectDefinition,
    type INotificationChannelIdentifier,
    type INotificationChannelMetadataObject,
} from "@gooddata/sdk-model";

import { useAlertingDialogContext } from "../../contexts/AlertingDialogContext.js";
import {
    getAlertAiOperator,
    getAlertAttribute,
    getAlertCompareOperator,
    getAlertComparison,
    getAlertGranularity,
    getAlertMeasure,
    getAlertRelativeOperator,
    getAlertSensitivity,
} from "../DefaultAlertingDialog/utils/getters.js";
import { type AlertAttribute, type AlertMetric } from "../types.js";

import { useAlertData } from "./AlertDataContext.js";
import { useAlertDraft } from "./AlertDraftContext.js";

/**
 * Props for {@link getAlertSelectedValues}.
 * @internal
 */
export interface IGetAlertSelectedValuesProps {
    editedAutomation: IAutomationMetadataObjectDefinition | undefined;
    supportedMeasures: AlertMetric[];
    supportedAttributes: AlertAttribute[];
    notificationChannels: INotificationChannelIdentifier[] | INotificationChannelMetadataObject[];
}

/**
 * Derives the currently-selected form values from the edited alert draft.
 *
 * Deliberately unmemoized. The returned objects flow into `useCallback` dependency arrays and
 * `useThresholdValue` arguments, so recomputing them every render is what keeps those consumers
 * behaving correctly — memoizing here would be a behaviour change, not an optimisation. The
 * function therefore calls no React hooks of its own.
 *
 * @internal
 */
export function getAlertSelectedValues({
    editedAutomation,
    supportedMeasures,
    supportedAttributes,
    notificationChannels,
}: IGetAlertSelectedValuesProps) {
    const selectedMeasure = getAlertMeasure(supportedMeasures, editedAutomation?.alert);
    const selectedComparisonOperator = getAlertCompareOperator(editedAutomation?.alert);
    const selectedRelativeOperator = getAlertRelativeOperator(editedAutomation?.alert);
    const selectedAiOperator = getAlertAiOperator(editedAutomation?.alert);
    const selectedComparator = getAlertComparison(selectedMeasure, editedAutomation?.alert);
    const selectedSensitivity = getAlertSensitivity(editedAutomation?.alert);
    const selectedGranularity = getAlertGranularity(editedAutomation?.alert);
    const [selectedAttribute, selectedValue] = getAlertAttribute(supportedAttributes, editedAutomation);

    const selectedNotificationChannel = notificationChannels.find(
        (channel) => channel.id === editedAutomation?.notificationChannel,
    );

    const allowExternalRecipients = selectedNotificationChannel?.allowedRecipients === "external";
    const allowOnlyLoggedUserRecipients = selectedNotificationChannel?.allowedRecipients === "creator";

    return {
        selectedMeasure,
        selectedComparisonOperator,
        selectedRelativeOperator,
        selectedAiOperator,
        selectedComparator,
        selectedSensitivity,
        selectedGranularity,
        selectedAttribute,
        selectedValue,
        selectedNotificationChannel,
        allowExternalRecipients,
        allowOnlyLoggedUserRecipients,
    };
}

/**
 * Reads the currently-selected form values for the alerting dialog.
 *
 * Derived per consumer rather than published on a context: the returned objects flow into
 * `useCallback` dependency arrays and `useAlertThreshold` arguments, so recomputing them every
 * render is what keeps those consumers behaving correctly.
 *
 * @internal
 */
export function useAlertSelectedValues(): ReturnType<typeof getAlertSelectedValues> {
    const { editedAutomation } = useAlertDraft();
    const { supportedMeasures, supportedAttributes } = useAlertData();
    const { notificationChannels } = useAlertingDialogContext();

    return getAlertSelectedValues({
        editedAutomation,
        supportedMeasures,
        supportedAttributes,
        notificationChannels,
    });
}
