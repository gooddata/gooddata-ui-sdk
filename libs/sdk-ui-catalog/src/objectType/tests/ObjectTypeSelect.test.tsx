// (C) 2025 GoodData Corporation

import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { testIds } from "../../automation/index.js";
import { TestIntlProvider } from "../../localization/TestIntlProvider.js";
import { ObjectTypeSelect } from "../ObjectTypeSelect.js";

const wrapper = TestIntlProvider;

describe("ObjectTypeSelect", () => {
    const commonProps: Parameters<typeof ObjectTypeSelect>[0] = {
        selectedTypes: [],
        onSelect: vi.fn(),
        counter: {
            measure: 0,
            fact: 0,
            attribute: 0,
            dataSet: 0,
            insight: 0,
            analyticalDashboard: 0,
        },
    };

    it("renders a button for every object type with accessible label", () => {
        const counter = {
            analyticalDashboard: 1,
            insight: 2,
            measure: 3,
            fact: 4,
            attribute: 5,
            dataSet: 6,
        };
        render(<ObjectTypeSelect {...commonProps} counter={counter} />, { wrapper });

        expect(screen.getByRole("button", { name: "Dashboard: 1" })).toBeInTheDocument();
        expect(screen.getByRole("button", { name: "Visualization: 2" })).toBeInTheDocument();
        expect(screen.getByRole("button", { name: "Metric: 3" })).toBeInTheDocument();
        expect(screen.getByRole("button", { name: "Fact: 4" })).toBeInTheDocument();
        expect(screen.getByRole("button", { name: "Attribute: 5" })).toBeInTheDocument();
        expect(screen.getByRole("button", { name: "Date dataset: 6" })).toBeInTheDocument();
    });

    it("calls onSelect with added type when clicking an unselected type", () => {
        const onSelect = vi.fn();

        render(<ObjectTypeSelect {...commonProps} onSelect={onSelect} />, { wrapper });

        fireEvent.click(screen.getByRole("button", { name: /Dashboard/ }));

        expect(onSelect).toHaveBeenCalledWith(["analyticalDashboard"]);
    });

    it("calls onSelect with removed type when clicking an already selected type", () => {
        const onSelect = vi.fn();

        render(
            <ObjectTypeSelect {...commonProps} selectedTypes={["analyticalDashboard"]} onSelect={onSelect} />,
            { wrapper },
        );

        fireEvent.click(screen.getByRole("button", { name: /Dashboard/ }));

        expect(onSelect).toHaveBeenCalledWith([]);
    });

    it("allows selecting an individual object type using data-testid", () => {
        render(<ObjectTypeSelect {...commonProps} />, { wrapper });

        const objectTypeElements = screen.getAllByTestId(testIds.objectType);
        expect(objectTypeElements.length).toBe(6);

        expect(screen.getByTestId(`${testIds.objectType}/analyticalDashboard`)).toBeVisible();
        expect(screen.getByTestId(`${testIds.objectType}/insight`)).toBeVisible();
        expect(screen.getByTestId(`${testIds.objectType}/measure`)).toBeVisible();
        expect(screen.getByTestId(`${testIds.objectType}/fact`)).toBeVisible();
        expect(screen.getByTestId(`${testIds.objectType}/attribute`)).toBeVisible();
        expect(screen.getByTestId(`${testIds.objectType}/dataSet`)).toBeVisible();
    });
});
