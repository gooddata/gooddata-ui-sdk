// (C) 2022-2025 GoodData Corporation
import React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { idRef, IRichTextWidget } from "@gooddata/sdk-model";
import { render } from "@testing-library/react";
import { invariant } from "ts-invariant";

import { DefaultRichTextCustomizer } from "../richTextCustomizer.js";
import { CustomizerMutationsContext, createCustomizerMutationsContext } from "../types.js";

import { TestingDashboardCustomizationLogger } from "./fixtures/TestingDashboardCustomizationLogger.js";
import { EMPTY_MUTATIONS } from "./utils.js";

//
//
//

const TestRichText: IRichTextWidget = {
    type: "richText",
    title: "Test RichText",
    ref: idRef("testKpi"),
    identifier: "testKpi",
    description: "Test RichText Widget",
    uri: "/uri/testKpi",
    content: "Hello, world!",
    drills: [],
    ignoreDashboardFilters: [],
};

function renderToHtml(customizer: DefaultRichTextCustomizer) {
    const RichTextComponent = customizer.getRichTextComponentProvider()(TestRichText);

    // this should not happen; if it does something is seriously hosed in the customizer
    invariant(RichTextComponent);

    const { container } = render(<RichTextComponent widget={TestRichText} />);

    return container.innerHTML;
}

describe("richText customizer", () => {
    let Customizer: DefaultRichTextCustomizer;
    let mockWarn: ReturnType<typeof vi.fn>;
    let mutationContext: CustomizerMutationsContext;

    beforeEach(() => {
        mockWarn = vi.fn();
        mutationContext = createCustomizerMutationsContext();
        Customizer = new DefaultRichTextCustomizer(
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

    describe("richText rendering mode", () => {
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
                richText: ["decorator"],
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
                richText: ["provider"],
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
