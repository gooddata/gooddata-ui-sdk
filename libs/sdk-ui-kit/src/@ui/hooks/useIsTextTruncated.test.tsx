// (C) 2026 GoodData Corporation

import { act, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { useIsTextTruncated } from "./useIsTextTruncated.js";

function Probe({ text, clientWidth }: { text: string; clientWidth: number }) {
    const { ref, isTruncated } = useIsTextTruncated(text);
    return (
        <span
            ref={(node) => {
                if (node) {
                    Object.defineProperty(node, "scrollWidth", {
                        get: () => node.textContent!.length * 10,
                        configurable: true,
                    });
                    Object.defineProperty(node, "clientWidth", { value: clientWidth, configurable: true });
                }
                ref(node);
            }}
            data-testid="probe"
            data-truncated={isTruncated}
        >
            {text}
        </span>
    );
}

describe("useIsTextTruncated", () => {
    it("reports truncation when the text is wider than the element", async () => {
        render(<Probe text="twelve chars" clientWidth={80} />);
        await act(async () => {});
        expect(screen.getByTestId("probe")).toHaveAttribute("data-truncated", "true");
    });

    it("reports no truncation when the text fits", async () => {
        render(<Probe text="eight ch" clientWidth={80} />);
        await act(async () => {});
        expect(screen.getByTestId("probe")).toHaveAttribute("data-truncated", "false");
    });

    it("measures again when the text of the same element changes", async () => {
        const { rerender } = render(<Probe text="eight ch" clientWidth={80} />);
        await act(async () => {});
        expect(screen.getByTestId("probe")).toHaveAttribute("data-truncated", "false");

        rerender(<Probe text="a much longer text" clientWidth={80} />);
        await act(async () => {});
        expect(screen.getByTestId("probe")).toHaveAttribute("data-truncated", "true");
    });
});
