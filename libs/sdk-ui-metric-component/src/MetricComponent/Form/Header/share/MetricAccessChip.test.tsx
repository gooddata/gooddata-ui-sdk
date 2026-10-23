// (C) 2026 GoodData Corporation

import { screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import type { ObjectShareLevel } from "@gooddata/sdk-ui-ext";

import { mountWithIntlComponent } from "../../../../tests/render.test.utils.js";

import { MetricAccessChip } from "./MetricAccessChip.js";

function render(props: Partial<Parameters<typeof MetricAccessChip>[0]> = {}) {
    return mountWithIntlComponent(<MetricAccessChip level="PRIVATE" onClick={vi.fn()} {...props} />);
}

describe("MetricAccessChip", () => {
    it.each<[ObjectShareLevel, string]>([
        ["PRIVATE", "Private"],
        ["SHARED", "Shared"],
        ["WORKSPACE", "Workspace"],
    ])("names the %s level", (level, label) => {
        render({ level });

        expect(screen.getByRole("button")).toHaveTextContent(label);
    });

    it("says which level it is for a screen reader", () => {
        render({ level: "WORKSPACE" });

        expect(screen.getByRole("button")).toHaveAttribute(
            "aria-label",
            "Access level: Workspace. Click to manage sharing.",
        );
    });

    it("ties the tooltip's explanation to the chip for screen readers", () => {
        render({ level: "PRIVATE" });

        const describedBy = screen.getByRole("button").getAttribute("aria-describedby");
        expect(describedBy).toBeTruthy();
        expect(document.getElementById(describedBy!)).not.toBeNull();
    });

    it("stands a placeholder in while the access is still being read", () => {
        render({ level: undefined, isLoading: true });

        expect(screen.queryByRole("button")).toBeNull();
    });

    it("still opens the dialog when the access could not be read", () => {
        render({ level: undefined });

        const button = screen.getByRole("button");
        expect(button).toHaveTextContent("Share");
        expect(button).not.toHaveAttribute("aria-label");
    });
});
