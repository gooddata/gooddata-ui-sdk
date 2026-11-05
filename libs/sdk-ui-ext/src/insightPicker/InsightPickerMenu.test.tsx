// (C) 2026 GoodData Corporation

import { render, screen } from "@testing-library/react";
import { userEvent } from "@testing-library/user-event";
import { describe, expect, it } from "vitest";

import { uriRef } from "@gooddata/sdk-model";

import { InternalIntlWrapper } from "../internal/utils/internalIntlProvider.js";

import { InsightPickerMenu } from "./InsightPickerMenu.js";
import { type IInsightPickerItem, type IInsightPickerMenuAction } from "./types.js";

const item: IInsightPickerItem = {
    ref: uriRef("/insight/1"),
    title: "Revenue",
    identifier: "revenue",
    isLocked: false,
    visualizationUrl: "local:table",
    permissions: ["VIEW"],
};

const saveAsNew: IInsightPickerMenuAction = { id: "save-as-new", title: "Save as new", onClick: () => {} };
const editOnlyDelete: IInsightPickerMenuAction = {
    id: "delete",
    title: "Delete",
    hasSeparator: true,
    isAvailable: (candidate) => candidate.permissions?.includes("EDIT") ?? false,
    onClick: () => {},
};

function renderMenu(menuActions: IInsightPickerMenuAction[]) {
    return render(
        <InternalIntlWrapper>
            <InsightPickerMenu item={item} menuActions={menuActions} />
        </InternalIntlWrapper>,
    );
}

describe("InsightPickerMenu", () => {
    it("leaves out the actions that are not available for the item", async () => {
        renderMenu([saveAsNew, editOnlyDelete]);

        await userEvent.click(screen.getByRole("button"));

        expect(screen.getByText("Save as new")).toBeTruthy();
        expect(screen.queryByText("Delete")).toBeNull();
    });

    it("drops a separator left at the top of the menu", async () => {
        renderMenu([
            { ...editOnlyDelete, hasSeparator: false },
            { ...saveAsNew, hasSeparator: true },
        ]);

        await userEvent.click(screen.getByRole("button"));

        expect(screen.getByText("Save as new")).toBeTruthy();
        expect(screen.queryByTestId("item-separator")).toBeNull();
    });

    it("renders no menu when no action is available for the item", () => {
        renderMenu([editOnlyDelete]);

        expect(screen.queryByRole("button")).toBeNull();
    });
});
