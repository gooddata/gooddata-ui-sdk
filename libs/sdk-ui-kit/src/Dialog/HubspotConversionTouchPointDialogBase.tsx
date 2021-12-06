// (C) 2021 GoodData Corporation
import React, { useEffect, useState } from "react";
import { useIntl } from "react-intl";
import { useHubspotForm } from "@aaronhayes/react-use-hubspot-form";
import { LoadingComponent } from "@gooddata/sdk-ui";

import { Button } from "../Button";

declare global {
    interface Window {
        jQuery: object;
        hbspt: undefined | { isSuccessMessageShow: boolean; commentValue: string };
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

    /**
     * Allow to close dialog after submit or not
     */
    shouldCloseDialogAfterSubmit?: boolean;
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
        shouldCloseDialogAfterSubmit = true,
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
        if (window.hbspt) {
            window.hbspt = {
                ...window.hbspt,
                commentValue: "",
                isSuccessMessageShow: false,
            };
        }
    }, [targetId]);

    const onHubspotFormSubmitted = () => {
        if (!window.hbspt.isSuccessMessageShow) {
            onFormSubmitted?.();
            if (shouldCloseDialogAfterSubmit) {
                onClose();
            }
            window.hbspt.isSuccessMessageShow = true;
        }
    };

    const getListInputFields = ($form: ArrayLike<IHubspotFormField> | IHubspotJqueryFormField) => {
        if ($form["jquery"] && $form[0]?.length > 0) {
            return $form[0];
        }
        return $form;
    };

    const { formCreated } = useHubspotForm({
        portalId: hubspotPortalId,
        formId: hubspotFormId,
        target: `#${hubspotFormTargetId}`,
        locale: intl.locale.split("-").shift() as any,
        submitButtonClass,
        onFormSubmitted: onHubspotFormSubmitted,
        onFormSubmit: ($form: ArrayLike<IHubspotFormField> | IHubspotJqueryFormField) => {
            const fields = getListInputFields($form);
            // assign the global comment value to the comment field.
            if (window.hbspt.commentValue) {
                for (let i = 0; i < fields.length; i += 1) {
                    const commentField = fields[i];
                    if (commentField?.name === "comment__c") {
                        commentField.value = window.hbspt.commentValue;
                        break;
                    }
                }
            }
        },
        onFormReady: ($form: ArrayLike<IHubspotFormField> | IHubspotJqueryFormField) => {
            setIsFormReady(true);
            const fields = getListInputFields($form);

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
            {!formCreated && <LoadingComponent />}
            {formCreated && (
                <div className="conversion-touch-point-dialog-wrapper">
                    {isFormReady && dialogTitle && <h3>{dialogTitle}</h3>}
                    {/* After formCreated, the hubspot form will loaded in #get-in-touch-hubspot div. So it should be there.*/}
                    <div id={hubspotFormTargetId} className="hubspot-form"></div>
                    {/* The hubspot form doesn't include Cancel button. Adding the Cancel button to make Dialog consistent with other dialogs */}
                    {isFormReady && showCancelButton && (
                        <Button className="gd-button-secondary" onClick={onClose} value={cancelButtonText} />
                    )}
                </div>
            )}
        </>
    );
};
