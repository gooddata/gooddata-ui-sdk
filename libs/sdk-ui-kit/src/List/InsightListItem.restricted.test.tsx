// (C) 2026 GoodData Corporation

import { fireEvent, render, screen } from "@testing-library/react";
import { userEvent } from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { dummyBackend } from "@gooddata/sdk-backend-mockingbird";
import { idRef } from "@gooddata/sdk-model";
import { BackendProvider, IntlWrapper, WorkspaceProvider } from "@gooddata/sdk-ui";

import { makeLinearKeyboardNavigationWithConfirm } from "../@ui/@utils/keyboardNavigation.js";

import { InsightListItem } from "./InsightListItem.js";

describe("InsightListItem", () => {
    it("marks a restricted reference in the description it opens", async () => {
        const { container } = render(
            <BackendProvider backend={dummyBackend()}>
                <WorkspaceProvider workspace="ws-1">
                    <IntlWrapper>
                        <InsightListItem
                            title="Revenue"
                            description="Margin {metric/margin}"
                            showDescriptionPanel
                            useReferences
                            restrictedReferences={[idRef("margin", "measure")]}
                        />
                    </IntlWrapper>
                </WorkspaceProvider>
            </BackendProvider>,
        );

        fireEvent.mouseEnter(container.querySelector(".gd-bubble-trigger")!);

        expect(await screen.findByText("restricted")).toBeInTheDocument();
    });

    it("draws the delete action as a 14px icon", () => {
        const { container } = render(
            <IntlWrapper>
                <InsightListItem title="Sales" onDelete={() => {}} />
            </IntlWrapper>,
        );

        expect(container.querySelector(".s-delete-item svg")?.getAttribute("width")).toBe("14");
    });

    it.each(["{Enter}", " "])(
        "opens the delete action with %j inside a keyboard navigable list",
        async (key) => {
            const onDelete = vi.fn<() => void>();
            const handleListKeyDown = makeLinearKeyboardNavigationWithConfirm({
                onSelect: () => {},
                onConfirm: () => {},
            });
            render(
                <IntlWrapper>
                    <ul tabIndex={0} onKeyDown={handleListKeyDown}>
                        <li>
                            <InsightListItem title="Sales" onDelete={onDelete} />
                        </li>
                    </ul>
                </IntlWrapper>,
            );

            screen.getByRole("button").focus();
            await userEvent.keyboard(key);

            expect(onDelete).toHaveBeenCalledTimes(1);
        },
    );
});
