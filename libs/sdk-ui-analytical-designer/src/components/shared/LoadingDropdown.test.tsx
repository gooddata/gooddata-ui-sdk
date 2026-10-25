// (C) 2007-2026 GoodData Corporation

import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { LoadingDropdown } from "./LoadingDropdown.js";

describe("LoadingDropdown", () => {
    it("should render component with defined height", () => {
        const height = 10;
        const { container } = render(<LoadingDropdown height={height} />);

        const dropdownLoading = container.querySelector<HTMLElement>(".s-dropdown-loading");
        expect(dropdownLoading).toBeTruthy();
        expect(dropdownLoading.style.height).toBe(`${height}px`);
    });
});
