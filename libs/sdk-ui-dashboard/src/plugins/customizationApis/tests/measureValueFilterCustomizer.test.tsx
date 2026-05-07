// (C) 2026 GoodData Corporation

import { type FC } from "react";

import { render } from "@testing-library/react";
import { invariant } from "ts-invariant";
import { beforeEach, describe, expect, it } from "vitest";

import { type IDashboardMeasureValueFilter } from "@gooddata/sdk-model";

import {
    type MeasureValueFilterComponentProvider,
    type OptionalMeasureValueFilterComponentProvider,
} from "../../../presentation/dashboardContexts/types.js";
import { type IDashboardMeasureValueFilterProps } from "../../../presentation/filterBar/measureValueFilter/types.js";
import { DashboardCustomizationLogger } from "../customizationLogging.js";
import { DefaultMeasureValueFiltersCustomizer } from "../measureValueFiltersCustomizer.js";
import { type CustomizerMutationsContext, createCustomizerMutationsContext } from "../types.js";
import { EMPTY_MUTATIONS } from "./utils.js";

const TestMeasureValueFilter: IDashboardMeasureValueFilter = {
    dashboardMeasureValueFilter: {
        measure: {
            uri: "/gdc/md/test/measure",
        },
        localIdentifier: "test-measure-value-filter",
        title: "Test MVF Title",
    },
};

const CustomTitle = "TestTitle";

const TestMeasureValueFilterWithCustomTitle: IDashboardMeasureValueFilter = {
    dashboardMeasureValueFilter: {
        ...TestMeasureValueFilter.dashboardMeasureValueFilter,
        title: CustomTitle,
    },
};

function createTestComponent(name: string): FC {
    function TestComponent() {
        return <div id={name} />;
    }

    return TestComponent;
}

function createTestComponentProvider(
    name: string,
    predicate: (filter: IDashboardMeasureValueFilter) => boolean,
): OptionalMeasureValueFilterComponentProvider {
    const Component = createTestComponent(name);

    return (filter) => {
        if (!predicate(filter)) {
            return undefined;
        }

        return Component;
    };
}

const DefaultTestComponentProvider: MeasureValueFilterComponentProvider = createTestComponentProvider(
    "default",
    () => true,
) as MeasureValueFilterComponentProvider;

function measureValueFilterTitle(filter: IDashboardMeasureValueFilter): string | undefined {
    return filter.dashboardMeasureValueFilter.title;
}

function renderToHtml(
    customizer: DefaultMeasureValueFiltersCustomizer,
    filter: IDashboardMeasureValueFilter,
) {
    const provider = customizer.getMeasureValueFilterProvider();
    const Component = provider(filter);
    const dummyProps: IDashboardMeasureValueFilterProps = { dummyMeasureValueFilterProps: true } as any;

    invariant(Component);

    const { container } = render(<Component {...dummyProps} />);
    return container.innerHTML;
}

describe("Measure Value Filter customizer", () => {
    let Customizer: DefaultMeasureValueFiltersCustomizer;
    let mutationContext: CustomizerMutationsContext;

    beforeEach(() => {
        mutationContext = createCustomizerMutationsContext();
        Customizer = new DefaultMeasureValueFiltersCustomizer(
            new DashboardCustomizationLogger(),
            DefaultTestComponentProvider,
        );
    });

    it("should fallback to rendering default component", () => {
        expect(renderToHtml(Customizer, TestMeasureValueFilter)).toMatchSnapshot();
    });

    describe("withCustomProvider", () => {
        it("should work for measure value filter that matches predicate", () => {
            const provider = createTestComponentProvider(
                "fromCustomProvider",
                (filter) => measureValueFilterTitle(filter) === CustomTitle,
            );
            Customizer.withCustomProvider(provider);

            expect(renderToHtml(Customizer, TestMeasureValueFilterWithCustomTitle)).toMatchSnapshot();
            expect(mutationContext).toEqual({
                ...EMPTY_MUTATIONS,
            });
        });

        it("should fallback to default component if measure value filter does not match provider criteria", () => {
            const provider = createTestComponentProvider(
                "fromCustomProvider",
                (filter) => measureValueFilterTitle(filter) === CustomTitle,
            );
            Customizer.withCustomProvider(provider);

            expect(renderToHtml(Customizer, TestMeasureValueFilter)).toMatchSnapshot();
            expect(mutationContext).toEqual({
                ...EMPTY_MUTATIONS,
            });
        });

        it("should use component from latest registered provider that matches the filter", () => {
            const provider1 = createTestComponentProvider(
                "fromCustomProvider1",
                (filter) => measureValueFilterTitle(filter) === CustomTitle,
            );
            const provider2 = createTestComponentProvider(
                "fromCustomProvider2",
                (filter) => measureValueFilterTitle(filter) === CustomTitle,
            );
            const provider3 = createTestComponentProvider(
                "fromCustomProvider3",
                (filter) => measureValueFilterTitle(filter) === CustomTitle,
            );
            Customizer.withCustomProvider(provider1);
            Customizer.withCustomProvider(provider2);
            Customizer.withCustomProvider(provider3);

            expect(renderToHtml(Customizer, TestMeasureValueFilterWithCustomTitle)).toMatchSnapshot();
            expect(mutationContext).toEqual({
                ...EMPTY_MUTATIONS,
            });
        });
    });
});
