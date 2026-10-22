// (C) 2026 GoodData Corporation

import { act, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { render } from "../../../test/render.js";

import { UiSearchResultsAnnouncement } from "./UiSearchResultsAnnouncement.js";

describe("UiSearchResultsAnnouncement", () => {
    afterEach(() => {
        vi.useRealTimers();
    });

    it("should announce a custom text when there are no results", async () => {
        vi.useFakeTimers();
        render(<UiSearchResultsAnnouncement totalResults={0} noResultsText="Custom no results text." />);

        // The announcement waits a second, so that a screen reader first reads the letter typed in the search
        await act(() => vi.advanceTimersByTimeAsync(1000));

        expect(screen.getByRole("status")).toHaveTextContent("Custom no results text.");
    });
});
