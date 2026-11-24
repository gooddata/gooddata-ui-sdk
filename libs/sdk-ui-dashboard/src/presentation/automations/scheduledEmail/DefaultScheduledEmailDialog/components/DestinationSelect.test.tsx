// (C) 2026 GoodData Corporation

import { type ReactNode } from "react";

import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { ValidationContextStore, createInvalidNode, useValidationContextValue } from "@gooddata/sdk-ui";
import { Button } from "@gooddata/sdk-ui-kit";

import { IntlWrapper } from "../../../../localization/IntlWrapper.js";

import { DestinationSelect } from "./DestinationSelect/DestinationSelect.js";

function DialogLikeValidationRoot({ children }: { children: ReactNode }) {
    const validationContextValue = useValidationContextValue(createInvalidNode({ id: "Root" }));
    return (
        <ValidationContextStore value={validationContextValue}>
            {children}
            <Button value="Create" disabled describedByFromValidation />
        </ValidationContextStore>
    );
}

function renderComponent(notificationChannels: { id: string; title: string }[]) {
    return render(
        <IntlWrapper>
            <DialogLikeValidationRoot>
                <DestinationSelect
                    notificationChannels={notificationChannels as any}
                    selectedItemId={notificationChannels[0]?.id}
                    onChange={() => {}}
                />
            </DialogLikeValidationRoot>
        </IntlWrapper>,
    );
}

describe("DestinationSelect", () => {
    describe("without any destination", () => {
        it("should expose the field as a group named by the label and the warning", () => {
            renderComponent([]);

            const group = screen.getByRole("group");
            expect(group).toHaveAccessibleName("Destination No destination available.");
            expect(document.querySelector("label[for]")).toBeNull();
            expect(document.querySelector(".gd-icon-warning")).toHaveAttribute("aria-hidden", "true");
        });

        it("should describe the disabled submit button with the warning", async () => {
            renderComponent([]);

            const submit = screen.getByRole("button", { name: "Create" });
            expect(await screen.findByText("No destination available.")).toBeInTheDocument();
            await expect.poll(() => submit).toHaveAccessibleDescription("No destination available.");
        });
    });

    describe("with a destination", () => {
        it("should keep the label bound to the select and not describe the submit button", () => {
            renderComponent([{ id: "channel", title: "Channel" }]);

            expect(screen.queryByRole("group")).toBeNull();
            expect(document.querySelector("label")).toHaveAttribute("for", "schedule.destination");
            expect(screen.getByRole("button", { name: "Create" })).not.toHaveAttribute("aria-describedby");
        });
    });
});
