// (C) 2026 GoodData Corporation

import { DefaultAutomationDialogActionBar } from "../../shared/slots/DefaultAutomationDialogActionBar.js";
import { type IAutomationDialogActionBarProps } from "../../shared/slots/types.js";
import {
    type IUseScheduledEmailDialogActionBarPropsInput,
    useScheduledEmailDialogActionBarProps,
} from "../state/useScheduledEmailDialogRegionProps.js";

import { WhenScheduledEmailDialogLoaded } from "./WhenScheduledEmailDialogLoaded.js";

/**
 * Props of {@link ScheduledEmailDialogActionBar}: the dialog inputs
 * {@link useScheduledEmailDialogActionBarProps} needs (`onSubmit` and `isSaving` from
 * {@link useSaveScheduledEmailToBackend}, the dialog's `onCancel`, `onDelete` for edit mode) plus any
 * {@link IAutomationDialogActionBarProps} member to override.
 *
 * @alpha
 */
export type IScheduledEmailDialogActionBarBlockProps = IUseScheduledEmailDialogActionBarPropsInput &
    Partial<IAutomationDialogActionBarProps>;

/**
 * The scheduled-export dialog's action bar (documentation link, Delete in edit mode, Cancel, submit),
 * connected to the dialog's state.
 *
 * Renders {@link DefaultAutomationDialogActionBar} with the props of
 * {@link useScheduledEmailDialogActionBarProps}; every override prop replaces the hook's value
 * wholesale. The block does not own the save: pass `handleSaveScheduledEmail` and
 * `isSavingScheduledEmail` from one {@link useSaveScheduledEmailToBackend} instance, so an Enter
 * handler elsewhere in the shell shares it. Renders nothing while
 * `useScheduledEmailDialogContext().isLoading` is true.
 *
 * @example
 * ```tsx
 * const { handleSaveScheduledEmail, isSavingScheduledEmail } = useSaveScheduledEmailToBackend(props);
 * <ScheduledEmailDialogActionBar
 *     onCancel={props.onCancel}
 *     onSubmit={handleSaveScheduledEmail}
 *     isSaving={isSavingScheduledEmail}
 * />;
 * ```
 *
 * @alpha
 */
export function ScheduledEmailDialogActionBar(props: IScheduledEmailDialogActionBarBlockProps) {
    return (
        <WhenScheduledEmailDialogLoaded>
            <ConnectedScheduledEmailDialogActionBar {...props} />
        </WhenScheduledEmailDialogLoaded>
    );
}

function ConnectedScheduledEmailDialogActionBar({
    onCancel,
    onSubmit,
    isSaving,
    onDelete,
    ...overrides
}: IScheduledEmailDialogActionBarBlockProps) {
    const defaultProps = useScheduledEmailDialogActionBarProps({ onCancel, onSubmit, isSaving, onDelete });
    return <DefaultAutomationDialogActionBar {...defaultProps} {...overrides} />;
}
