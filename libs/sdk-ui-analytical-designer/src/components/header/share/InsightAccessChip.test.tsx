// (C) 2026 GoodData Corporation

import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import type { ObjectShareLevel } from "@gooddata/sdk-ui-ext";

import { withIntl } from "../../../utils/with_intl.js";

import { type IInsightAccessChipProps, InsightAccessChip } from "./InsightAccessChip.js";

function renderChip(props: Partial<IInsightAccessChipProps> = {}) {
    const onClick = vi.fn<() => void>();
    const Wrapped = withIntl(InsightAccessChip);
    render(<Wrapped level="PRIVATE" onClick={onClick} {...props} />);
    return onClick;
}

describe("InsightAccessChip", () => {
    it.each<[ObjectShareLevel, string]>([
        ["PRIVATE", "Private"],
        ["SHARED", "Shared"],
        ["WORKSPACE", "Workspace"],
    ])("names the %s level", (level, label) => {
        renderChip({ level });
        expect(screen.getByRole("button")).toHaveTextContent(label);
    });

    it("says which level it is and that it opens a dialog", () => {
        renderChip({ level: "WORKSPACE", isOpen: true });
        const button = screen.getByRole("button");
        expect(button).toHaveAttribute("aria-label", "Access level: Workspace. Click to manage sharing.");
        expect(button).toHaveAttribute("aria-haspopup", "dialog");
        expect(button).toHaveAttribute("aria-expanded", "true");
    });

    it("shows a placeholder while the access is being read", () => {
        renderChip({ level: undefined, isLoading: true });
        expect(screen.queryByRole("button")).toBeNull();
    });

    it("still opens the dialog when the access could not be read", () => {
        const onClick = renderChip({ level: undefined });
        const button = screen.getByRole("button");
        expect(button).toHaveTextContent("Share");
        fireEvent.click(button);
        expect(onClick).toHaveBeenCalled();
    });
});
