// (C) 2021-2022 GoodData Corporation

import React from "react";
import invariant from "ts-invariant";
import includes from "lodash/includes";
import { render } from "@testing-library/react";
import { IInsight, insightTags, insightTitle, IInsightWidget } from "@gooddata/sdk-model";
import { recordedInsight } from "@gooddata/sdk-backend-mockingbird";
import { ReferenceRecordings } from "@gooddata/reference-workspace";

import { DefaultInsightCustomizer } from "../insightCustomizer";
import { DashboardCustomizationLogger } from "../customizationLogging";

import {
    IDashboardInsightProps,
    InsightComponentProvider,
    OptionalInsightComponentProvider,
} from "../../../presentation";

//
//
//

const TestInsight: IInsight = recordedInsight(
    ReferenceRecordings.Insights.PivotTable.SingleMeasureWithTwoRowAndOneColumnAttributes,
);
const TestInsightWithTag1: IInsight = { insight: { ...TestInsight.insight, tags: ["tag1"] } };
const TestInsightWithTag2: IInsight = { insight: { ...TestInsight.insight, tags: ["tag2"] } };
const TestInsightWithBothTags: IInsight = { insight: { ...TestInsight.insight, tags: ["tag1", "tag2"] } };

const CustomTitle = "TestTitle";
const TestInsightWithCustomTitle: IInsight = { insight: { ...TestInsight.insight, title: CustomTitle } };

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
    predicate: (insight: IInsight, widget: IInsightWidget) => boolean,
): OptionalInsightComponentProvider {
    const Component = createTestComponent(name);

    return (insight, widget) => {
        if (!predicate(insight, widget)) {
            return undefined;
        }

        return Component;
    };
}

