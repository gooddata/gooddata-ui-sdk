// (C) 2026 GoodData Corporation

import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { IntlWrapper } from "../../../localization/IntlWrapper.js";
import { AutomationsContextProvider } from "../../contexts/AutomationsContext.js";
import { ScheduledEmailDialogContextProvider } from "../../contexts/ScheduledEmailDialogContext.js";
import { DefaultScheduledEmailDialog } from "../DefaultScheduledEmailDialog/DefaultScheduledEmailDialog.js";
import { AUTOMATIONS_CONTEXT, SCHEDULED_EMAIL_DIALOG_CONTEXT } from "../tests/scheduledEmail.test.helpers.js";

describe("DefaultScheduledEmailDialog loading skeleton locale", () => {
    it("renders the loading skeleton in the automations context locale, not the ambient one", async () => {
        render(
            <IntlWrapper>
                <AutomationsContextProvider value={{ ...AUTOMATIONS_CONTEXT, locale: "de-DE" }}>
                    <ScheduledEmailDialogContextProvider
                        value={{ ...SCHEDULED_EMAIL_DIALOG_CONTEXT, isLoading: true }}
                    >
                        <DefaultScheduledEmailDialog onCancel={() => {}} />
                    </ScheduledEmailDialogContextProvider>
                </AutomationsContextProvider>
            </IntlWrapper>,
        );

        expect(await screen.findByText("Geplante E-Mails")).toBeInTheDocument();
    });
});
