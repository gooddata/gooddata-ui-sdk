// (C) 2021-2025 GoodData Corporation

import React from "react";
import { DashboardCustomizationLogger } from "../customizationLogging.js";
import { DefaultLayoutCustomizer } from "../layoutCustomizer.js";
import { ExtendedDashboardWidget } from "../../../model/index.js";
import { idRef, IDashboard } from "@gooddata/sdk-model";
import { createCustomizerMutationsContext, CustomizerMutationsContext } from "../types.js";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { TestingDashboardCustomizationLogger } from "./fixtures/TestingDashboardCustomizationLogger";
import { IDashboardLayoutProps } from "../../../presentation";
import { invariant } from "ts-invariant";
import { render } from "@testing-library/react";
import { EMPTY_MUTATIONS } from "./utils";

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
    const props: IDashboardLayoutProps = {
        onDrill: () => {},
        onError: () => {},
        onFiltersChange: () => {},
    };

    // this should not happen; if it does something is seriously hosed in the customizer
    invariant(Component);

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

    it("should ignore errors during transformation", () => {
        Customizer.customizeFluidLayout(() => {
            throw Error();
        });
        const transformFn = Customizer.getExistingDashboardTransformFn();

        expect(transformFn(EmptyDashboard)).toEqual(EmptyDashboard);
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
        let mockWarn: ReturnType<typeof vi.fn>;
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
