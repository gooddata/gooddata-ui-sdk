// (C) 2021-2023 GoodData Corporation
import React, { useEffect, useState } from "react";
import { useIntl } from "react-intl";
import { useHubspotForm } from "@aaronhayes/react-use-hubspot-form";
import { LoadingComponent } from "@gooddata/sdk-ui";

import { Button } from "../Button/index.js";
import { Typography } from "../Typography/index.js";

declare global {
    interface Window {
        jQuery: object;
        hbspt: undefined | { isSuccessMessageShow: boolean };
    }
}

/**
 * @internal
 */
export interface IHubspotFormField {
    /**
     * Form Field Name
     */
    name: string;

    /**
     * Form Field Value
     */
    value: string | any;

    /**
     * Click action
     */
    click: () => void;
}

/**
 * @internal
 */
export interface IHubspotJqueryFormField {
    [key: string]: ArrayLike<IHubspotFormField> | string;
}

/**
 * @public
 */
export interface IHubspotFormValue {
    [key: string]: string | number | boolean;
}

/**
 * @public
 */
export interface IHubspotConversionTouchPointDialogBaseProps {
    /**
     * Hubspot Portal Id
     */
    hubspotPortalId: string;

    /**
     * Hubspot Form Id
     */
    hubspotFormId: string;

    /**
     * Dialog Title
     */
    dialogTitle?: string;

    /**
     * The value for Cancel button
     */
    cancelButtonText?: string;

    /**
     * Show/Hide Cancel button
     */
    showCancelButton?: boolean;

    /**
     * Populate values for the Hubspot form
     */
    values?: IHubspotFormValue;

    /**
     * Mark the checkbox as checked in the Hubspot form base on this value.
     */
    selectedValue?: string;

    /**
     * The id for html element render the Hubspot form
     */
    targetId?: string;

    /**
     * The custom css class for submit button
     */
    submitButtonClass?: string;

    /**
     * Close dialog action
     */
    onClose: () => void;

    /**
     * Form submitted callback function
     */
    onFormSubmitted?: () => void;
}

/**
 * @internal
 */
export const HubspotConversionTouchPointDialogBase: React.FC<IHubspotConversionTouchPointDialogBaseProps> = (
    props,
) => {
    const {
        targetId,
        hubspotPortalId,
        hubspotFormId,
        selectedValue,
        cancelButtonText,
        dialogTitle,
        showCancelButton,
        submitButtonClass,
        values = {},
        onClose,
        onFormSubmitted,
    } = props;

    const intl = useIntl();
    const [isFormReady, setIsFormReady] = useState(false);
    const hubspotFormTargetId = targetId || "conversion-touch-point-hubspot";

    useEffect(() => {
        // the Hubspot form requires jQuery object, we need to create a fake jQuery object to bypass this.
        window.jQuery =
            window.jQuery ||
            function (nodeOrSelector: string | object) {
                if (typeof nodeOrSelector == "string") {
                    return document.querySelector(nodeOrSelector);
                }
                return nodeOrSelector;
            };
        if (window.hbspt?.isSuccessMessageShow) {
            window.hbspt.isSuccessMessageShow = false;
        }
    }, []);

    const onHubspotFormSubmitted = () => {
        if (!window.hbspt.isSuccessMessageShow) {
            onFormSubmitted?.();
            onClose();
            window.hbspt.isSuccessMessageShow = true;
        }
    };

    const { formCreated } = useHubspotForm({
        portalId: hubspotPortalId,
        formId: hubspotFormId,
        target: `#${hubspotFormTargetId}`,
        locale: intl.locale.split("-").shift() as any,
        submitButtonClass,
        onFormSubmitted: onHubspotFormSubmitted,
        onFormReady: ($form: ArrayLike<IHubspotFormField> | IHubspotJqueryFormField) => {
            setIsFormReady(true);
            let fields: any = $form;
            if (fields["jquery"] && fields[0]?.length > 0) {
                fields = fields[0];
            }
            // populating the values for hidden fields
            for (let i = 0; i < fields.length; i += 1) {
                const inputField = fields[i];
                if (!inputField) {
                    continue;
                }

                const populatedValue = values[inputField.name];

                if (populatedValue) {
                    inputField.value = populatedValue;
                }

                if (selectedValue && inputField.value.indexOf(selectedValue) !== -1) {
                    // Call click event to check the radio button on Hubspot form
                    inputField.click();
                }
            }
        },
    });

    return (
        <>
            {!formCreated ? <LoadingComponent /> : null}
            {formCreated ? (
                <div className="conversion-touch-point-dialog-wrapper">
                    {isFormReady && dialogTitle ? <Typography tagName="h3">{dialogTitle}</Typography> : null}
                    {/* After formCreated, the hubspot form will loaded in #get-in-touch-hubspot div. So it should be there.*/}
                    <div id={hubspotFormTargetId} className="hubspot-form"></div>
                    {/* The hubspot form doesn't include Cancel button. Adding the Cancel button to make Dialog consistent with other dialogs */}
                    {isFormReady && showCancelButton ? (
                        <Button className="gd-button-secondary" onClick={onClose} value={cancelButtonText} />
                    ) : null}
                </div>
            ) : null}
        </>
    );
};
