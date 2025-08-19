// (C) 2021-2025 GoodData Corporation
import React from "react";

import { HubspotProvider } from "@aaronhayes/react-use-hubspot-form";

import { Dialog } from "./Dialog.js";
import {
    HubspotConversionTouchPointDialogBase,
    IHubspotConversionTouchPointDialogBaseProps,
} from "./HubspotConversionTouchPointDialogBase.js";
import { useId } from "../utils/useId.js";

/**
 * @public
 */
export const HubspotConversionTouchPointDialog: React.FC<IHubspotConversionTouchPointDialogBaseProps> = (
    props,
) => {
    const submitButtonClasses = `hs-button primary large ${props.submitButtonClass || "s-hs-submit"}`;

    const onDialogSubmit = () => {
        const submitBtn = document.getElementsByClassName(submitButtonClasses)[0] as HTMLInputElement;
        submitBtn?.click();
    };

    const titleElementId = useId();

    return (
        <Dialog
            displayCloseButton={true}
            onCancel={props.onClose}
            submitOnEnterKey={true}
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
};
