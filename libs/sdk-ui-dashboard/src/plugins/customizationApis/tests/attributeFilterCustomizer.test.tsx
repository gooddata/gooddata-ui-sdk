// (C) 2021-2025 GoodData Corporation

import React from "react";

import { render } from "@testing-library/react";
import { invariant } from "ts-invariant";
import { beforeEach, describe, expect, it } from "vitest";

import { IDashboardAttributeFilter } from "@gooddata/sdk-model";

import { EMPTY_MUTATIONS } from "./utils.js";
import {
    AttributeFilterComponentProvider,
    IDashboardAttributeFilterProps,
    OptionalAttributeFilterComponentProvider,
} from "../../../presentation/index.js";
import { DefaultAttributeFiltersCustomizer } from "../attributeFiltersCustomizer.js";
import { DashboardCustomizationLogger } from "../customizationLogging.js";
import { CustomizerMutationsContext, createCustomizerMutationsContext } from "../types.js";

//
//
//

const TestAttributeFilter: IDashboardAttributeFilter = {
    attributeFilter: {
        attributeElements: {
            uris: [],
        },
        displayForm: {
            uri: "/gdc/md/test/attribute-filter",
        },
        filterElementsBy: [],
        localIdentifier: "test-attribute-filter",
        negativeSelection: true,
        title: "Test Attr Filter Title",
    },
};

const CustomTitle = "TestTitle";

const TestAttributeFilterWithCustomTitle: IDashboardAttributeFilter = {
    attributeFilter: { ...TestAttributeFilter.attributeFilter, title: CustomTitle },
};

//
//
//

function createTestComponent(name: string): React.FC {
    function TestComponent() {
        return <div id={name} />;
    }

    return TestComponent;
}

function createTestComponentProvider(
    name: string,
    predicate: (filter: IDashboardAttributeFilter) => boolean,
): OptionalAttributeFilterComponentProvider {
    const Component = createTestComponent(name);

    return (filter) => {
        if (!predicate(filter)) {
            return undefined;
        }

        return Component;
    };
}

function createTestDecoratorFactory(name: string, predicate: (filter: IDashboardAttributeFilter) => boolean) {
    return (next: AttributeFilterComponentProvider): OptionalAttributeFilterComponentProvider => {
        return (filter) => {
            if (!predicate(filter)) {
                return undefined;
            }

            function Decorator(props: IDashboardAttributeFilterProps) {
                const Decorated = next(filter)!;

                return (
                    <div id={name}>
                        <Decorated {...props} />
                    </div>
                );
            }

            return Decorator;
        };
    };
}

const DefaultTestComponentProvider: AttributeFilterComponentProvider = createTestComponentProvider(
    "default",
    () => true,
) as AttributeFilterComponentProvider;

//
//
//

function renderToHtml(customizer: DefaultAttributeFiltersCustomizer, filter: IDashboardAttributeFilter) {
    const provider = customizer.getAttributeFilterProvider();
    const Component = provider(filter);
    const dummyProps: IDashboardAttributeFilterProps = { dummyAttributeFilterProps: true } as any;

    // this should not happen; if it does something is seriously hosed in the customizer
    invariant(Component);

    const { container } = render(<Component {...dummyProps} />);
    return container.innerHTML;
}

