// (C) 2021 GoodData Corporation

import React from "react";
import { KpiComponentProvider } from "../../../presentation";
import { idRef, measureItem } from "@gooddata/sdk-model";
import { IKpiWidget, ILegacyKpi } from "@gooddata/sdk-backend-spi";
import { ReferenceLdm } from "@gooddata/reference-workspace";
import { mount } from "enzyme";
import invariant from "ts-invariant";
import { DefaultKpiCustomizer } from "../kpiCustomizer";
import { DashboardCustomizationLogger } from "../customizationLogging";

//
//
//

const TestKpiWidget: IKpiWidget = {
    type: "kpi",
    title: "Test KPI",
    ref: idRef("testKpi"),
    identifier: "testKpi",
    description: "Test KPI Widget",
    uri: "/uri/testKpi",
    kpi: {
        comparisonDirection: "growIsGood",
        metric: measureItem(ReferenceLdm.Amount),
        comparisonType: "previousPeriod",
    },
    drills: [],
    ignoreDashboardFilters: [],
};
const CustomTitle = "TestTitle";
const TestKpiWidgetWithCustomTitle: IKpiWidget = { ...TestKpiWidget, title: CustomTitle };

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
    predicate: (kpi: ILegacyKpi, widget: IKpiWidget) => boolean,
): KpiComponentProvider {
    const Component = createTestComponent(name);

    return (kpi, widget) => {
        if (!predicate(kpi, widget)) {
            return undefined;
        }

        return Component;
    };
}

function createTestDecoratorFactory(
    name: string,
    predicate: (kpi: ILegacyKpi, widget: IKpiWidget) => boolean,
) {
    return (next: KpiComponentProvider): KpiComponentProvider => {
        return (kpi, widget) => {
            if (!predicate(kpi, widget)) {
                return undefined;
            }

            function Decorator() {
                const Decorated = next(kpi, widget)!;

                return (
                    <div id={name}>
                        <Decorated />
                    </div>
                );
            }

            return Decorator;
        };
    };
}

const DefaultTestComponentProvider: KpiComponentProvider = createTestComponentProvider("default", () => true);

//
//
//

function renderToHtml(customizer: DefaultKpiCustomizer, widget: IKpiWidget) {
    const provider = customizer.getKpiProvider();
    const Component = provider(widget.kpi, widget);

    // this should not happen; if it does something is seriously hosed in the customizer
    invariant(Component);

    const wrapper = mount(<Component />);
    return wrapper.html();
}

