// (C) 2026 GoodData Corporation

import { forwardRef } from "react";

import { DefaultAlertingDialogHeader } from "../DefaultAlertingDialog/DefaultAlertingDialogHeader.js";
import { useAlertingDialogHeaderProps } from "../state/useAlertingDialogRegionProps.js";
import { type IAlertingDialogHeaderProps } from "../types.js";

import { WhenAlertingDialogLoaded } from "./WhenAlertingDialogLoaded.js";

/**
 * The alerting dialog's header region (the title input row), connected to the dialog's state.
 *
 * Renders {@link DefaultAlertingDialogHeader} with the props of {@link useAlertingDialogHeaderProps}.
 * Every prop passed here replaces the hook's value for that prop wholesale; pass the dialog's
 * `onCancel` so the back button closes the dialog, and `ref` to receive the title input. Renders
 * nothing while `useAlertingDialogContext().isLoading` is true.
 *
 * @example
 * ```tsx
 * function MyAlertingDialog(props: IAlertingDialogProps) {
 *     return (
 *         <MyShell onClose={props.onCancel}>
 *             <AlertingDialogHeader onCancel={props.onCancel} />
 *             <AlertingDialogFilters />
 *         </MyShell>
 *     );
 * }
 * <Dashboard AlertingDialogComponent={MyAlertingDialog} />;
 * ```
 *
 * @alpha
 */
export const AlertingDialogHeader = forwardRef<HTMLInputElement, Partial<IAlertingDialogHeaderProps>>(
    function AlertingDialogHeader(props, ref) {
        return (
            <WhenAlertingDialogLoaded>
                <ConnectedAlertingDialogHeader {...props} ref={ref} />
            </WhenAlertingDialogLoaded>
        );
    },
);

const ConnectedAlertingDialogHeader = forwardRef<HTMLInputElement, Partial<IAlertingDialogHeaderProps>>(
    function ConnectedAlertingDialogHeader({ onCancel, ...overrides }, ref) {
        const defaultProps = useAlertingDialogHeaderProps({ onCancel, ref });
        return <DefaultAlertingDialogHeader {...defaultProps} {...overrides} />;
    },
);
