// (C) 2026 GoodData Corporation

import { type ReactElement } from "react";

import { FormattedMessage } from "react-intl";

import { AutomationDialogFormField } from "../../shared/slots/AutomationDialogFormField.js";
import { DefaultAlertingDialogComparisonPeriod } from "../DefaultAlertingDialog/DefaultAlertingDialogComparisonPeriod.js";
import { useAlertingDialogComparisonPeriodProps } from "../state/useAlertingDialogFieldProps.js";
import { type IAlertingDialogComparisonPeriodProps } from "../types.js";
import { isChangeOrDifferenceOperator } from "../utils/guards.js";

import { WhenAlertingDialogLoaded } from "./WhenAlertingDialogLoaded.js";

/**
 * The alerting dialog's comparison-period field ("Compared to": the period a change or difference
 * condition compares against), connected to the dialog's state and rendered as a labelled form
 * row.
 *
 * Renders {@link DefaultAlertingDialogComparisonPeriod} inside {@link AutomationDialogFormField}
 * with the props of {@link useAlertingDialogComparisonPeriodProps}; every prop passed here
 * replaces the hook's value for that prop wholesale. Renders nothing unless the `alert` prop's
 * condition is a change or difference (only those have a comparison period; the gate reads the
 * prop, so an override is honoured), and nothing while `useAlertingDialogContext().isLoading` is
 * true.
 *
 * @alpha
 */
export function AlertingDialogComparisonPeriod(
    overrides: Partial<IAlertingDialogComparisonPeriodProps>,
): ReactElement {
    return (
        <WhenAlertingDialogLoaded>
            <ConnectedAlertingDialogComparisonPeriod {...overrides} />
        </WhenAlertingDialogLoaded>
    );
}

function ConnectedAlertingDialogComparisonPeriod(overrides: Partial<IAlertingDialogComparisonPeriodProps>) {
    const props = { ...useAlertingDialogComparisonPeriodProps(), ...overrides };
    if (!props.alert || !isChangeOrDifferenceOperator(props.alert.alert)) {
        return null;
    }
    return (
        <AutomationDialogFormField
            label={<FormattedMessage id="insightAlert.config.comparison" />}
            htmlFor={props.id}
        >
            <DefaultAlertingDialogComparisonPeriod {...props} />
        </AutomationDialogFormField>
    );
}
