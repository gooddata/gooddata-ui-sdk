// (C) 2026 GoodData Corporation

import { type ReactNode } from "react";

import { render, screen } from "@testing-library/react";
import { userEvent } from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { type IAutomationMetadataObject } from "@gooddata/sdk-model";

vi.mock("@gooddata/sdk-ui", async (importOriginal) => ({
    ...(await importOriginal<Record<string, unknown>>()),
    useBackend: () => undefined,
    useWorkspace: () => "workspace-id",
}));

vi.mock("@gooddata/sdk-ui-ext", () => ({
    Automations: ({ renderToolbarCustomElement }: { renderToolbarCustomElement?: () => ReactNode }) => (
        <div data-testid="automations">{renderToolbarCustomElement?.()}</div>
    ),
}));

vi.mock("../../contexts/AutomationsContext.js", () => ({
    useAutomationsContext: () => ({
        timezone: "UTC",
        locale: "en-US",
        isWhiteLabeled: true,
        isExecutionTimestampMode: false,
        externalRecipient: undefined,
        features: { canCreateAutomation: true },
    }),
}));

import { IntlWrapper } from "../../../localization/IntlWrapper.js";
import {
    type IScheduledEmailManagementDialogContextValue,
    ScheduledEmailManagementDialogContextProvider,
} from "../../contexts/ScheduledEmailManagementDialogContext.js";
import { SCHEDULED_EMAIL_DIALOG_ID } from "../DefaultScheduledEmailDialog/constants.js";

import { DefaultScheduledEmailManagementDialogContent } from "./DefaultScheduledEmailManagementDialogContent.js";

const BASE_CONTEXT: IScheduledEmailManagementDialogContextValue = {
    isScheduleEmailDialogOpen: false,
    enableAccessibilityMode: false,
    isEmbedded: false,
    maxAutomations: 10,
    unlimitedAutomations: false,
    automations: [],
    isLoading: false,
};

function renderContent(context: Partial<IScheduledEmailManagementDialogContextValue>, onAdd = vi.fn()) {
    const tree = (ctx: Partial<IScheduledEmailManagementDialogContextValue>) => (
        <IntlWrapper locale="en-US">
            <ScheduledEmailManagementDialogContextProvider value={{ ...BASE_CONTEXT, ...ctx }}>
                <DefaultScheduledEmailManagementDialogContent onAdd={onAdd} onEdit={vi.fn()} />
            </ScheduledEmailManagementDialogContextProvider>
        </IntlWrapper>
    );
    const result = render(tree(context));
    return { ...result, onAdd, rerenderWith: (ctx: typeof context) => result.rerender(tree(ctx)) };
}

// the overlay stays visually hidden in jsdom (it never gets aligned), so role queries need
// `hidden: true` and the accessible name of its content cannot be computed
const getCreateButton = () => screen.getByTestId("create_new");
const getDialog = () => screen.getByRole("dialog", { hidden: true });

describe("DefaultScheduledEmailManagementDialogContent", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it.each(["{Enter}", " "])("opens the create dialog when Create new is activated by '%s'", async (key) => {
        const { onAdd } = renderContent({});

        getCreateButton().focus();
        await userEvent.keyboard(key);

        expect(onAdd).toHaveBeenCalledTimes(1);
        // the click event must not leak into onAdd's optional target-widget argument
        expect(onAdd).toHaveBeenCalledWith();
    });

    it("stops being the active modal while the create dialog is open", () => {
        const { rerenderWith } = renderContent({});
        expect(getDialog()).toHaveAttribute("aria-modal", "true");

        rerenderWith({ isScheduleEmailDialogOpen: true });

        expect(getDialog()).not.toHaveAttribute("aria-modal", "true");
    });

    it("exposes the button as controlling the create dialog when enabled", () => {
        renderContent({});

        const button = getCreateButton();
        expect(button).toHaveAttribute("aria-disabled", "false");
        expect(button).toHaveAttribute("aria-haspopup", "dialog");
        expect(button).toHaveAttribute("aria-controls", SCHEDULED_EMAIL_DIALOG_ID);
    });

    it("announces why Create new is disabled when the automations limit is reached", async () => {
        const { onAdd } = renderContent({
            maxAutomations: 1,
            automations: [{ id: "existing" } as IAutomationMetadataObject],
        });

        const button = getCreateButton();
        expect(button).toHaveAttribute("aria-disabled", "true");
        expect(button).not.toHaveAttribute("aria-haspopup");
        expect(button).not.toHaveAttribute("aria-controls");

        const describedBy = button.getAttribute("aria-describedby");
        expect(describedBy).toBeTruthy();
        expect(document.getElementById(describedBy!)?.textContent).not.toBe("");

        button.focus();
        await userEvent.keyboard("{Enter}");
        expect(onAdd).not.toHaveBeenCalled();
    });
});
