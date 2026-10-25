// (C) 2019-2026 GoodData Corporation

import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { withIntl } from "../../../utils/with_intl.js";

import { DropdownButtonValue, type IDropdownButtonValueOwnProps } from "./DropdownButtonValue.js";

const FRENCH_SEPARATORS = {
    thousand: " ",
    decimal: ",",
};

function createComponent(customProps?: Partial<IDropdownButtonValueOwnProps>) {
    const defaultProps: IDropdownButtonValueOwnProps = {
        condition: null,
        usePercentage: false,
    };
    const Wrapped = withIntl(DropdownButtonValue);
    return render(<Wrapped {...defaultProps} {...customProps} />);
}

describe("DropdownButtonValue", () => {
    it("should render 'All' when no condition is provided", () => {
        const { container } = createComponent();
        expect(container.textContent).toEqual("All");
    });

    describe("comparison condition", () => {
        it.each`
            operator                      | value | result
            ${"GREATER_THAN"}             | ${10} | ${"> 10"}
            ${"GREATER_THAN_OR_EQUAL_TO"} | ${10} | ${"≥ 10"}
            ${"LESS_THAN"}                | ${10} | ${"< 10"}
            ${"LESS_THAN_OR_EQUAL_TO"}    | ${10} | ${"≤ 10"}
            ${"EQUAL_TO"}                 | ${10} | ${"= 10"}
            ${"NOT_EQUAL_TO"}             | ${10} | ${"≠ 10"}
        `(
            "should render '$result' when condition contains $operator operator",
            ({ operator, value, result }) => {
                const { container } = createComponent({ condition: { comparison: { operator, value } } });
                expect(container.textContent).toEqual(result);
            },
        );

        it("should compensate for JavaScript multiplication result precision problem for comparison filter with percentage", () => {
            const { container } = createComponent({
                condition: {
                    comparison: { operator: "GREATER_THAN", value: 1.11 },
                },
                usePercentage: true,
            });
            expect(container.textContent).toEqual("> 111%");
        });
    });

    describe("range condition", () => {
        it.each`
            operator         | from  | to    | result
            ${"BETWEEN"}     | ${10} | ${20} | ${"between 10 and 20"}
            ${"NOT_BETWEEN"} | ${10} | ${20} | ${"not between 10 and 20"}
        `(
            "should render '$result' when condition contains $operator operator",
            ({ operator, from, to, result }) => {
                const { container } = createComponent({ condition: { range: { operator, from, to } } });
                expect(container.textContent).toEqual(result);
            },
        );

        it("should compensate for JavaScript multiplication result precision problem for range filter with percentage", () => {
            const { container } = createComponent({
                condition: {
                    range: { operator: "BETWEEN", from: 1.11, to: 4.44 },
                },
                usePercentage: true,
            });
            expect(container.textContent).toEqual("between 111% and 444%");
        });
    });

    it("should render multiple conditions joined by 'or'", () => {
        const { container } = createComponent({
            conditions: [
                { range: { operator: "BETWEEN", from: 10, to: 20 } },
                { range: { operator: "BETWEEN", from: 400, to: 500 } },
            ],
        });

        expect(container.textContent).toEqual("between 10 and 20 or 400 and 500");
    });

    it("should group multiple conditions by operator and not repeat operator label within the group", () => {
        const { container } = createComponent({
            conditions: [
                { range: { operator: "BETWEEN", from: 10, to: 20 } },
                { comparison: { operator: "LESS_THAN", value: 5 } },
                { range: { operator: "BETWEEN", from: 400, to: 500 } },
            ],
        });

        // BETWEEN group comes first (first operator), then LESS_THAN group.
        expect(container.textContent).toEqual("between 10 and 20 or 400 and 500 or < 5");
    });

    describe("value shortening", () => {
        it.each`
            operator          | value          | separators           | result
            ${"GREATER_THAN"} | ${1234567.89}  | ${undefined}         | ${"> 1,234,567.89"}
            ${"GREATER_THAN"} | ${1000}        | ${undefined}         | ${"> 1K"}
            ${"GREATER_THAN"} | ${-1000}       | ${undefined}         | ${"> -1K"}
            ${"GREATER_THAN"} | ${1100}        | ${undefined}         | ${"> 1.1K"}
            ${"GREATER_THAN"} | ${-1100}       | ${undefined}         | ${"> -1.1K"}
            ${"GREATER_THAN"} | ${6661100}     | ${undefined}         | ${"> 6,661.1K"}
            ${"GREATER_THAN"} | ${-6661100}    | ${undefined}         | ${"> -6,661.1K"}
            ${"GREATER_THAN"} | ${11000}       | ${undefined}         | ${"> 11K"}
            ${"GREATER_THAN"} | ${1000000}     | ${undefined}         | ${"> 1M"}
            ${"GREATER_THAN"} | ${1100000}     | ${undefined}         | ${"> 1.1M"}
            ${"GREATER_THAN"} | ${11000000}    | ${undefined}         | ${"> 11M"}
            ${"GREATER_THAN"} | ${1000000000}  | ${undefined}         | ${"> 1B"}
            ${"GREATER_THAN"} | ${1100000000}  | ${undefined}         | ${"> 1.1B"}
            ${"GREATER_THAN"} | ${11000000000} | ${undefined}         | ${"> 11B"}
            ${"GREATER_THAN"} | ${1234567.89}  | ${FRENCH_SEPARATORS} | ${"> 1 234 567,89"}
        `("should render '$result'", ({ operator, value, separators, result }) => {
            const { container } = createComponent({
                condition: { comparison: { operator, value } },
                separators,
            });
            expect(container.textContent).toEqual(result);
        });
    });

    describe("dimensionality", () => {
        const dimItem = (title: string) => ({
            identifier: { localIdentifier: title.toLowerCase() },
            title,
            type: "attribute" as const,
        });

        it.each`
            dimensionality                                               | result
            ${[]}                                                        | ${"> 10"}
            ${undefined}                                                 | ${"> 10"}
            ${[dimItem("Product")]}                                      | ${"> 10 for each Product"}
            ${[dimItem("Product"), dimItem("Brand")]}                    | ${"> 10 for each Product, Brand"}
            ${[dimItem("Product"), dimItem("Brand"), dimItem("Region")]} | ${"> 10 for each Product, Brand, Region"}
        `("should render '$result'", ({ dimensionality, result }) => {
            const { container } = createComponent({
                condition: { comparison: { operator: "GREATER_THAN", value: 10 } },
                dimensionality,
            });
            expect(container.textContent).toEqual(result);
        });

        it.each`
            condition                                                   | usePercentage | result
            ${{ range: { operator: "BETWEEN", from: 10, to: 20 } }}     | ${false}      | ${"between 10 and 20 for each Product"}
            ${null}                                                     | ${false}      | ${"All for each Product"}
            ${{ comparison: { operator: "GREATER_THAN", value: 0.5 } }} | ${true}       | ${"> 50% for each Product"}
        `(
            "should render '$result' with different condition types",
            ({ condition, usePercentage, result }) => {
                const { container } = createComponent({
                    condition,
                    usePercentage,
                    dimensionality: [dimItem("Product")],
                });
                expect(container.textContent).toEqual(result);
            },
        );
    });
});
