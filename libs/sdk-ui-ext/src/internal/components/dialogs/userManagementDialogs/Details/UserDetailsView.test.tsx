// (C) 2026 GoodData Corporation

import { render } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { type IUser } from "@gooddata/sdk-model";
import { IntlWrapper } from "@gooddata/sdk-ui";

import { type ListMode } from "../types.js";

import { UserDetailsView } from "./UserDetailsView.js";

vi.mock("../TelemetryContext.js", () => ({ useTelemetry: () => vi.fn() }));

const USER = {
    login: "ben",
    firstName: "Ben",
    lastName: "Novak",
    email: "ben@example.com",
} as IUser;

function renderView(isLocalizationEnabled: boolean, mode: ListMode = "VIEW") {
    const { container } = render(
        <IntlWrapper>
            <UserDetailsView
                user={USER}
                isAdmin={false}
                isBootstrapUser={false}
                mode={mode}
                isSystemAccountFilteringEnabled
                isLocalizationEnabled={isLocalizationEnabled}
                languages={{}}
            />
        </IntlWrapper>,
    );
    return container;
}

const profileLabels = (container: HTMLElement) =>
    [...container.querySelectorAll(".gd-user-management-dialog-detail-label")]
        .map((label) => label.textContent)
        .slice(0, 6);

describe("UserDetailsView", () => {
    it("shows the ID after the e-mail when localization is on", () => {
        expect(profileLabels(renderView(true))).toEqual([
            "First name",
            "Last name",
            "E-mail",
            "ID",
            "Org. permission",
            "System user",
        ]);
    });

    it("keeps the ID last when localization is off", () => {
        expect(profileLabels(renderView(false))).toEqual([
            "First name",
            "Last name",
            "E-mail",
            "Org. permission",
            "System user",
            "ID",
        ]);
    });

    it("lines up the system user row with the other rows only when localization is on", () => {
        const on = renderView(true, "EDIT");
        const off = renderView(false, "EDIT");

        expect(on.querySelector(".gd-user-management-dialog-detail")).toHaveClass(
            "gd-user-management-dialog-detail-localization",
        );
        expect(on.querySelector(".gd-user-management-dialog-detail-row-checkbox-edit")).not.toBeNull();
        expect(off.querySelector(".gd-user-management-dialog-detail")).not.toHaveClass(
            "gd-user-management-dialog-detail-localization",
        );
        expect(off.querySelector(".gd-user-management-dialog-detail-row-checkbox-edit")).toBeNull();
    });
});
