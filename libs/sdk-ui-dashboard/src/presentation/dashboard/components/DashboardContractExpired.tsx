// (C) 2026 GoodData Corporation

import { defineMessages, useIntl } from "react-intl";

import { Button, Typography } from "@gooddata/sdk-ui-kit";

import { HourglassIcon, LockIcon } from "./contractExpiredIcons.js";

const TRIAL_TIER = "TRIAL";

const CONTACT_US_URL =
    "https://www.gooddata.com/contact/?utm_source=GoodDataCloudTrial&utm_medium=free&utm_campaign=contact-us-click&utm_content=contact-us-click";

const messages = defineMessages({
    trialTitle: { id: "dashboard.contractExpired.trial.title" },
    trialDescription: { id: "dashboard.contractExpired.trial.description" },
    nonTrialTitle: { id: "dashboard.contractExpired.nonTrial.title" },
    nonTrialDescription: { id: "dashboard.contractExpired.nonTrial.description" },
    buttonTitle: { id: "dashboard.contractExpired.buttonTitle" },
});

/**
 * Lock shown in place of the dashboard once the backend denies requests because the organization's
 * contract or the deployment license expired.
 */
export function DashboardContractExpired({ tier }: { tier?: string }) {
    const intl = useIntl();
    const isTrial = tier?.toUpperCase() === TRIAL_TIER;

    return (
        <div className="gd-dashboard-contract-expired s-dashboard-contract-expired">
            <div className="gd-error-overlay">
                {isTrial ? (
                    <HourglassIcon className="gd-error-overlay-icon" />
                ) : (
                    <LockIcon className="gd-error-overlay-icon" />
                )}
                <Typography tagName="h2">
                    {intl.formatMessage(isTrial ? messages.trialTitle : messages.nonTrialTitle)}
                </Typography>
                <div className="gd-error-overlay-text">
                    {intl.formatMessage(isTrial ? messages.trialDescription : messages.nonTrialDescription)}
                </div>
                {isTrial ? (
                    <Button
                        className="gd-button gd-button-action gd-error-overlay-button"
                        value={intl.formatMessage(messages.buttonTitle)}
                        onClick={() => {
                            window.location.href = CONTACT_US_URL;
                        }}
                    />
                ) : null}
            </div>
        </div>
    );
}
