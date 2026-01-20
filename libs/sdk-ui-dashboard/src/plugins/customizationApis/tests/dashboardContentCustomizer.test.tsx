// (C) 2021-2026 GoodData Corporation

import { type FC } from "react";

import { render } from "@testing-library/react";
import { invariant } from "ts-invariant";
import { beforeEach, describe, expect, it } from "vitest";

import { type IDashboard, type ObjRef } from "@gooddata/sdk-model";

import { EMPTY_MUTATIONS } from "./utils.js";
import {
    type DashboardContentComponentProvider,
    type IDashboardBaseProps,
    type OptionalDashboardContentComponentProvider,
} from "../../../presentation/index.js";
import { DashboardCustomizationLogger } from "../customizationLogging.js";
import { DefaultDashboardContentCustomizer } from "../dashboardContentCustomizer.js";
import { type CustomizerMutationsContext, createCustomizerMutationsContext } from "../types.js";

//
//
//

const TestDashboardContent: string | ObjRef | IDashboard = "default-dashboard";

const TestSecondDashboardContent: string | ObjRef | IDashboard = "second-dashboard";

function createTestComponent(name: string): FC {
    function TestComponent() {
        return <div id={name} />;
    }

    return TestComponent;
}

function createTestComponentProvider(
    name: string,
    predicate: (dashboard?: string | ObjRef | IDashboard) => boolean,
): OptionalDashboardContentComponentProvider {
    const Component = createTestComponent(name);

    return (dashboard) => {
        if (!predicate(dashboard)) {
            return undefined;
        }

        return Component;
    };
}

function createTestDecoratorFactory(
    name: string,
    predicate: (dashboard?: string | ObjRef | IDashboard) => boolean,
) {
    return (next: DashboardContentComponentProvider): OptionalDashboardContentComponentProvider => {
        return (dashboard) => {
            if (!predicate(dashboard)) {
                return undefined;
            }

            function Decorator(props: IDashboardBaseProps) {
                const Decorated = next(dashboard);

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

const DefaultTestComponentProvider: DashboardContentComponentProvider = createTestComponentProvider(
    "default",
    () => true,
) as DashboardContentComponentProvider;

//
//
//

function renderToHtml(
    customizer: DefaultDashboardContentCustomizer,
    dashboard: string | ObjRef | IDashboard,
) {
    const provider = customizer.getDashboardContentProvider();
    const Component = provider(dashboard);
    const dummyProps: IDashboardBaseProps = { dummyDashboardContentProps: true } as any;

    // this should not happen; if it does something is seriously hosed in the customizer
    invariant(Component);

    const { container } = render(<Component {...dummyProps} />);
    return container.innerHTML;
}

describe("Attribute Filter customizer", () => {
    let Customizer: DefaultDashboardContentCustomizer;
    let mutationContext: CustomizerMutationsContext;

    beforeEach(() => {
        mutationContext = createCustomizerMutationsContext();
        Customizer = new DefaultDashboardContentCustomizer(
            new DashboardCustomizationLogger(),
            mutationContext,
            DefaultTestComponentProvider,
        );
    });

    it("should fallback to rendering default component", () => {
        expect(renderToHtml(Customizer, TestDashboardContent)).toMatchSnapshot();
    });

    describe("withCustomDecorator", () => {
        it("should decorate dashboard content component when decorator is registered", () => {
            const factory = createTestDecoratorFactory("decorator1", () => true);
            Customizer.withCustomDecorator(factory);

            expect(renderToHtml(Customizer, TestDashboardContent)).toMatchSnapshot();
            expect(mutationContext).toEqual({
                ...EMPTY_MUTATIONS,
                dashboardContent: ["decorator"],
            });
        });

        it("should decorate if dashboard content matches criteria", () => {
            const factory = createTestDecoratorFactory(
                "decorator1",
                (dashboard) => dashboard === TestSecondDashboardContent,
            );
            Customizer.withCustomDecorator(factory);

            expect(renderToHtml(Customizer, TestSecondDashboardContent)).toMatchSnapshot();
            expect(mutationContext).toEqual({
                ...EMPTY_MUTATIONS,
                dashboardContent: ["decorator"],
            });
        });

        it("should not decorate if dashboard content does not match criteria", () => {
            const factory = createTestDecoratorFactory(
                "decorator1",
                (dashboard) => dashboard === TestSecondDashboardContent,
            );
            Customizer.withCustomDecorator(factory);

            expect(renderToHtml(Customizer, TestDashboardContent)).toMatchSnapshot();
            expect(mutationContext).toEqual({
                ...EMPTY_MUTATIONS,
                dashboardContent: ["decorator"],
            });
        });

        it("should use multiple decorators if attribute filter matches criteria", () => {
            const factory1 = createTestDecoratorFactory(
                "decorator1",
                (dashboard) => dashboard === TestSecondDashboardContent,
            );
            const factory2 = createTestDecoratorFactory(
                "decorator2",
                (dashboard) => dashboard === TestSecondDashboardContent,
            );
            Customizer.withCustomDecorator(factory1);
            Customizer.withCustomDecorator(factory2);

            // decoration starts from last register; so need to see decorator2 -> decorator1 -> default component
            expect(renderToHtml(Customizer, TestSecondDashboardContent)).toMatchSnapshot();
            expect(mutationContext).toEqual({
                ...EMPTY_MUTATIONS,
                dashboardContent: ["decorator"],
            });
        });
    });
});
