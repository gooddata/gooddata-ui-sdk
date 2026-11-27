// (C) 2026 GoodData Corporation

import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { uriRef } from "@gooddata/sdk-model";
import { withIntlForTest } from "@gooddata/sdk-ui";

import { type CurrentUserPermissions } from "../../types.js";
import { ComponentInteractionProvider } from "../ComponentInteractionContext.js";
import { defaultUser } from "../Grantee.test.helpers.js";
import { type IGranteePermissionsPossibilities, type IGranularGranteeGroup } from "../types.js";

import { GranularPermissionsDropdown } from "./GranularPermissionsDropdown.js";

const Wrapped = withIntlForTest(GranularPermissionsDropdown);

const currentUserPermissions: CurrentUserPermissions = {
    canEditLockedAffectedObject: true,
    canEditAffectedObject: true,
    canShareLockedAffectedObject: true,
    canShareAffectedObject: true,
    canViewAffectedObject: true,
};

const grantee: IGranularGranteeGroup = {
    type: "granularGroup",
    id: uriRef("group-1"),
    name: "Marketing",
    permissions: ["EDIT"],
    inheritedPermissions: [],
};

const granteePossibilities: IGranteePermissionsPossibilities = {
    remove: { enabled: true },
    change: { enabled: true },
    assign: {
        effective: "EDIT",
        items: [
            { id: "EDIT", enabled: true, hidden: false },
            { id: "SHARE", enabled: true, hidden: false },
            { id: "VIEW", enabled: true, hidden: false },
        ],
    },
};

function renderDropdown() {
    return render(
        <ComponentInteractionProvider
            onInteraction={vi.fn()}
            currentUser={defaultUser}
            currentUserPermissions={currentUserPermissions}
            isCurrentUserWorkspaceManager
            sharedObjectStatus="shared"
            isSharedObjectLocked={false}
        >
            <Wrapped
                grantee={grantee}
                granteePossibilities={granteePossibilities}
                handleToggleDropdown={vi.fn()}
                onChange={vi.fn()}
                onDelete={vi.fn()}
                className="gd-grantee-granular-permission"
                mode="ShareGrantee"
                accessibilityConfig={{ ariaDescribedBy: "grantee-item-test" }}
            />
            <div id="grantee-item-test" className="gd-grantee-content">
                Marketing
            </div>
        </ComponentInteractionProvider>,
    );
}

describe("GranularPermissionsDropdown", () => {
    it("names the button by the visible permission and describes it by the grantee", async () => {
        renderDropdown();

        const button = await screen.findByRole("button", {
            name: "Permission: Can edit & share",
            description: "Marketing",
        });
        expect(button).toHaveTextContent("Can edit & share");
        expect(button).toHaveAttribute("aria-haspopup", "true");
        expect(button).toHaveAttribute("aria-expanded", "false");
    });

    it("names the opened list box as the permission list of the grantee", async () => {
        renderDropdown();

        const button = await screen.findByRole("button", { name: "Permission: Can edit & share" });
        fireEvent.click(button);

        const listbox = await screen.findByRole("listbox", { name: "Permission for Marketing" });
        expect(button).toHaveAttribute("aria-controls", listbox.id);
    });

    it("announces the newly selected permission after the permission changes", async () => {
        renderDropdown();

        const button = await screen.findByRole("button", { name: "Permission: Can edit & share" });
        fireEvent.click(button);
        expect(button).toHaveAttribute("aria-expanded", "true");

        fireEvent.click(await screen.findByRole("option", { name: "Can view" }));

        const updatedButton = await screen.findByRole("button", { name: "Permission: Can view" });
        expect(updatedButton).toHaveTextContent("Can view");
    });
});
