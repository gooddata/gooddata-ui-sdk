// (C) 2021 GoodData Corporation
import React from "react";
import { HubspotProvider } from "@aaronhayes/react-use-hubspot-form";

import { Overlay } from "../Overlay";

import { DialogBase } from "./DialogBase";
import {
    HubspotConversionTouchPointDialogBase,
    IHubspotConversionTouchPointDialogBaseProps,
} from "./HubspotConversionTouchPointDialogBase";

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

    return (
        <Overlay
            containerClassName="visible"
            className="gd-conversion-touch-point-overlay"
            isModal={true}
            closeOnOutsideClick={true}
            closeOnEscape={true}
            ignoreClicksOnByClass={[".s-conversion-touch-point-dialog"]}
            onClose={props.onClose}
            positionType="fixed"
        >
            <DialogBase
                displayCloseButton={true}
                onCancel={props.onClose}
                submitOnEnterKey={true}
                onSubmit={onDialogSubmit}
                className="conversion-touch-point-dialog s-conversion-touch-point-dialog"
            >
                <HubspotProvider>
                    <HubspotConversionTouchPointDialogBase
                        {...props}
                        submitButtonClass={submitButtonClasses}
                    />
                </HubspotProvider>
            </DialogBase>
        </Overlay>
    );
};