function createTestDecoratorFactory(
    name: string,
    predicate: (insight: IInsight, widget: IInsightWidget) => boolean,
) {
    return (next: InsightComponentProvider): OptionalInsightComponentProvider => {
        return (insight, widget) => {
            if (!predicate(insight, widget)) {
                return undefined;
            }

            function Decorator(props: IDashboardInsightProps) {
                const Decorated = next(insight, widget)!;

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

const DefaultTestComponentProvider: InsightComponentProvider = createTestComponentProvider(
    "default",
    () => true,
) as InsightComponentProvider;

//
//
//

// going dirty; the code under test treats insight widget instances opaquely, just passing them around; test
// code does nothing with insight widgets;
const DummyInsightWidget: IInsightWidget = {} as any;

function renderToHtml(customizer: DefaultInsightCustomizer, insight: IInsight) {
    const provider = customizer.getInsightProvider();
    const Component = provider(insight, DummyInsightWidget);
    const dummyProps: IDashboardInsightProps = { dummyInsightProps: true } as any;

    // this should not happen; if it does something is seriously hosed in the customizer
    invariant(Component);

    const { container } = render(<Component {...dummyProps} />);

    return container.innerHTML;
}

describe("insight customizer", () => {
    let Customizer: DefaultInsightCustomizer;

    beforeEach(() => {
        Customizer = new DefaultInsightCustomizer(
            new DashboardCustomizationLogger(),
            DefaultTestComponentProvider,
        );
    });

    it("should fallback to rendering default component", () => {
        expect(renderToHtml(Customizer, TestInsight)).toMatchSnapshot();
    });

    describe("withTag", () => {
        it("should work for insights that includes tag", () => {
            Customizer.withTag("tag1", createTestComponent("forTag1"));

            expect(renderToHtml(Customizer, TestInsightWithTag1)).toMatchSnapshot();
            expect(renderToHtml(Customizer, TestInsightWithBothTags)).toMatchSnapshot();
        });

        it("should fallback to default component if insight does not have tag", () => {
            Customizer.withTag("tag1", createTestComponent("forTag1"));

            expect(renderToHtml(Customizer, TestInsightWithTag2)).toMatchSnapshot();
        });

        it("should use last registered component if insight has both tags", () => {
            Customizer.withTag("tag2", createTestComponent("forTag2"));
            Customizer.withTag("tag1", createTestComponent("forTag1"));
            // component for tag1 was registered last, so the insight that has both tags must be rendered
            // using that component
            expect(renderToHtml(Customizer, TestInsightWithBothTags)).toMatchSnapshot();
        });

        it("should override already registered component for a tag", () => {
            Customizer.withTag("tag1", createTestComponent("forTag1a"));
            Customizer.withTag("tag1", createTestComponent("forTag1b"));
            Customizer.withTag("tag1", createTestComponent("forTag1c"));

            expect(renderToHtml(Customizer, TestInsightWithBothTags)).toMatchSnapshot();
        });

        it("should print a warning if tag is an empty string", () => {
            const logger = new DashboardCustomizationLogger();
            const customizer = new DefaultInsightCustomizer(logger, DefaultTestComponentProvider);

            const consoleSpy = jest.spyOn(logger, "warn");

            customizer.withTag("", createTestComponent("forTag1"));

            expect(consoleSpy).toHaveBeenCalled();

            consoleSpy.mockReset();
            consoleSpy.mockRestore();
        });
    });

    describe("withCustomProvider", () => {
        it("should work for insight that matches predicate", () => {
            const provider = createTestComponentProvider(
                "fromCustomProvider",
                (insight) => insightTitle(insight) === CustomTitle,
            );
            Customizer.withCustomProvider(provider);

            expect(renderToHtml(Customizer, TestInsightWithCustomTitle)).toMatchSnapshot();
        });

        it("should fallback to default component if insight does not match provider criteria", () => {
            const provider = createTestComponentProvider(
                "fromCustomProvider",
                (insight) => insightTitle(insight) === CustomTitle,
            );
            Customizer.withCustomProvider(provider);

            expect(renderToHtml(Customizer, TestInsight)).toMatchSnapshot();
        });

        it("should use component from latest registered provider that matches the insight", () => {
            const provider1 = createTestComponentProvider(
                "fromCustomProvider1",
                (insight) => insightTitle(insight) === CustomTitle,
            );
            const provider2 = createTestComponentProvider(
                "fromCustomProvider2",
                (insight) => insightTitle(insight) === CustomTitle,
            );
            const provider3 = createTestComponentProvider(
                "fromCustomProvider3",
                (insight) => insightTitle(insight) === CustomTitle,
            );
            Customizer.withCustomProvider(provider1);
            Customizer.withCustomProvider(provider2);
            Customizer.withCustomProvider(provider3);

            // component from last registered and matching provider is `fromCustomProvider3`
            expect(renderToHtml(Customizer, TestInsightWithCustomTitle)).toMatchSnapshot();
        });
    });

    describe("withCustomDecorator", () => {
        it("should decorate default component if no other providers are registered", () => {
            const factory = createTestDecoratorFactory("decorator1", () => true);
            Customizer.withCustomDecorator(factory);

            expect(renderToHtml(Customizer, TestInsight)).toMatchSnapshot();
        });

        it("should decorate custom component registered for an insight", () => {
            const factory = createTestDecoratorFactory("decorator1", () => true);
            Customizer.withCustomDecorator(factory);
            Customizer.withTag("tag1", createTestComponent("forTag1"));

            expect(renderToHtml(Customizer, TestInsightWithTag1)).toMatchSnapshot();
        });

        it("should decorate default component if insight does not match custom component criteria ", () => {
            const factory = createTestDecoratorFactory("decorator1", () => true);
            Customizer.withCustomDecorator(factory);
            Customizer.withTag("tag1", createTestComponent("forTag1"));

            expect(renderToHtml(Customizer, TestInsightWithTag2)).toMatchSnapshot();
        });

        it("should decorate if insight matches criteria", () => {
            const factory = createTestDecoratorFactory(
                "decorator1",
                (insight) => insightTitle(insight) === CustomTitle,
            );
            Customizer.withCustomDecorator(factory);

            expect(renderToHtml(Customizer, TestInsightWithCustomTitle)).toMatchSnapshot();
        });

        it("should not decorate if insight does not match criteria", () => {
            const factory = createTestDecoratorFactory(
                "decorator1",
                (insight) => insightTitle(insight) === CustomTitle,
            );
            Customizer.withCustomDecorator(factory);

            expect(renderToHtml(Customizer, TestInsight)).toMatchSnapshot();
        });

        it("should use multiple decorators if insight matches criteria", () => {
            const factory1 = createTestDecoratorFactory(
                "decorator1",
                (insight) => insightTitle(insight) === CustomTitle,
            );
            const factory2 = createTestDecoratorFactory(
                "decorator2",
                (insight) => insightTitle(insight) === CustomTitle,
            );
            Customizer.withCustomDecorator(factory1);
            Customizer.withCustomDecorator(factory2);

            // decoration starts from last register; so need to see decorator2 -> decorator1 -> default component
            expect(renderToHtml(Customizer, TestInsightWithCustomTitle)).toMatchSnapshot();
        });

        it("should use multiple decorators and custom component if insight matches criteria", () => {
            const factory1 = createTestDecoratorFactory(
                "decorator1",
                (insight) => insightTitle(insight) === CustomTitle,
            );
            const factory2 = createTestDecoratorFactory(
                "decorator2",
                (insight) => insightTitle(insight) === CustomTitle,
            );
            const provider = createTestComponentProvider(
                "customProvider1",
                (insight) => insightTitle(insight) === CustomTitle,
            );
            Customizer.withCustomDecorator(factory1);
            Customizer.withCustomDecorator(factory2);
            Customizer.withCustomProvider(provider);

            // decoration starts from last register; so need to see decorator2 -> decorator1 -> custom component
            expect(renderToHtml(Customizer, TestInsightWithCustomTitle)).toMatchSnapshot();
        });

        it("should only use only those decorators that match criteria and then use custom component", () => {
            const factory1 = createTestDecoratorFactory("decorator1", (insight) =>
                includes(insightTags(insight), "tag1"),
            );
            const factory2 = createTestDecoratorFactory(
                "decorator2",
                (insight) => insightTitle(insight) === CustomTitle,
            );
            Customizer.withCustomDecorator(factory1);
            Customizer.withCustomDecorator(factory2);
            Customizer.withTag("tag1", createTestComponent("forTag1"));

            // This will use decorator1 on top of forTag1
            expect(renderToHtml(Customizer, TestInsightWithTag1)).toMatchSnapshot();
        });
    });
});
