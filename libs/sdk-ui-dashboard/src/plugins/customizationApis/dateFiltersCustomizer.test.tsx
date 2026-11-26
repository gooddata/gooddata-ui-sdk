// (C) 2026 GoodData Corporation

import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import {
    type IDashboardAbsoluteGranularityDateFilter,
    newRelativeDashboardDateFilter,
} from "@gooddata/sdk-model";

import { type DateFilterOfAnyTypeComponentProvider } from "../../presentation/dashboardContexts/types.js";
import {
    type CustomDashboardDateFilterOfAnyTypeComponent,
    type IDashboardDateFilterOfAnyTypeProps,
    type IDashboardDateFilterProps,
} from "../../presentation/filterBar/dateFilter/types.js";

import { DefaultDateFiltersCustomizer } from "./dateFiltersCustomizer.js";
import { TestingDashboardCustomizationLogger } from "./TestingDashboardCustomizationLogger.test.helpers.js";

const oldTypeFilter = newRelativeDashboardDateFilter("GDC.time.year", -1, -1);
const newTypeFilter: IDashboardAbsoluteGranularityDateFilter = {
    dashboardAbsoluteGranularityDateFilter: {
        granularity: "GDC.time.month",
        from: "2026-01",
        to: "2026-03",
    },
};

const DefaultComponent = (() => null) as CustomDashboardDateFilterOfAnyTypeComponent;
const AnyTypeComponent = (() => null) as CustomDashboardDateFilterOfAnyTypeComponent;
const defaultProvider: DateFilterOfAnyTypeComponentProvider = () => DefaultComponent;

const oldKindComponentProps = vi.fn();
function OldKindComponent(props: IDashboardDateFilterProps) {
    oldKindComponentProps(props);
    return (
        <button onClick={() => props.onFilterChanged(oldTypeFilter, "opt")} type="button">
            change
        </button>
    );
}

function anyTypeProps(
    overrides: Partial<IDashboardDateFilterOfAnyTypeProps> = {},
): IDashboardDateFilterOfAnyTypeProps {
    return {
        filter: oldTypeFilter,
        workingFilter: undefined,
        onFilterChanged: vi.fn(),
        config: { availableGranularities: [], dateFilterOptions: {} },
        ...overrides,
    };
}

describe("date filters customizer", () => {
    let Customizer: DefaultDateFiltersCustomizer;
    let mockWarn: (message: string, ...optionalParams: unknown[]) => void;

    beforeEach(() => {
        mockWarn = vi.fn();
        Customizer = new DefaultDateFiltersCustomizer(
            new TestingDashboardCustomizationLogger({ warn: mockWarn }),
            defaultProvider,
        );
        oldKindComponentProps.mockClear();
    });

    const resolve = (filter: typeof oldTypeFilter | typeof newTypeFilter) =>
        Customizer.getDateFilterOfAnyTypeProvider()(filter);

    it("renders both types by the default component", () => {
        expect(resolve(oldTypeFilter)).toBe(DefaultComponent);
        expect(resolve(newTypeFilter)).toBe(DefaultComponent);
    });

    it("renders the old type by a component of a provider of the old kind", () => {
        Customizer.withCustomProvider(() => OldKindComponent);
        const Component = resolve(oldTypeFilter);

        render(<Component {...anyTypeProps()} />);

        expect(oldKindComponentProps).toHaveBeenCalledWith(
            expect.objectContaining({ filter: oldTypeFilter }),
        );
    });

    it("calls the callback when the component of a provider of the old kind changes the filter", () => {
        Customizer.withCustomProvider(() => OldKindComponent);
        const Component = resolve(oldTypeFilter);
        const onFilterChanged = vi.fn();

        render(<Component {...anyTypeProps({ onFilterChanged })} />);
        fireEvent.click(screen.getByText("change"));

        expect(onFilterChanged).toHaveBeenCalledWith(oldTypeFilter, "opt");
    });

    it("returns the same component of a provider of the old kind on every resolution", () => {
        Customizer.withCustomProvider(() => OldKindComponent);

        expect(resolve(oldTypeFilter)).toBe(resolve(oldTypeFilter));
    });

    it("passes neither whole periods nor a working filter with granularity to a component of the old kind", () => {
        Customizer.withCustomProvider(() => OldKindComponent);
        const Component = resolve(oldTypeFilter);

        render(
            <Component
                {...anyTypeProps({
                    workingFilter: newTypeFilter,
                    isAbsoluteDateFilterGranularityEnabled: true,
                })}
            />,
        );

        const props = oldKindComponentProps.mock.calls[0][0];
        expect(props.workingFilter).toBeUndefined();
        expect(props).not.toHaveProperty("isAbsoluteDateFilterGranularityEnabled");
    });

    it("skips a provider of the old kind for the new type", () => {
        const provider = vi.fn(() => OldKindComponent);
        Customizer.withCustomProvider(provider);

        expect(resolve(newTypeFilter)).toBe(DefaultComponent);
        expect(provider).not.toHaveBeenCalled();
    });

    it("renders both types by a provider of any type", () => {
        const provider = vi.fn(() => AnyTypeComponent);
        Customizer.withCustomProviderOfAnyType(provider);

        expect(resolve(oldTypeFilter)).toBe(AnyTypeComponent);
        expect(resolve(newTypeFilter)).toBe(AnyTypeComponent);
        expect(provider).toHaveBeenCalledWith(newTypeFilter);
    });

    it("lets the provider registered last win across both kinds", () => {
        Customizer.withCustomProviderOfAnyType(() => AnyTypeComponent);
        Customizer.withCustomProvider(() => OldKindComponent);

        expect(resolve(oldTypeFilter)).not.toBe(AnyTypeComponent);
        expect(resolve(newTypeFilter)).toBe(AnyTypeComponent);

        Customizer.withCustomProviderOfAnyType(() => DefaultComponent);

        expect(resolve(oldTypeFilter)).toBe(DefaultComponent);
    });

    it("falls back to an earlier provider when the later one returns undefined", () => {
        Customizer.withCustomProviderOfAnyType(() => AnyTypeComponent);
        Customizer.withCustomProvider(() => undefined);

        expect(resolve(oldTypeFilter)).toBe(AnyTypeComponent);
    });

    it("ignores providers registered after sealing", () => {
        Customizer.sealCustomizer();
        Customizer.withCustomProviderOfAnyType(() => AnyTypeComponent);
        Customizer.withCustomProvider(() => OldKindComponent);

        expect(mockWarn).toHaveBeenCalledTimes(2);
        expect(resolve(oldTypeFilter)).toBe(DefaultComponent);
    });
});