describe("KPI customizer", () => {
    let Customizer: DefaultKpiCustomizer;

    beforeEach(() => {
        Customizer = new DefaultKpiCustomizer(
            new DashboardCustomizationLogger(),
            DefaultTestComponentProvider,
        );
    });

    it("should fallback to rendering default component", () => {
        expect(renderToHtml(Customizer, TestKpiWidget)).toMatchSnapshot();
    });

    describe("withCustomProvider", () => {
        it("should work for KPI that matches predicate", () => {
            const provider = createTestComponentProvider(
                "fromCustomProvider",
                (_kpi, widget) => widget.title === CustomTitle,
            );
            Customizer.withCustomProvider(provider);

            expect(renderToHtml(Customizer, TestKpiWidgetWithCustomTitle)).toMatchSnapshot();
        });

        it("should fallback to default component if insight does not match provider criteria", () => {
            const provider = createTestComponentProvider(
                "fromCustomProvider",
                (_kpi, widget) => widget.title === CustomTitle,
            );
            Customizer.withCustomProvider(provider);

            expect(renderToHtml(Customizer, TestKpiWidget)).toMatchSnapshot();
        });

        it("should use component from latest registered provider that matches the insight", () => {
            const provider1 = createTestComponentProvider(
                "fromCustomProvider1",
                (_kpi, widget) => widget.title === CustomTitle,
            );
            const provider2 = createTestComponentProvider(
                "fromCustomProvider2",
                (_kpi, widget) => widget.title === CustomTitle,
            );
            const provider3 = createTestComponentProvider(
                "fromCustomProvider3",
                (_kpi, widget) => widget.title === CustomTitle,
            );
            Customizer.withCustomProvider(provider1);
            Customizer.withCustomProvider(provider2);
            Customizer.withCustomProvider(provider3);

            // component from last registered and matching provider is `fromCustomProvider3`
            expect(renderToHtml(Customizer, TestKpiWidgetWithCustomTitle)).toMatchSnapshot();
        });
    });

    describe("withCustomDecorator", () => {
        it("should decorate default component if no other providers are registered", () => {
            const factory = createTestDecoratorFactory("decorator1", () => true);
            Customizer.withCustomDecorator(factory);

            expect(renderToHtml(Customizer, TestKpiWidget)).toMatchSnapshot();
        });

        it("should decorate custom component registered for an insight", () => {
            const factory = createTestDecoratorFactory("decorator1", () => true);
            Customizer.withCustomDecorator(factory);

            const provider = createTestComponentProvider(
                "fromCustomProvider",
                (_kpi, widget) => widget.title === CustomTitle,
            );
            Customizer.withCustomProvider(provider);

            expect(renderToHtml(Customizer, TestKpiWidgetWithCustomTitle)).toMatchSnapshot();
        });

        it("should decorate default component if insight does not match custom component criteria ", () => {
            const factory = createTestDecoratorFactory("decorator1", () => true);
            Customizer.withCustomDecorator(factory);
            const provider = createTestComponentProvider(
                "fromCustomProvider",
                (_kpi, widget) => widget.title === CustomTitle,
            );
            Customizer.withCustomProvider(provider);

            expect(renderToHtml(Customizer, TestKpiWidget)).toMatchSnapshot();
        });

        it("should decorate if insight matches criteria", () => {
            const factory = createTestDecoratorFactory(
                "decorator1",
                (_kpi, widget) => widget.title === CustomTitle,
            );
            Customizer.withCustomDecorator(factory);

            expect(renderToHtml(Customizer, TestKpiWidgetWithCustomTitle)).toMatchSnapshot();
        });

        it("should not decorate if insight does not match criteria", () => {
            const factory = createTestDecoratorFactory(
                "decorator1",
                (_kpi, widget) => widget.title === CustomTitle,
            );
            Customizer.withCustomDecorator(factory);

            expect(renderToHtml(Customizer, TestKpiWidget)).toMatchSnapshot();
        });

        it("should use multiple decorators if insight matches criteria", () => {
            const factory1 = createTestDecoratorFactory(
                "decorator1",
                (_kpi, widget) => widget.title === CustomTitle,
            );
            const factory2 = createTestDecoratorFactory(
                "decorator2",
                (_kpi, widget) => widget.title === CustomTitle,
            );
            Customizer.withCustomDecorator(factory1);
            Customizer.withCustomDecorator(factory2);

            // decoration starts from last register; so need to see decorator2 -> decorator1 -> default component
            expect(renderToHtml(Customizer, TestKpiWidgetWithCustomTitle)).toMatchSnapshot();
        });

        it("should use multiple decorators and custom component if insight matches criteria", () => {
            const factory1 = createTestDecoratorFactory(
                "decorator1",
                (_kpi, widget) => widget.title === CustomTitle,
            );
            const factory2 = createTestDecoratorFactory(
                "decorator2",
                (_kpi, widget) => widget.title === CustomTitle,
            );
            const provider = createTestComponentProvider(
                "customProvider1",
                (_kpi, widget) => widget.title === CustomTitle,
            );
            Customizer.withCustomDecorator(factory1);
            Customizer.withCustomDecorator(factory2);
            Customizer.withCustomProvider(provider);

            // decoration starts from last register; so need to see decorator2 -> decorator1 -> custom component
            expect(renderToHtml(Customizer, TestKpiWidgetWithCustomTitle)).toMatchSnapshot();
        });

        it("should only use only those decorators that match criteria and then use custom component", () => {
            const factory1 = createTestDecoratorFactory("decorator1", () => false);
            const factory2 = createTestDecoratorFactory(
                "decorator2",
                (_kpi, widget) => widget.title === CustomTitle,
            );
            const provider = createTestComponentProvider(
                "customProvider1",
                (_kpi, widget) => widget.title === CustomTitle,
            );

            Customizer.withCustomDecorator(factory1);
            Customizer.withCustomDecorator(factory2);
            Customizer.withCustomProvider(provider);

            // This will use decorator2 on top of customProvider1
            expect(renderToHtml(Customizer, TestKpiWidgetWithCustomTitle)).toMatchSnapshot();
        });
    });
});
