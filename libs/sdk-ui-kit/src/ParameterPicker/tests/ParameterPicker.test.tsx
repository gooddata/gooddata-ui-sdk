// (C) 2026 GoodData Corporation

import { fireEvent, render } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { type IParameterMetadataObject, idRef, objRefToString } from "@gooddata/sdk-model";
import { withIntl } from "@gooddata/sdk-ui";

import { ParameterPicker } from "../ParameterPicker.js";

const param = (id: string, title: string, tags: string[] = []): IParameterMetadataObject =>
    ({
        type: "parameter",
        id,
        uri: `/parameters/${id}`,
        ref: idRef(id, "parameter"),
        title,
        description: "",
        tags,
        production: true,
        deprecated: false,
        unlisted: false,
        definition: { type: "NUMBER", defaultValue: 0 },
    }) as IParameterMetadataObject;

const WrappedParameterPicker = withIntl(ParameterPicker);

const renderPicker = (props: Partial<React.ComponentProps<typeof ParameterPicker>> = {}) => {
    return render(
        <WrappedParameterPicker
            parameters={[]}
            excludedKeys={new Set()}
            isLoading={false}
            maxListHeight={400}
            onAdd={() => {}}
            onCancel={() => {}}
            {...props}
        />,
    );
};

describe("ParameterPicker", () => {
    it("renders a loading state when isLoading is true", () => {
        const { container } = renderPicker({ isLoading: true });
        expect(container.querySelector('[data-testid="parameter-picker-loading"]')).not.toBeNull();
    });

    it("renders empty state when there are no parameters", () => {
        const { container } = renderPicker({ parameters: [] });
        expect(container.querySelector('[data-testid="parameter-picker-empty"]')).not.toBeNull();
    });

    it("renders one row per parameter", () => {
        const { container } = renderPicker({
            parameters: [param("a", "Alpha"), param("b", "Beta")],
        });
        expect(container.querySelectorAll('[data-testid="parameter-picker-item"]')).toHaveLength(2);
    });

    it("filters items by search term", () => {
        const { container } = renderPicker({
            parameters: [param("a", "Alpha"), param("b", "Beta")],
        });
        const search = container.querySelector<HTMLInputElement>(
            '[data-testid="parameter-picker-search"] input',
        )!;
        fireEvent.change(search, { target: { value: "alph" } });
        expect(container.querySelectorAll('[data-testid="parameter-picker-item"]')).toHaveLength(1);
    });

    it("groups items by tag and sorts within group alphabetically", () => {
        const { container } = renderPicker({
            parameters: [param("z", "Zebra", ["Animals"]), param("a", "Ant", ["Animals"])],
        });
        const titles = Array.from(container.querySelectorAll('[data-testid="parameter-picker-item"]')).map(
            (el) => el.textContent?.trim(),
        );
        expect(titles).toEqual(["Ant", "Zebra"]);
    });

    it("merges tag variants that differ only in case and whitespace", () => {
        const { container } = renderPicker({
            parameters: [param("a", "Alpha", ["Finance"]), param("b", "Beta", [" finance "])],
        });
        const headers = container.querySelectorAll(".gd-ui-kit-parameter-picker__group-header");
        expect(headers).toHaveLength(1);
        expect(headers[0].textContent).toBe("Finance");
    });

    it("routes parameters with only empty/whitespace tags to the ungrouped bucket", () => {
        const { container } = renderPicker({
            parameters: [param("a", "Alpha", ["", "  "])],
        });
        const headers = container.querySelectorAll(".gd-ui-kit-parameter-picker__group-header");
        expect(headers).toHaveLength(1);
        expect(headers[0].textContent).toBe("Ungrouped");
    });

    it("omits parameters listed in excludedKeys", () => {
        const alpha = param("a", "Alpha");
        const beta = param("b", "Beta");
        const { container } = renderPicker({
            parameters: [alpha, beta],
            excludedKeys: new Set([objRefToString(alpha.ref)]),
        });
        const titles = Array.from(container.querySelectorAll('[data-testid="parameter-picker-item"]')).map(
            (el) => el.textContent?.trim(),
        );
        expect(titles).toEqual(["Beta"]);
    });

    it("renders empty state when every parameter is excluded", () => {
        const alpha = param("a", "Alpha");
        const { container } = renderPicker({
            parameters: [alpha],
            excludedKeys: new Set([objRefToString(alpha.ref)]),
        });
        expect(container.querySelector('[data-testid="parameter-picker-empty"]')).not.toBeNull();
    });

    it("calls onAdd with selected parameters when Add is clicked", () => {
        const onAdd = vi.fn();
        const alpha = param("a", "Alpha");
        const beta = param("b", "Beta");
        const { container } = renderPicker({ parameters: [alpha, beta], onAdd });

        const checkboxes = container.querySelectorAll<HTMLInputElement>(
            '[data-testid="parameter-picker-item"] input[type=checkbox]',
        );
        fireEvent.click(checkboxes[0]);
        fireEvent.click(container.querySelector('[data-testid="parameter-picker-add"]')!);

        expect(onAdd).toHaveBeenCalledWith([alpha]);
    });

    it("disables Add until at least one parameter is selected", () => {
        const { container } = renderPicker({ parameters: [param("a", "Alpha")] });
        const add = container.querySelector<HTMLButtonElement>('[data-testid="parameter-picker-add"]')!;
        expect(add.disabled).toBe(true);
    });

    it("calls onCancel when Cancel is clicked", () => {
        const onCancel = vi.fn();
        const { container } = renderPicker({ onCancel });
        fireEvent.click(container.querySelector('[data-testid="parameter-picker-cancel"]')!);
        expect(onCancel).toHaveBeenCalledTimes(1);
    });

    it("dedupes repeated tags on a single parameter", () => {
        const { container } = renderPicker({
            parameters: [param("a", "Alpha", ["x", "x"])],
        });
        expect(container.querySelectorAll('[data-testid="parameter-picker-item"]')).toHaveLength(1);
    });
});
