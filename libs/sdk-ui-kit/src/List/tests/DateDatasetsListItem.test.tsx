// (C) 2026 GoodData Corporation

import { render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { ShortenedText } from "../../ShortenedText/ShortenedText.js";
import { DateDatasetsListItem } from "../DateDatasetsListItem.js";

describe("DateDatasetsListItem", () => {
    it("renders the header title as plain text, without treating it as a translation id", () => {
        render(<DateDatasetsListItem isHeader title="Some pre-translated header" onClick={() => {}} />);

        expect(screen.getByText("Some pre-translated header")).toBeInTheDocument();
    });

    describe("remeasures its shortened label when the list resizes", () => {
        afterEach(() => {
            vi.restoreAllMocks();
        });

        function renderItem(width: number) {
            return render(
                <DateDatasetsListItem id="d1" title="A dataset name" width={width} onClick={() => {}} />,
            );
        }

        it("does not recompute on mount", () => {
            const spy = vi.spyOn(ShortenedText.prototype, "recomputeShortening");
            renderItem(120);

            expect(spy).not.toHaveBeenCalled();
        });

        it("recomputes when its width prop changes", () => {
            const spy = vi.spyOn(ShortenedText.prototype, "recomputeShortening");
            const { rerender } = renderItem(120);

            rerender(<DateDatasetsListItem id="d1" title="A dataset name" width={80} onClick={() => {}} />);

            expect(spy).toHaveBeenCalledTimes(1);
        });

        it("does not recompute again on a re-render with the same width", () => {
            const spy = vi.spyOn(ShortenedText.prototype, "recomputeShortening");
            const { rerender } = renderItem(120);

            rerender(<DateDatasetsListItem id="d1" title="A dataset name" width={120} onClick={() => {}} />);

            expect(spy).not.toHaveBeenCalled();
        });
    });
});
