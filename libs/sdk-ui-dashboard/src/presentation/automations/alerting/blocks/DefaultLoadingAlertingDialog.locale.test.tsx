// (C) 2026 GoodData Corporation

import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { IntlWrapper } from "../../../localization/IntlWrapper.js";
import { AlertingDialogContextProvider } from "../../contexts/AlertingDialogContext.js";
import { AutomationsContextProvider } from "../../contexts/AutomationsContext.js";
import { DefaultAlertingDialog } from "../DefaultAlertingDialog/DefaultAlertingDialog.js";
import { ALERTING_DIALOG_CONTEXT, AUTOMATIONS_CONTEXT } from "../tests/alerting.test.helpers.js";

describe("DefaultAlertingDialog loading skeleton locale", () => {
    it("renders the loading skeleton in the automations context locale, not the ambient one", async () => {
        render(
            <IntlWrapper>
                <AutomationsContextProvider value={{ ...AUTOMATIONS_CONTEXT, locale: "de-DE" }}>
                    <AlertingDialogContextProvider value={{ ...ALERTING_DIALOG_CONTEXT, isLoading: true }}>
                        <DefaultAlertingDialog onCancel={() => {}} />
                    </AlertingDialogContextProvider>
                </AutomationsContextProvider>
            </IntlWrapper>,
        );

        expect(await screen.findByText("Warnungsname")).toBeInTheDocument();
    });
});
