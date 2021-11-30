// (C) 2021 GoodData Corporation
import React, { useState, useCallback } from "react";
import { HubspotProvider } from "@aaronhayes/react-use-hubspot-form";
import { FormattedHTMLMessage, useIntl } from "react-intl";

import { Overlay } from "../Overlay";
import { Button } from "../Button";

import { DialogBase } from "./DialogBase";
import {
    HubspotConversionTouchPointDialogBase,
    IHubspotConversionTouchPointDialogBaseProps,
} from "./HubspotConversionTouchPointDialogBase";

enum PLATFORM_EDITION_VALUES {
    GROWTH = "Growth",
    ENTERPRISE = "Enterprise",
}

/**
 * @public
 */
export interface IGoodDataPricingPlansDialogProps {
    /**
     * Hubspot Portal Id
     */
    hubspotPortalId: string;

    /**
     * Hubspot Form Id
     */
    hubspotFormId: string;

    /**
     * Populate values for the Hubspot form
     */
    values?: { [key: string]: string | number | boolean };

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
 * @public
 */
export const GoodDataPricingPlansDialog: React.FC<IGoodDataPricingPlansDialogProps> = (props) => {
    const DEFAULT_SELECTED_OPTION = "Ask about pricing";
    const submitButtonClasses = "hs-button primary large s-hs-submit";

    const [isGrowthSubmitted, setIsGrowthSubmitted] = useState(false);
    const [isEnterpriseSubmitted, setIsEnterpriseSubmitted] = useState(false);
    const [shouldReloadHubspotForm, setReloadHubspotForm] = useState(false);
    const intl = useIntl();

    const onPlanSubmit = (planName: PLATFORM_EDITION_VALUES) => {
        const submitBtn = document.getElementsByClassName(submitButtonClasses)[0] as HTMLInputElement;
        if (submitBtn) {
            // Set the global comment value
            window.hbspt.commentValue = planName;
            submitBtn.click();
        }
    };

    const handleGrowthButtonClick = () => {
        if (!shouldReloadHubspotForm) {
            onPlanSubmit(PLATFORM_EDITION_VALUES.GROWTH);
            setIsGrowthSubmitted(true);
        }
    };

    const handleEnterpriseButtonClick = () => {
        if (!shouldReloadHubspotForm) {
            onPlanSubmit(PLATFORM_EDITION_VALUES.ENTERPRISE);
            setIsEnterpriseSubmitted(true);
        }
    };

    const onDialogSubmit = () => {
        if (isGrowthSubmitted && isEnterpriseSubmitted) {
            props.onClose?.();
        } else if (isGrowthSubmitted) {
            handleEnterpriseButtonClick();
        } else {
            handleGrowthButtonClick();
        }
    };

    const renderHubspotForm = useCallback(() => {
        const formProps: IHubspotConversionTouchPointDialogBaseProps = {
            ...props,
            targetId: "gdPricingPlans",
            selectedValue: DEFAULT_SELECTED_OPTION,
            submitButtonClass: submitButtonClasses,
            shouldCloseDialogAfterSubmit: false,
            onFormSubmitted: () => {
                props.onFormSubmitted?.();
                setReloadHubspotForm((prev) => {
                    if (!prev) {
                        setTimeout(() => {
                            setReloadHubspotForm(false);
                        }, 500);
                        return true;
                    }
                    return prev;
                });
            },
        };

        return (
            !shouldReloadHubspotForm && (
                <HubspotProvider>
                    <HubspotConversionTouchPointDialogBase {...formProps} />
                </HubspotProvider>
            )
        );
    }, [shouldReloadHubspotForm]);

    return (
        <Overlay
            containerClassName="visible"
            className="gd-pricing-overlay"
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
                className="gd-pricing-plans-dialog s-conversion-touch-point-dialog"
            >
                <div className="gd-pricing-plans">
                    <div className="dialog-title">
                        <h3>{intl.formatMessage({ id: "gdPricingPlansDialog.title" })}</h3>
                    </div>
                    <div className="dialog-contain-wrapper">
                        <div className="dialog-body">
                            <div className="gd-pricing-plan-item growth">
                                <h3>{intl.formatMessage({ id: "gdPricingPlansDialog.plan.growth" })}</h3>
                                <p>
                                    {intl.formatMessage({ id: "gdPricingPlansDialog.plan.growth.subTitle" })}
                                </p>
                                <div className="plan-price">
                                    <label className="highlight">
                                        {intl.formatMessage({ id: "gdPricingPlansDialog.plan.growth.price" })}
                                    </label>
                                    <p>
                                        {intl.formatMessage({
                                            id: "gdPricingPlansDialog.plan.growth.price.detail",
                                        })}
                                    </p>
                                </div>
                                <FormattedHTMLMessage id="gdPricingPlansDialog.plan.growth.desc" />
                                {isGrowthSubmitted ? (
                                    <label className="request-sent">
                                        {intl.formatMessage({ id: "gdPricingPlansDialog.requestSent" })}
                                    </label>
                                ) : (
                                    <Button
                                        className="gd-button-important gd-button-upsell"
                                        onClick={handleGrowthButtonClick}
                                        value={intl.formatMessage({ id: "gdPricingPlansDialog.talkToUs" })}
                                    ></Button>
                                )}
                            </div>
                            <div className="gd-pricing-plan-item enterprise">
                                <h3>{intl.formatMessage({ id: "gdPricingPlansDialog.plan.enterprise" })}</h3>
                                <p>
                                    {intl.formatMessage({
                                        id: "gdPricingPlansDialog.plan.enterprise.subTitle",
                                    })}
                                </p>
                                <div className="plan-price">
                                    <label className="highlight">
                                        {intl.formatMessage({
                                            id: "gdPricingPlansDialog.plan.enterprise.price",
                                        })}
                                    </label>
                                </div>
                                <FormattedHTMLMessage id="gdPricingPlansDialog.plan.enterprise.desc" />
                                {isEnterpriseSubmitted ? (
                                    <label className="request-sent">
                                        {intl.formatMessage({ id: "gdPricingPlansDialog.requestSent" })}
                                    </label>
                                ) : (
                                    <Button
                                        className="gd-button-important gd-button-upsell"
                                        onClick={handleEnterpriseButtonClick}
                                        value={intl.formatMessage({ id: "gdPricingPlansDialog.talkToUs" })}
                                    ></Button>
                                )}
                            </div>
                        </div>
                        <div className="dialog-footer">
                            <h4>{intl.formatMessage({ id: "gdPricingPlansDialog.footer.title" })}</h4>
                            <div className="customers">
                                <i className="gd-customer-zalando" />
                                <i className="gd-customer-visa" />
                                <i className="gd-customer-zendesk" />
                                <i className="gd-customer-double-verify" />
                                <i className="gd-customer-calpine" />
                            </div>
                        </div>
                    </div>
                    {renderHubspotForm()}
                </div>
            </DialogBase>
        </Overlay>
    );
};
