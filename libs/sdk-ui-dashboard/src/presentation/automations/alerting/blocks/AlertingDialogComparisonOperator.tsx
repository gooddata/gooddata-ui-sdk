// (C) 2026 GoodData Corporation

import { type ReactElement } from "react";

import { FormattedMessage } from "react-intl";

import { AutomationDialogFormField } from "../../shared/slots/AutomationDialogFormField.js";
import { DefaultAlertingDialogComparisonOperator } from "../DefaultAlertingDialog/DefaultAlertingDialogComparisonOperator.js";
import { useAlertingDialogComparisonOperatorProps } from "../state/useAlertingDialogFieldProps.js";
import { type IAlertingDialogComparisonOperatorProps } from "../types.js";

import { WhenAlertingDialogLoaded } from "./WhenAlertingDialogLoaded.js";

/**
 * The alerting dialog's condition field ("Condition": the operator — fixed threshold, change,
 * difference or anomaly detection), connected to the dialog's state and rendered as a labelled
 * form row.
 *
 * Renders {@link DefaultAlertingDialogComparisonOperator} inside {@link AutomationDialogFormField}
 * with the props of {@link useAlertingDialogComparisonOperatorProps}; every prop passed here
 * replaces the hook's value for that prop wholesale. Pass `enableAnomalyDetectionAlert={false}` to
 * hide the anomaly-detection options. Renders nothing while
 * `useAlertingDialogContext().isLoading` is true.
 *
 * @example
 * ```tsx
 * <AlertingDialogComparisonOperator enableAnomalyDetectionAlert={false} />
 * ```
 *
 * @alpha
 */
export function AlertingDialogComparisonOperator(
    overrides: Partial<IAlertingDialogComparisonOperatorProps>,
): ReactElement {
    return (
        <WhenAlertingDialogLoaded>
            <ConnectedAlertingDialogComparisonOperator {...overrides} />
        </WhenAlertingDialogLoaded>
    );
}

function ConnectedAlertingDialogComparisonOperator(
    overrides: Partial<IAlertingDialogComparisonOperatorProps>,
) {
    const props = { ...useAlertingDialogComparisonOperatorProps(), ...overrides };
    return (
        <AutomationDialogFormField
            label={<FormattedMessage id="insightAlert.config.condition" />}
            htmlFor={props.id}
        >
            <DefaultAlertingDialogComparisonOperator {...props} />
        </AutomationDialogFormField>
    );
}
