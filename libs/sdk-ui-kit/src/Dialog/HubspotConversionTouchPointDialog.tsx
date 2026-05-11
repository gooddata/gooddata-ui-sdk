// (C) 2021-2026 GoodData Corporation

import { HubspotProvider } from "@aaronhayes/react-use-hubspot-form";

import { useId } from "../utils/useId.js";

import { Dialog } from "./Dialog.js";
import {
    HubspotConversionTouchPointDialogBase,
    type IHubspotConversionTouchPointDialogBaseProps,
} from "./HubspotConversionTouchPointDialogBase.js";

/**
 * @public
 */
export function HubspotConversionTouchPointDialog(props: IHubspotConversionTouchPointDialogBaseProps) {
    const submitButtonClasses = `hs-button primary large ${props.submitButtonClass || "s-hs-submit"}`;

    const onDialogSubmit = () => {
        const submitBtn = document.getElementsByClassName(submitButtonClasses)[0] as HTMLInputElement;
        submitBtn?.click();
    };

    const titleElementId = useId();

    return (
        <Dialog
            displayCloseButton
            onCancel={props.onClose}
            submitOnEnterKey
            onSubmit={onDialogSubmit}
            className="conversion-touch-point-dialog s-conversion-touch-point-dialog"
            accessibilityConfig={{ titleElementId }}
        >
            <HubspotProvider>
                <HubspotConversionTouchPointDialogBase
                    {...props}
                    submitButtonClass={submitButtonClasses}
                    accessibilityConfig={{ titleElementId }}
                />
            </HubspotProvider>
        </Dialog>
    );
}
