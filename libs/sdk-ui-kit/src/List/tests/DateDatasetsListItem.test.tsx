// (C) 2026 GoodData Corporation

import { type ReactNode, forwardRef, useImperativeHandle } from "react";

import { render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import type * as ShortenedTextModule from "../../ShortenedText/ShortenedText.js";
import { type IShortenedTextHandle } from "../../ShortenedText/ShortenedText.js";
import { DateDatasetsListItem } from "../DateDatasetsListItem.js";

const { recomputeShorteningSpy } = vi.hoisted(() => ({ recomputeShorteningSpy: vi.fn() }));

// ShortenedText exposes recomputeShortening only through its imperative ref handle, so the spy has
// to be injected in place of the real component.
vi.mock("../../ShortenedText/ShortenedText.js", async (importOriginal) => {
    const actual = await importOriginal<typeof ShortenedTextModule>();

    return {
        ...actual,
        ShortenedText: forwardRef<IShortenedTextHandle, { children?: ReactNode }>(function ShortenedTextMock(
            { children },
            ref,
        ) {
            useImperativeHandle(ref, () => ({ recomputeShortening: recomputeShorteningSpy }));

            return <span>{children}</span>;
        }),
    };
});

describe("DateDatasetsListItem", () => {
    it("renders the header title as plain text, without treating it as a translation id", () => {
        render(<DateDatasetsListItem isHeader title="Some pre-translated header" onClick={() => {}} />);

        expect(screen.getByText("Some pre-translated header")).toBeInTheDocument();
    });

    describe("remeasures its shortened label when the list resizes", () => {
        afterEach(() => {
            recomputeShorteningSpy.mockClear();
        });

        function renderItem(width: number) {
            return render(
                <DateDatasetsListItem id="d1" title="A dataset name" width={width} onClick={() => {}} />,
            );
        }

        it("does not recompute on mount", () => {
            renderItem(120);

            expect(recomputeShorteningSpy).not.toHaveBeenCalled();
        });

        it("recomputes when its width prop changes", () => {
            const { rerender } = renderItem(120);

            rerender(<DateDatasetsListItem id="d1" title="A dataset name" width={80} onClick={() => {}} />);

            expect(recomputeShorteningSpy).toHaveBeenCalledTimes(1);
        });

        it("does not recompute again on a re-render with the same width", () => {
            const { rerender } = renderItem(120);

            rerender(<DateDatasetsListItem id="d1" title="A dataset name" width={120} onClick={() => {}} />);

            expect(recomputeShorteningSpy).not.toHaveBeenCalled();
        });
    });
});
