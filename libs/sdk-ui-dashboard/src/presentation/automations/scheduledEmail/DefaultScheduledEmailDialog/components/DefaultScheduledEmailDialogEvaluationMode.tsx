// (C) 2026 GoodData Corporation

import { type ReactElement } from "react";

import { type IScheduledEmailDialogEvaluationModeProps } from "../../types.js";

import { EvaluationModeCheckbox } from "./EvaluationModeCheckbox/EvaluationModeCheckbox.js";

/**
 * Default render of the scheduled-export dialog's evaluation-mode field.
 * Props-driven — reads no context. The default dialog and {@link ScheduledEmailDialogEvaluationMode}
 * render it with {@link useScheduledEmailDialogEvaluationModeProps}.
 *
 * @alpha
 */
export function DefaultScheduledEmailDialogEvaluationMode(
    props: IScheduledEmailDialogEvaluationModeProps,
): ReactElement {
    return <EvaluationModeCheckbox {...props} />;
}
