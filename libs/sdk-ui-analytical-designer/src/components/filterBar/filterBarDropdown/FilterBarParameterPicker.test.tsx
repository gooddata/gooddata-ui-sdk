// (C) 2026 GoodData Corporation

import { type ComponentProps } from "react";

import { fireEvent, render } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { type IParameterMetadataObject, type ObjRef, idRef, objRefToString } from "@gooddata/sdk-model";

import { getCatalogParameters, isLoadingItems } from "../../../store/catalog/catalog_selector.js";
import { getActiveParameterRefKeys } from "../../../store/filter_bar/filter_bar_selector.js";
import { withIntl } from "../../../utils/with_intl.js";
import { withRedux } from "../../../utils/with_redux.js";

import { FilterBarParameterPicker } from "./FilterBarParameterPicker.js";

vi.hoisted(() => {
    vi.resetModules();
});

const useSelectorMock = vi.hoisted(() => vi.fn());

vi.mock("react-redux", async () => {
    const actual = await vi.importActual<Record<string, unknown>>("react-redux");
    return {
        ...actual,
        useSelector: (selector: unknown) => useSelectorMock(selector),
    };
});

const param = (
    id: string,
    title: string,
    tags: string[] = [],
    definition: IParameterMetadataObject["definition"] = { type: "NUMBER", defaultValue: 0 },
): IParameterMetadataObject =>
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
        definition,
    }) as unknown as IParameterMetadataObject;

const setSelectorValues = ({
    parameters = [],
    parameterFilterRefs = [],
    isLoading = false,
}: {
    parameters?: ReadonlyArray<IParameterMetadataObject>;
    parameterFilterRefs?: ReadonlyArray<ObjRef>;
    isLoading?: boolean;
} = {}) => {
    const activeParameterRefKeys = new Set(parameterFilterRefs.map(objRefToString));
    useSelectorMock.mockImplementation((selector: unknown) => {
        if (selector === getCatalogParameters) {
            return parameters;
        }
        if (selector === isLoadingItems) {
            return isLoading;
        }
        if (selector === getActiveParameterRefKeys) {
            return activeParameterRefKeys;
        }
        return undefined;
    });
};

const Wrapped = withIntl(withRedux(FilterBarParameterPicker));

const renderComponent = (props?: Partial<ComponentProps<typeof FilterBarParameterPicker>>) => {
    return render(
        <Wrapped maxListHeight={400} onBack={() => {}} onClose={() => {}} onAdd={() => {}} {...props} />,
    );
};

describe("FilterBarParameterPicker", () => {
    beforeEach(() => {
        useSelectorMock.mockReset();
    });

    it("should render a loading spinner while parameters are loading", () => {
        setSelectorValues({ isLoading: true });
        const { container } = renderComponent();
        expect(container.querySelector('[data-testid="parameter-picker-loading"]')).not.toBeNull();
    });

    it("should render empty state when no parameters exist", () => {
        setSelectorValues();
        const { container } = renderComponent();
        expect(container.querySelector('[data-testid="parameter-picker-empty"]')).not.toBeNull();
    });

    it("should render parameter items grouped by tag", () => {
        setSelectorValues({
            parameters: [param("a", "Alpha", ["Group 1"]), param("b", "Beta", ["Group 2"])],
        });
        const { container } = renderComponent();
        expect(container.querySelectorAll('[data-testid="parameter-picker-item"]')).toHaveLength(2);
    });

    it("should filter by search term", () => {
        setSelectorValues({ parameters: [param("a", "Alpha"), param("b", "Beta")] });
        const { container } = renderComponent();
        const search = container.querySelector<HTMLInputElement>(
            '[data-testid="parameter-picker-search"] input',
        )!;
        fireEvent.change(search, { target: { value: "alph" } });
        expect(container.querySelectorAll('[data-testid="parameter-picker-item"]')).toHaveLength(1);
    });

    it("should call onAdd with selected parameters and close", () => {
        const onAdd = vi.fn();
        const onClose = vi.fn();
        const alpha = param("a", "Alpha");
        setSelectorValues({ parameters: [alpha] });
        const { container } = renderComponent({ onAdd, onClose });

        fireEvent.click(
            container.querySelector('[data-testid="parameter-picker-item"] input[type=checkbox]')!,
        );
        fireEvent.click(container.querySelector('[data-testid="parameter-picker-add"]')!);

        expect(onAdd).toHaveBeenCalledWith([alpha]);
        expect(onClose).toHaveBeenCalledTimes(1);
    });

    it("should hide already-filtered parameters from the list", () => {
        const alpha = param("a", "Alpha");
        const beta = param("b", "Beta");
        setSelectorValues({ parameters: [alpha, beta], parameterFilterRefs: [alpha.ref] });
        const { container } = renderComponent();
        const titles = Array.from(container.querySelectorAll('[data-testid="parameter-picker-item"]')).map(
            (el) => el.textContent?.trim(),
        );
        expect(titles).toEqual(["Beta"]);
    });

    it("should show empty state when every parameter is already filtered", () => {
        const alpha = param("a", "Alpha");
        setSelectorValues({ parameters: [alpha], parameterFilterRefs: [alpha.ref] });
        const { container } = renderComponent();
        expect(container.querySelector('[data-testid="parameter-picker-empty"]')).not.toBeNull();
    });

    it("should merge tag variants that differ only in case and whitespace", () => {
        setSelectorValues({
            parameters: [param("a", "Alpha", ["Finance"]), param("b", "Beta", [" finance "])],
        });
        const { container } = renderComponent();
        const headers = container.querySelectorAll(".gd-ui-kit-parameter-picker__group-header");
        expect(headers).toHaveLength(1);
        expect(headers[0].textContent).toBe("Finance");
        expect(container.querySelectorAll('[data-testid="parameter-picker-item"]')).toHaveLength(2);
    });

    it("should sort parameters within a group alphabetically by title", () => {
        setSelectorValues({
            parameters: [param("z", "Zebra", ["Animals"]), param("a", "Ant", ["Animals"])],
        });
        const { container } = renderComponent();
        const titles = Array.from(container.querySelectorAll('[data-testid="parameter-picker-item"]')).map(
            (el) => el.textContent?.trim(),
        );
        expect(titles).toEqual(["Ant", "Zebra"]);
    });

    it("should dedupe repeated tags on a single parameter", () => {
        setSelectorValues({ parameters: [param("a", "Alpha", ["x", "x"])] });
        const { container } = renderComponent();
        expect(container.querySelectorAll('[data-testid="parameter-picker-item"]')).toHaveLength(1);
    });

    it("should route parameters with only empty or whitespace tags to the untagged group", () => {
        setSelectorValues({ parameters: [param("a", "Alpha", ["", "  "])] });
        const { container } = renderComponent();
        const headers = container.querySelectorAll(".gd-ui-kit-parameter-picker__group-header");
        expect(headers).toHaveLength(1);
        expect(headers[0].textContent?.length).toBeGreaterThan(0);
    });
});
