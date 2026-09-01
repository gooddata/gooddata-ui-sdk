// (C) 2026 GoodData Corporation

import { type ReactElement } from "react";

import { type IScheduledEmailDialogSubjectProps } from "../../types.js";

import { SubjectForm } from "./SubjectForm/SubjectForm.js";

/**
 * Default render of the scheduled-export dialog's subject field.
 * Props-driven — reads no context. The default dialog and {@link ScheduledEmailDialogSubject}
 * render it with {@link useScheduledEmailDialogSubjectProps}.
 *
 * @alpha
 */
export function DefaultScheduledEmailDialogSubject(props: IScheduledEmailDialogSubjectProps): ReactElement {
    return <SubjectForm {...props} />;
}
