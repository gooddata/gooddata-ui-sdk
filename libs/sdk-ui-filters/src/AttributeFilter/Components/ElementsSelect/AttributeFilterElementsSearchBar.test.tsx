// (C) 2026 GoodData Corporation

import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { withIntlForTest } from "@gooddata/sdk-ui";

import { AttributeFilterElementsSearchBar } from "./AttributeFilterElementsSearchBar.js";

const Wrapped = withIntlForTest(AttributeFilterElementsSearchBar);

const pressEscape = () =>
    fireEvent.keyDown(screen.getByRole("searchbox"), { key: "Escape", keyCode: 27, which: 27 });

describe("AttributeFilterElementsSearchBar", () => {
    it("lets Escape reach the dropdown when the search is empty", () => {
        const onParentKeyDown = vi.fn();
        render(
            <div onKeyDown={onParentKeyDown}>
                <Wrapped searchString="" onSearch={vi.fn()} />
            </div>,
        );

        pressEscape();

        expect(onParentKeyDown).toHaveBeenCalledTimes(1);
    });

    it("keeps Escape from the dropdown while it clears a filled search", () => {
        const onParentKeyDown = vi.fn();
        const onSearch = vi.fn();
        render(
            <div onKeyDown={onParentKeyDown}>
                <Wrapped searchString="abc" onSearch={onSearch} />
            </div>,
        );

        pressEscape();

        expect(onSearch).toHaveBeenCalledWith("", undefined);
        expect(onParentKeyDown).not.toHaveBeenCalled();
    });
});
