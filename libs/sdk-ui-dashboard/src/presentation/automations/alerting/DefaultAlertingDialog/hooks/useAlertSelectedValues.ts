// (C) 2026 GoodData Corporation

import {
    type IAutomationMetadataObject,
    type IAutomationMetadataObjectDefinition,
    type INotificationChannelIdentifier,
    type INotificationChannelMetadataObject,
} from "@gooddata/sdk-model";

import { type AlertAttribute, type AlertMetric } from "../../types.js";
import {
    getAlertAiOperator,
    getAlertAttribute,
    getAlertCompareOperator,
    getAlertComparison,
    getAlertGranularity,
    getAlertMeasure,
    getAlertRelativeOperator,
    getAlertSensitivity,
} from "../utils/getters.js";

/**
 * Props for {@link useAlertSelectedValues}.
 * @internal
 */
export interface IUseAlertSelectedValuesProps {
    editedAutomation: IAutomationMetadataObjectDefinition | undefined;
    supportedMeasures: AlertMetric[];
    supportedAttributes: AlertAttribute[];
    notificationChannels: INotificationChannelIdentifier[] | INotificationChannelMetadataObject[];
}

/**
 * Pure selector hook that derives the currently-selected values from the edited automation draft.
 *
 * No memoization is intentionally added — values are recomputed on every render to preserve the
 * referential behaviour of the original inline code in `useEditAlert` (the returned objects flow
 * into `useCallback` dep arrays and `useThresholdValue` args; memoizing them would be a behaviour
 * change, not an optimisation).  The hook therefore contains no internal React hooks.
 *
 * @internal
 */
export function useAlertSelectedValues({
    editedAutomation,
    supportedMeasures,
    supportedAttributes,
    notificationChannels,
}: IUseAlertSelectedValuesProps): {
    selectedMeasure: ReturnType<typeof getAlertMeasure>;
    selectedComparisonOperator: ReturnType<typeof getAlertCompareOperator>;
    selectedRelativeOperator: ReturnType<typeof getAlertRelativeOperator>;
    selectedAiOperator: ReturnType<typeof getAlertAiOperator>;
    selectedComparator: ReturnType<typeof getAlertComparison>;
    selectedSensitivity: ReturnType<typeof getAlertSensitivity>;
    selectedGranularity: ReturnType<typeof getAlertGranularity>;
    selectedAttribute: AlertAttribute | undefined;
    selectedValue: string | null | undefined;
    selectedNotificationChannel:
        | (INotificationChannelIdentifier | INotificationChannelMetadataObject)
        | undefined;
    allowExternalRecipients: boolean;
    allowOnlyLoggedUserRecipients: boolean;
} {
    const selectedMeasure = getAlertMeasure(supportedMeasures, editedAutomation?.alert);
    const selectedComparisonOperator = getAlertCompareOperator(editedAutomation?.alert);
    const selectedRelativeOperator = getAlertRelativeOperator(editedAutomation?.alert);
    const selectedAiOperator = getAlertAiOperator(editedAutomation?.alert);
    const selectedComparator = getAlertComparison(selectedMeasure, editedAutomation?.alert);
    const selectedSensitivity = getAlertSensitivity(editedAutomation?.alert);
    const selectedGranularity = getAlertGranularity(editedAutomation?.alert);
    const [selectedAttribute, selectedValue] = getAlertAttribute(
        supportedAttributes,
        editedAutomation as IAutomationMetadataObject,
    );

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
