// (C) 2026 GoodData Corporation

import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { selectIsShareDialogOpen } from "../../../../../model/store/ui/uiSelectors.js";
import { IntlWrapper } from "../../../../localization/IntlWrapper.js";

import { DefaultShareButton } from "./DefaultShareButton.js";

const mockUseDashboardSelector = vi.fn<(selector: unknown) => unknown>();

// vitest runs with isolate: false; reset the module registry so the mocks below apply.
vi.hoisted(() => {
    vi.resetModules();
});

vi.mock("../../../../../model/react/DashboardStoreProvider.js", () => ({
    useDashboardSelector: (selector: unknown) => mockUseDashboardSelector(selector),
    useDashboardDispatch: () => vi.fn<() => void>(),
}));

const mockShareDialogOpen = (isOpen: boolean) => {
    mockUseDashboardSelector.mockImplementation((selector: unknown) =>
        selector === selectIsShareDialogOpen ? isOpen : undefined,
    );
};

const renderButton = () =>
    render(
        <IntlWrapper>
            <DefaultShareButton isVisible isEnabled onShareButtonClick={() => {}} />
        </IntlWrapper>,
    );

describe("DefaultShareButton", () => {
    beforeEach(() => {
        mockUseDashboardSelector.mockReset();
    });

    it("should announce collapsed state when the share dialog is closed", () => {
        mockShareDialogOpen(false);
        renderButton();

        const button = screen.getByTestId("share");
        expect(button).toHaveAttribute("aria-haspopup", "dialog");
        expect(button).toHaveAttribute("aria-expanded", "false");
        expect(button).not.toHaveAttribute("aria-controls");
    });

    it("should announce expanded state and reference the dialog when the share dialog is open", () => {
        mockShareDialogOpen(true);
        renderButton();

        const button = screen.getByTestId("share");
        expect(button).toHaveAttribute("aria-haspopup", "dialog");
        expect(button).toHaveAttribute("aria-expanded", "true");
        expect(button).toHaveAttribute("aria-controls", "share-dialog");
    });
});
