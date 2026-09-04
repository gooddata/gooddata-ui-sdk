// (C) 2026 GoodData Corporation

import { defineMessages, useIntl } from "react-intl";

import { PantherTier } from "@gooddata/sdk-pluggable-application-model";
import { ErrorOverlay } from "@gooddata/sdk-ui-kit";

import hourglassIcon from "../assets/hourglass.svg";
import lockIcon from "../assets/lock.svg";

import "./ContractExpiredDialog.scss";

const CONTACT_US_URL =
    "https://www.gooddata.com/contact/?utm_source=GoodDataCloudTrial&utm_medium=free&utm_campaign=contact-us-click&utm_content=contact-us-click";

const messages = defineMessages({
    trialTitle: { id: "gs.host.contractExpired.trial.title" },
    trialDescription: { id: "gs.host.contractExpired.trial.description" },
    nonTrialTitle: { id: "gs.host.contractExpired.nonTrial.title" },
    nonTrialDescription: { id: "gs.host.contractExpired.nonTrial.description" },
    buttonTitle: { id: "gs.host.contractExpired.buttonTitle" },
});

/**
 * Full-screen lock shown once the backend denies requests because the organization's contract or the
 * deployment license expired. Mirrors the dialog the standalone applications render for the same error.
 */
export function ContractExpiredDialog({ tier }: { tier: string }) {
    const intl = useIntl();
    const isTrial = tier.toUpperCase() === PantherTier.TRIAL;

    return (
        <ErrorOverlay
            locale={intl.locale}
            className="s-contract-expired-dialog"
            showButton={isTrial}
            onButtonClick={() => {
                window.location.href = CONTACT_US_URL;
            }}
            icon={
                <img
                    src={isTrial ? hourglassIcon : lockIcon}
                    alt=""
                    className="gd-host-contract-expired-icon"
                />
            }
            title={intl.formatMessage(isTrial ? messages.trialTitle : messages.nonTrialTitle)}
            text={intl.formatMessage(isTrial ? messages.trialDescription : messages.nonTrialDescription)}
            buttonTitle={intl.formatMessage(messages.buttonTitle)}
        />
    );
}
