// (C) 2021-2026 GoodData Corporation

import { render } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { type IDashboard, idRef } from "@gooddata/sdk-model";
import { suppressConsole } from "@gooddata/util";

import { TestingDashboardCustomizationLogger } from "./fixtures/TestingDashboardCustomizationLogger.js";
import { EMPTY_MUTATIONS } from "./utils.js";
import { type ExtendedDashboardWidget } from "../../../model/types/layoutTypes.js";
import { type IDashboardLayoutProps } from "../../../presentation/widget/dashboardLayout/types.js";
import { DashboardCustomizationLogger } from "../customizationLogging.js";
import { DefaultLayoutCustomizer } from "../layoutCustomizer.js";
import { type CustomizerMutationsContext, createCustomizerMutationsContext } from "../types.js";

const EmptyDashboard: IDashboard<ExtendedDashboardWidget> = {
    type: "IDashboard",
    uri: "/1",
    identifier: "1",
    ref: idRef("1"),
    title: "Empty Dashboard",
    description: "",
    created: "",
    updated: "",
    layout: {
        type: "IDashboardLayout",
        sections: [],
    },
    shareStatus: "private",
};

//
//
//

function renderToHtml(customizer: DefaultLayoutCustomizer) {
    const provider = customizer.getCustomizerResult();
    const Component = provider.LayoutComponent;

    // Component can be null if no override
    if (!Component) {
        return null;
    }

    const props: IDashboardLayoutProps = {
        onDrill: () => {},
        onError: () => {},
        onFiltersChange: () => {},
    };

    const { container } = render(<Component {...props} />);
    return container.innerHTML;
}

describe("layout customizer", () => {
    let Customizer: DefaultLayoutCustomizer;

    beforeEach(() => {
        Customizer = new DefaultLayoutCustomizer(
            new DashboardCustomizationLogger(),
            createCustomizerMutationsContext(),
        );
    });

    it("should allow fluid layout customization and deal with transform returning undefined", () => {
        const customizationFn = vi.fn();
        Customizer.customizeFluidLayout(customizationFn);
        const transformFn = Customizer.getExistingDashboardTransformFn();

        expect(transformFn(EmptyDashboard)).toEqual(EmptyDashboard);
        expect(customizationFn).toHaveBeenCalledTimes(1);
    });

    it("should allow multiple fluid layout customizations and deal with transforms returning undefined", () => {
        const customizationFn1 = vi.fn();
        const customizationFn2 = vi.fn();
        Customizer.customizeFluidLayout(customizationFn1);
        Customizer.customizeFluidLayout(customizationFn2);
        const transformFn = Customizer.getExistingDashboardTransformFn();

        expect(transformFn(EmptyDashboard)).toEqual(EmptyDashboard);
        expect(customizationFn1).toHaveBeenCalledTimes(1);
        expect(customizationFn2).toHaveBeenCalledTimes(1);
    });

    it("should ignore errors during transformation", async () => {
        Customizer.customizeFluidLayout(() => {
            throw Error();
        });
        const transformFn = Customizer.getExistingDashboardTransformFn();

        const result = await suppressConsole(() => transformFn(EmptyDashboard), "error", [
            {
                type: "startsWith",
                value: "An error has occurred while transforming fluid dashboard layout. Skipping failed transformation.",
            },
        ]);

        expect(result).toEqual(EmptyDashboard);
    });

    it("should return undefined if dashboard has no layout", () => {
        const DashboardWithNoLayout = { ...EmptyDashboard, layout: undefined };
        const customizationFn = vi.fn();
        Customizer.customizeFluidLayout(customizationFn);
        const transformFn = Customizer.getExistingDashboardTransformFn();

        expect(transformFn(DashboardWithNoLayout)).toBeUndefined();
    });

    describe("rendering", () => {
        let Customizer: DefaultLayoutCustomizer;
        let mockWarn: (message: string, ...optionalParams: unknown[]) => void;
        let mutationContext: CustomizerMutationsContext;

        beforeEach(() => {
            mockWarn = vi.fn();
            mutationContext = createCustomizerMutationsContext();
            Customizer = new DefaultLayoutCustomizer(
                new TestingDashboardCustomizationLogger({ warn: mockWarn }),
                mutationContext,
                () => {
                    function Comp() {
                        return <div>Default</div>;
                    }
                    return Comp;
                },
            );
        });

        it("should render with decorator", () => {
            Customizer.withCustomDecorator((_next) => {
                return (_props) => {
                    function Comp() {
                        return <div>Decorator</div>;
                    }
                    return Comp;
                };
            });

            expect(renderToHtml(Customizer)).toMatchSnapshot();
            expect(mutationContext).toEqual({
                ...EMPTY_MUTATIONS,
                layout: ["decorator"],
            });
        });

        it("should render with provider", () => {
            Customizer.withCustomProvider((_props) => {
                function Comp() {
                    return <div>Provider</div>;
                }
                return Comp;
            });

            expect(renderToHtml(Customizer)).toMatchSnapshot();
            expect(mutationContext).toEqual({
                ...EMPTY_MUTATIONS,
                layout: ["provider"],
            });
        });

        it("should render with default", () => {
            expect(renderToHtml(Customizer)).toMatchSnapshot();
            expect(mutationContext).toEqual({
                ...EMPTY_MUTATIONS,
            });
        });
    });
});
