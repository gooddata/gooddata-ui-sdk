// (C) 2026 GoodData Corporation

import { type ReactElement } from "react";

import { useAutomationsContext } from "../../contexts/AutomationsContext.js";
import { DefaultScheduledEmailDialogEvaluationMode } from "../DefaultScheduledEmailDialog/components/DefaultScheduledEmailDialogEvaluationMode.js";
import { useScheduledEmailDialogEvaluationModeProps } from "../state/useScheduledEmailDialogFieldProps.js";
import { type IScheduledEmailDialogEvaluationModeProps } from "../types.js";

import { WhenScheduledEmailDialogLoaded } from "./WhenScheduledEmailDialogLoaded.js";

/**
 * The scheduled-export dialog's evaluation-mode checkbox, connected to the dialog's state.
 *
 * Renders {@link DefaultScheduledEmailDialogEvaluationMode} with the props of
 * {@link useScheduledEmailDialogEvaluationModeProps}; every prop passed here replaces the hook's
 * value for that prop wholesale. Renders nothing while
 * `useScheduledEmailDialogContext().isLoading` is true and while
 * `useAutomationsContext().features.enableAutomationEvaluationMode` is off, the same visibility the
 * default dialog gives the field.
 *
 * @alpha
 */
export function ScheduledEmailDialogEvaluationMode(
    props: Partial<IScheduledEmailDialogEvaluationModeProps>,
): ReactElement {
    return (
        <WhenScheduledEmailDialogLoaded>
            <ConnectedScheduledEmailDialogEvaluationMode {...props} />
        </WhenScheduledEmailDialogLoaded>
    );
}

function ConnectedScheduledEmailDialogEvaluationMode(
    overrides: Partial<IScheduledEmailDialogEvaluationModeProps>,
) {
    const defaultProps = useScheduledEmailDialogEvaluationModeProps();
    const {
        features: { enableAutomationEvaluationMode },
    } = useAutomationsContext();
    if (!enableAutomationEvaluationMode) {
        return null;
    }
    return <DefaultScheduledEmailDialogEvaluationMode {...defaultProps} {...overrides} />;
}
