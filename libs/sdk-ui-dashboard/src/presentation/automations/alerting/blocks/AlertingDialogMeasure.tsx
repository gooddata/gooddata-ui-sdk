// (C) 2026 GoodData Corporation

import { type ReactElement } from "react";

import { FormattedMessage } from "react-intl";

import { AutomationDialogFormField } from "../../shared/slots/AutomationDialogFormField.js";
import { DefaultAlertingDialogMeasure } from "../DefaultAlertingDialog/DefaultAlertingDialogMeasure.js";
import { useAlertingDialogMeasureProps } from "../state/useAlertingDialogFieldProps.js";
import { type IAlertingDialogMeasureProps } from "../types.js";

import { WhenAlertingDialogLoaded } from "./WhenAlertingDialogLoaded.js";

/**
 * The alerting dialog's measure field ("Metric": the measure the condition targets), connected to
 * the dialog's state and rendered as a labelled form row.
 *
 * Renders {@link DefaultAlertingDialogMeasure} inside {@link AutomationDialogFormField} with the
 * props of {@link useAlertingDialogMeasureProps}; every prop passed here replaces the hook's value
 * for that prop wholesale. Renders nothing while `useAlertingDialogContext().isLoading` is true.
 * The row's label is the default dialog's — a shell that wants its own label renders the hook and
 * the render component inside its own `AutomationDialogFormField`.
 *
 * @example
 * ```tsx
 * function MyAlertingDialog(props: IAlertingDialogProps) {
 *     return (
 *         <MyShell onClose={props.onCancel}>
 *             <AlertingDialogMeasure />
 *             <AlertingDialogComparisonOperator />
 *             <AlertingDialogThreshold />
 *         </MyShell>
 *     );
 * }
 * <Dashboard AlertingDialogComponent={MyAlertingDialog} />;
 * ```
 *
 * @alpha
 */
export function AlertingDialogMeasure(overrides: Partial<IAlertingDialogMeasureProps>): ReactElement {
    return (
        <WhenAlertingDialogLoaded>
            <ConnectedAlertingDialogMeasure {...overrides} />
        </WhenAlertingDialogLoaded>
    );
}

function ConnectedAlertingDialogMeasure(overrides: Partial<IAlertingDialogMeasureProps>) {
    const props = { ...useAlertingDialogMeasureProps(), ...overrides };
    return (
        <AutomationDialogFormField
            label={<FormattedMessage id="insightAlert.config.metric" />}
            htmlFor={props.id}
        >
            <DefaultAlertingDialogMeasure {...props} />
        </AutomationDialogFormField>
    );
}
