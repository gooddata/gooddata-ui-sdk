// (C) 2026 GoodData Corporation

import { render, screen } from "@testing-library/react";
import { IntlProvider } from "react-intl";
import { describe, expect, it, vi } from "vitest";

import { DEFAULT_LANGUAGE, DEFAULT_MESSAGES } from "@gooddata/sdk-ui";

// UiPopover + UiTooltip pull in the legacy Bubble stack that fails under
// our pnpm hoist. Mock both — the popovers themselves are verified in
// Storybook; here we only check the trigger labels and prop wiring.
vi.mock("../../UiPopover/UiPopover.js", () => ({
    UiPopover: ({ anchor }: { anchor: React.ReactElement }) => <>{anchor}</>,
}));
vi.mock("../../UiTooltip/UiTooltip.js", () => ({
    UiTooltip: ({ anchor }: { anchor: React.ReactNode }) => <>{anchor}</>,
}));

import { type IUiLabelsPickerItem } from "../../UiLabelsPicker/UiLabelsPicker.js";
import { UiGranteeRowControls } from "../UiGranteeRowControls.js";

const LABELS: IUiLabelsPickerItem[] = [
    { id: "id", label: "Customer ID", kind: "primary", locked: true },
    { id: "name", label: "Customer Name", kind: "default" },
    { id: "email", label: "Customer Email" },
    { id: "ssn", label: "Customer SSN" },
];

const renderWithIntl = (ui: React.ReactNode) =>
    render(
        <IntlProvider locale={DEFAULT_LANGUAGE} messages={DEFAULT_MESSAGES[DEFAULT_LANGUAGE]}>
            {ui}
        </IntlProvider>,
    );

describe("UiGranteeRowControls", () => {
    it("renders 'All labels' when every label is selected", () => {
        renderWithIntl(
            <UiGranteeRowControls
                labels={LABELS}
                selectedLabelIds={["id", "name", "email", "ssn"]}
                permissionLevel="VIEW"
                onLabelsChange={() => {}}
                onPermissionChange={() => {}}
            />,
        );
        expect(screen.getByRole("button", { name: /All labels/ })).toBeInTheDocument();
    });

    it("renders '<n> of <total>' when only a subset is selected", () => {
        renderWithIntl(
            <UiGranteeRowControls
                labels={LABELS}
                selectedLabelIds={["id", "name"]}
                permissionLevel="VIEW"
                onLabelsChange={() => {}}
                onPermissionChange={() => {}}
            />,
        );
        expect(screen.getByRole("button", { name: /2 of 4/ })).toBeInTheDocument();
    });

    it("counts locked labels as selected even when they are not listed in selectedLabelIds", () => {
        // The "id" label is locked → always counted as selected. With only "name"
        // in selectedLabelIds, the effective count is still 2 (id + name).
        renderWithIntl(
            <UiGranteeRowControls
                labels={LABELS}
                selectedLabelIds={["name"]}
                permissionLevel="VIEW"
                onLabelsChange={() => {}}
                onPermissionChange={() => {}}
            />,
        );
        expect(screen.getByRole("button", { name: /2 of 4/ })).toBeInTheDocument();
    });

    it("renders 'All labels' when every non-locked label is selected and the locked one is omitted", () => {
        // 4 labels total, "id" is locked, others are selected explicitly.
        // selectedLabelIds doesn't repeat the locked id — picker contract.
        renderWithIntl(
            <UiGranteeRowControls
                labels={LABELS}
                selectedLabelIds={["name", "email", "ssn"]}
                permissionLevel="VIEW"
                onLabelsChange={() => {}}
                onPermissionChange={() => {}}
            />,
        );
        expect(screen.getByRole("button", { name: /All labels/ })).toBeInTheDocument();
    });

    it("renders the 'Can view' permission label when level is VIEW", () => {
        renderWithIntl(
            <UiGranteeRowControls
                labels={LABELS}
                selectedLabelIds={["id"]}
                permissionLevel="VIEW"
                onLabelsChange={() => {}}
                onPermissionChange={() => {}}
            />,
        );
        expect(screen.getByRole("button", { name: /^Can view$/ })).toBeInTheDocument();
    });

    it("renders the 'Can view & share' permission label when level is SHARE", () => {
        renderWithIntl(
            <UiGranteeRowControls
                labels={LABELS}
                selectedLabelIds={["id"]}
                permissionLevel="SHARE"
                onLabelsChange={() => {}}
                onPermissionChange={() => {}}
            />,
        );
        expect(screen.getByRole("button", { name: /Can view & share/ })).toBeInTheDocument();
    });

    it("forwards dataTestId", () => {
        renderWithIntl(
            <UiGranteeRowControls
                labels={LABELS}
                selectedLabelIds={["id"]}
                permissionLevel="VIEW"
                onLabelsChange={() => {}}
                onPermissionChange={() => {}}
                dataTestId="row-controls"
            />,
        );
        expect(screen.getByTestId("row-controls")).toBeInTheDocument();
    });
});
