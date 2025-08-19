// (C) 2025 GoodData Corporation

import React from "react";

import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { TestIntlProvider } from "../../localization/TestIntlProvider.js";
import { ObjectTypeSelect } from "../ObjectTypeSelect.js";

const wrapper = TestIntlProvider;

describe("ObjectTypeSelect", () => {
    it("renders a button for every object type with accessible label", () => {
        const onSelect = vi.fn();

        render(<ObjectTypeSelect selectedTypes={[]} onSelect={onSelect} />, { wrapper });

        expect(screen.getByRole("button", { name: "Dashboard" })).toBeInTheDocument();
        expect(screen.getByRole("button", { name: "Visualization" })).toBeInTheDocument();
        expect(screen.getByRole("button", { name: "Metric" })).toBeInTheDocument();
        expect(screen.getByRole("button", { name: "Fact" })).toBeInTheDocument();
        expect(screen.getByRole("button", { name: "Attribute" })).toBeInTheDocument();
    });

    it("calls onSelect with added type when clicking an unselected type", () => {
        const onSelect = vi.fn();

        render(<ObjectTypeSelect selectedTypes={[]} onSelect={onSelect} />, { wrapper });

        fireEvent.click(screen.getByRole("button", { name: "Dashboard" }));

        expect(onSelect).toHaveBeenCalledWith(["dashboard"]);
    });

    it("calls onSelect with removed type when clicking an already selected type", () => {
        const onSelect = vi.fn();

        render(<ObjectTypeSelect selectedTypes={["dashboard"]} onSelect={onSelect} />, { wrapper });

        fireEvent.click(screen.getByRole("button", { name: "Dashboard" }));

        expect(onSelect).toHaveBeenCalledWith([]);
    });
});
