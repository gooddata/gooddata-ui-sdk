// (C) 2026 GoodData Corporation

import { DefaultAutomationDialogActionBar } from "../../shared/slots/DefaultAutomationDialogActionBar.js";
import { type IAutomationDialogActionBarProps } from "../../shared/slots/types.js";
import {
    type IUseAlertingDialogActionBarPropsInput,
    useAlertingDialogActionBarProps,
} from "../state/useAlertingDialogRegionProps.js";

import { WhenAlertingDialogLoaded } from "./WhenAlertingDialogLoaded.js";

/**
 * Props of {@link AlertingDialogActionBar}: the dialog inputs {@link useAlertingDialogActionBarProps}
 * needs (`onSubmit` and `isSaving` from {@link useAlertSubmit}, the dialog's `onCancel`, `onDelete`
 * for edit mode) plus any {@link IAutomationDialogActionBarProps} member to override.
 *
 * @alpha
 */
export type IAlertingDialogActionBarBlockProps = IUseAlertingDialogActionBarPropsInput &
    Partial<IAutomationDialogActionBarProps>;

/**
 * The alerting dialog's action bar (documentation link, Delete in edit mode, Cancel, submit),
 * connected to the dialog's state.
 *
 * Renders {@link DefaultAutomationDialogActionBar} with the props of
 * {@link useAlertingDialogActionBarProps}; every override prop replaces the hook's value wholesale.
 * The block does not own the submit: pass `submit` and `isSaving` from one {@link useAlertSubmit}
 * instance, so an Enter handler elsewhere in the shell shares its in-flight guard. Renders nothing
 * while `useAlertingDialogContext().isLoading` is true.
 *
 * @example
 * ```tsx
 * const { submit, isSaving } = useAlertSubmit(props);
 * <AlertingDialogActionBar onCancel={props.onCancel} onSubmit={() => void submit()} isSaving={isSaving} />;
 * ```
 *
 * @alpha
 */
export function AlertingDialogActionBar(props: IAlertingDialogActionBarBlockProps) {
    return (
        <WhenAlertingDialogLoaded>
            <ConnectedAlertingDialogActionBar {...props} />
        </WhenAlertingDialogLoaded>
    );
}

function ConnectedAlertingDialogActionBar({
    onCancel,
    onSubmit,
    isSaving,
    onDelete,
    ...overrides
}: IAlertingDialogActionBarBlockProps) {
    const defaultProps = useAlertingDialogActionBarProps({ onCancel, onSubmit, isSaving, onDelete });
    return <DefaultAutomationDialogActionBar {...defaultProps} {...overrides} />;
}
