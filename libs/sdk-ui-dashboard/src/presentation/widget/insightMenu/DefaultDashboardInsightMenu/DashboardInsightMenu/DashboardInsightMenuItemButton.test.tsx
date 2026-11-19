// (C) 2026 GoodData Corporation

import { render, screen } from "@testing-library/react";
import { userEvent } from "@testing-library/user-event";
import { describe, expect, it } from "vitest";

import { DashboardInsightMenuItemButton } from "./DashboardInsightMenuItemButton.js";

const reason = "Unable to edit the rich text. Please contact your administrator.";

describe("DashboardInsightMenuItemButton", () => {
    it("exposes the disabled reason once without a description id, also while its tooltip is open", async () => {
        const user = userEvent.setup();
        const { container } = render(
            <DashboardInsightMenuItemButton itemId="Edit" itemName="Edit" tooltip={reason} disabled />,
        );

        expect(container.textContent?.split(reason)).toHaveLength(2);

        await user.hover(screen.getByText("Edit"));
        await screen.findByRole("tooltip", { hidden: true });

        expect(container.textContent?.split(reason)).toHaveLength(2);
        expect(container.querySelector("[aria-live]")).toBeNull();
    });
});
