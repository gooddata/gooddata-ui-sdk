// (C) 2020-2026 GoodData Corporation

import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { RefreshIcon } from "./RefreshIcon.js";

describe("RefreshIcon", () => {
    it("should render RefreshIcon", () => {
        const { container } = render(<RefreshIcon />);
        expect(container.querySelector("svg")).toMatchSnapshot();
    });
});
