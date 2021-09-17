// (C) 2021 GoodData Corporation
import React from "react";
import { HubspotProvider } from "@aaronhayes/react-use-hubspot-form";

import { Dialog } from "./Dialog";
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
    return (
        <Dialog
            displayCloseButton={true}
            onCancel={props.onClose}
            submitOnEnterKey={false}
            className="conversion-touch-point-dialog s-conversion-touch-point-dialog"
        >
            <HubspotProvider>
                <HubspotConversionTouchPointDialogBase {...props} />
            </HubspotProvider>
        </Dialog>
    );
};
