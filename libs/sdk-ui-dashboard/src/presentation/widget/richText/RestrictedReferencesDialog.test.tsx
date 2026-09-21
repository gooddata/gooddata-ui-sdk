// (C) 2026 GoodData Corporation

import { useState } from "react";

import { render, screen } from "@testing-library/react";
import { userEvent } from "@testing-library/user-event";
import { RawIntlProvider } from "react-intl";
import { describe, expect, it, vi } from "vitest";

import { idRef } from "@gooddata/sdk-model";

import { createInternalIntl } from "../../localization/createInternalIntl.js";

const restrictedReferences = [idRef("olp_m_restricted", "measure")];

// `isolate: false` shares one module graph per worker, so the module mocked below may already have
// been evaluated against its real dependencies by a test file that ran earlier in the same worker.
vi.hoisted(() => {
    vi.resetModules();
});

vi.mock("../../../model/react/DashboardStoreProvider.js", () => ({
    useDashboardSelector: () => restrictedReferences,
}));

const { RestrictedReferencesDialog, useHasRestrictedReferences } =
    await import("./RestrictedReferencesDialog.js");

const TEXT = "Margin held at **{metric/olp_m_restricted}** while revenue grew {metric/readable}.";

interface IHarnessProps {
    value?: string;
    onSanitized?: (sanitized: string) => void;
    onCancel?: () => void;
}

/** Stands in for a surface that edits a text: it asks while the text holds such a reference. */
function Harness({ value = TEXT, onSanitized = vi.fn(), onCancel = vi.fn() }: IHarnessProps) {
    const [isEditingRequested, setIsEditingRequested] = useState(false);
    const hasRestrictedReferences = useHasRestrictedReferences(value);
    const isAskingToSanitize = isEditingRequested && hasRestrictedReferences;

    return (
        <>
            <button type="button" onClick={() => setIsEditingRequested(true)}>
                edit
            </button>
            <span data-testid="state">{`${hasRestrictedReferences} ${isAskingToSanitize}`}</span>
            {isAskingToSanitize ? (
                <RestrictedReferencesDialog
                    value={value}
                    onSanitized={onSanitized}
                    onCancel={() => {
                        setIsEditingRequested(false);
                        onCancel();
                    }}
                />
            ) : null}
        </>
    );
}

/** the dialog asks for the locale itself, so the provider has to stand above it */
function renderHarness(props: IHarnessProps = {}) {
    return render(
        <RawIntlProvider value={createInternalIntl()}>
            <Harness {...props} />
        </RawIntlProvider>,
    );
}

describe("RestrictedReferencesDialog", () => {
    it("asks only of a text that references something the user cannot read", () => {
        const { unmount } = renderHarness();
        expect(screen.getByTestId("state")).toHaveTextContent("true false");
        unmount();

        renderHarness({ value: "Revenue grew {metric/readable}." });
        expect(screen.getByTestId("state")).toHaveTextContent("false false");
    });

    it("puts ??? in place of the reference, which is what every reader is left with", async () => {
        const onSanitized = vi.fn();
        renderHarness({ onSanitized });
        const user = userEvent.setup();

        await user.click(screen.getByRole("button", { name: "edit" }));
        await user.click(screen.getByRole("button", { name: "Remove and edit" }));

        expect(onSanitized).toHaveBeenCalledWith(
            "Margin held at **???** while revenue grew {metric/readable}.",
        );
    });

    it("stands while the text holds such a reference, which is what a surface branches on", async () => {
        renderHarness();
        expect(screen.getByTestId("state")).toHaveTextContent("true false");

        await userEvent.setup().click(screen.getByRole("button", { name: "edit" }));

        expect(screen.getByTestId("state")).toHaveTextContent("true true");
    });

    it("changes nothing and says so when the editor cancels", async () => {
        const onSanitized = vi.fn();
        const onCancel = vi.fn();
        renderHarness({ onSanitized, onCancel });
        const user = userEvent.setup();

        await user.click(screen.getByRole("button", { name: "edit" }));
        await user.click(screen.getByRole("button", { name: "Cancel" }));

        expect(onSanitized).not.toHaveBeenCalled();
        expect(onCancel).toHaveBeenCalledTimes(1);
        expect(screen.getByTestId("state")).toHaveTextContent("true false");
    });
});