describe("Attribute Filter customizer", () => {
    let Customizer: DefaultAttributeFiltersCustomizer;
    let mutationContext: CustomizerMutationsContext;

    beforeEach(() => {
        mutationContext = createCustomizerMutationsContext();
        Customizer = new DefaultAttributeFiltersCustomizer(
            new DashboardCustomizationLogger(),
            mutationContext,
            DefaultTestComponentProvider,
        );
    });

    it("should fallback to rendering default component", () => {
        expect(renderToHtml(Customizer, TestAttributeFilter)).toMatchSnapshot();
    });

    describe("withCustomProvider", () => {
        it("should work for attribute filter that matches predicate", () => {
            const provider = createTestComponentProvider(
                "fromCustomProvider",
                (filter) => filter.attributeFilter.title === CustomTitle,
            );
            Customizer.withCustomProvider(provider);

            expect(renderToHtml(Customizer, TestAttributeFilterWithCustomTitle)).toMatchSnapshot();
            expect(mutationContext).toEqual({
                ...EMPTY_MUTATIONS,
                attributeFilter: ["provider"],
            });
        });

        it("should fallback to default component if attribute filter does not match provider criteria", () => {
            const provider = createTestComponentProvider(
                "fromCustomProvider",
                (filter) => filter.attributeFilter.title === CustomTitle,
            );
            Customizer.withCustomProvider(provider);

            expect(renderToHtml(Customizer, TestAttributeFilter)).toMatchSnapshot();
            expect(mutationContext).toEqual({
                ...EMPTY_MUTATIONS,
                attributeFilter: ["provider"],
            });
        });

        it("should use component from latest registered provider that matches the filter", () => {
            const provider1 = createTestComponentProvider(
                "fromCustomProvider1",
                (filter) => filter.attributeFilter.title === CustomTitle,
            );
            const provider2 = createTestComponentProvider(
                "fromCustomProvider2",
                (filter) => filter.attributeFilter.title === CustomTitle,
            );
            const provider3 = createTestComponentProvider(
                "fromCustomProvider3",
                (filter) => filter.attributeFilter.title === CustomTitle,
            );
            Customizer.withCustomProvider(provider1);
            Customizer.withCustomProvider(provider2);
            Customizer.withCustomProvider(provider3);

            // component from last registered and matching provider is `fromCustomProvider3`
            expect(renderToHtml(Customizer, TestAttributeFilterWithCustomTitle)).toMatchSnapshot();
            expect(mutationContext).toEqual({
                ...EMPTY_MUTATIONS,
                attributeFilter: ["provider"],
            });
        });
    });

    describe("withCustomDecorator", () => {
        it("should decorate default component if no other providers are registered", () => {
            const factory = createTestDecoratorFactory("decorator1", () => true);
            Customizer.withCustomDecorator(factory);

            expect(renderToHtml(Customizer, TestAttributeFilter)).toMatchSnapshot();
            expect(mutationContext).toEqual({
                ...EMPTY_MUTATIONS,
                attributeFilter: ["decorator"],
            });
        });

        it("should decorate custom component registered for an attribute filter", () => {
            const factory = createTestDecoratorFactory("decorator1", () => true);
            Customizer.withCustomDecorator(factory);

            const provider = createTestComponentProvider(
                "fromCustomProvider",
                (filter) => filter.attributeFilter.title === CustomTitle,
            );
            Customizer.withCustomProvider(provider);

            expect(renderToHtml(Customizer, TestAttributeFilterWithCustomTitle)).toMatchSnapshot();
            expect(mutationContext).toEqual({
                ...EMPTY_MUTATIONS,
                attributeFilter: ["decorator", "provider"],
            });
        });

        it("should decorate default component if attribute filter does not match custom component criteria ", () => {
            const factory = createTestDecoratorFactory("decorator1", () => true);
            Customizer.withCustomDecorator(factory);
            const provider = createTestComponentProvider(
                "fromCustomProvider",
                (filter) => filter.attributeFilter.title === CustomTitle,
            );
            Customizer.withCustomProvider(provider);

            expect(renderToHtml(Customizer, TestAttributeFilter)).toMatchSnapshot();
            expect(mutationContext).toEqual({
                ...EMPTY_MUTATIONS,
                attributeFilter: ["decorator", "provider"],
            });
        });

        it("should decorate if attribute filter matches criteria", () => {
            const factory = createTestDecoratorFactory(
                "decorator1",
                (filter) => filter.attributeFilter.title === CustomTitle,
            );
            Customizer.withCustomDecorator(factory);

            expect(renderToHtml(Customizer, TestAttributeFilterWithCustomTitle)).toMatchSnapshot();
            expect(mutationContext).toEqual({
                ...EMPTY_MUTATIONS,
                attributeFilter: ["decorator"],
            });
        });

        it("should not decorate if attribute filter does not match criteria", () => {
            const factory = createTestDecoratorFactory(
                "decorator1",
                (filter) => filter.attributeFilter.title === CustomTitle,
            );
            Customizer.withCustomDecorator(factory);

            expect(renderToHtml(Customizer, TestAttributeFilter)).toMatchSnapshot();
            expect(mutationContext).toEqual({
                ...EMPTY_MUTATIONS,
                attributeFilter: ["decorator"],
            });
        });

        it("should use multiple decorators if attribute filter matches criteria", () => {
            const factory1 = createTestDecoratorFactory(
                "decorator1",
                (filter) => filter.attributeFilter.title === CustomTitle,
            );
            const factory2 = createTestDecoratorFactory(
                "decorator2",
                (filter) => filter.attributeFilter.title === CustomTitle,
            );
            Customizer.withCustomDecorator(factory1);
            Customizer.withCustomDecorator(factory2);

            // decoration starts from last register; so need to see decorator2 -> decorator1 -> default component
            expect(renderToHtml(Customizer, TestAttributeFilterWithCustomTitle)).toMatchSnapshot();
            expect(mutationContext).toEqual({
                ...EMPTY_MUTATIONS,
                attributeFilter: ["decorator"],
            });
        });

        it("should use multiple decorators and custom component if attribute fiter matches criteria", () => {
            const factory1 = createTestDecoratorFactory(
                "decorator1",
                (filter) => filter.attributeFilter.title === CustomTitle,
            );
            const factory2 = createTestDecoratorFactory(
                "decorator2",
                (filter) => filter.attributeFilter.title === CustomTitle,
            );
            const provider = createTestComponentProvider(
                "customProvider1",
                (filter) => filter.attributeFilter.title === CustomTitle,
            );
            Customizer.withCustomDecorator(factory1);
            Customizer.withCustomDecorator(factory2);
            Customizer.withCustomProvider(provider);

            // decoration starts from last register; so need to see decorator2 -> decorator1 -> custom component
            expect(renderToHtml(Customizer, TestAttributeFilterWithCustomTitle)).toMatchSnapshot();
            expect(mutationContext).toEqual({
                ...EMPTY_MUTATIONS,
                attributeFilter: ["decorator", "provider"],
            });
        });

        it("should only use only those decorators that match criteria and then use custom component", () => {
            const factory1 = createTestDecoratorFactory("decorator1", () => false);
            const factory2 = createTestDecoratorFactory(
                "decorator2",
                (filter) => filter.attributeFilter.title === CustomTitle,
            );
            const provider = createTestComponentProvider(
                "customProvider1",
                (filter) => filter.attributeFilter.title === CustomTitle,
            );

            Customizer.withCustomDecorator(factory1);
            Customizer.withCustomDecorator(factory2);
            Customizer.withCustomProvider(provider);

            // This will use decorator2 on top of customProvider1
            expect(renderToHtml(Customizer, TestAttributeFilterWithCustomTitle)).toMatchSnapshot();
            expect(mutationContext).toEqual({
                ...EMPTY_MUTATIONS,
                attributeFilter: ["decorator", "provider"],
            });
        });
    });
});
