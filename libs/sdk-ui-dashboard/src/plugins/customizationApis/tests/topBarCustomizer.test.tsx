// (C) 2022-2025 GoodData Corporation
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render } from "@testing-library/react";

import { IButtonBarProps, ITopBarProps } from "../../../presentation/index.js";
import { DefaultTopBarCustomizer } from "../topBarCustomizer.js";
import { CustomizerMutationsContext, createCustomizerMutationsContext } from "../types.js";

import { TestingDashboardCustomizationLogger } from "./fixtures/TestingDashboardCustomizationLogger.js";
import { EMPTY_MUTATIONS } from "./utils.js";

//
//
//

function renderToHtml(customizer: DefaultTopBarCustomizer) {
    const provider = customizer.getCustomizerResult();
    const Component = provider.TopBarComponent;

    // Component can be null if no override
    if (!Component) {
        return null;
    }

    const props: ITopBarProps = {
        titleProps: {
            title: "Title",
            onTitleChanged: () => {},
        },
        DefaultTopBar: () => <div>DefaultTopBar</div>,
        buttonBarProps: {
            cancelButtonProps: {
                isVisible: true,
                onCancelClick: () => {},
            },
            editButtonProps: {
                isVisible: true,
                isEnabled: true,
                tooltipText: "",
                onEditClick: () => {},
            },
            saveAsNewButtonProps: {
                isVisible: true,
                onSaveAsNewClick: () => {},
            },
            saveButtonProps: {
                buttonTitle: { id: "" },
                buttonValue: { id: "" },
                isEnabled: true,
                isSaving: false,
                isVisible: true,
                onSaveClick: () => {},
            },
            shareButtonProps: {
                isVisible: true,
                onShareButtonClick: () => {},
            },
            DefaultButtonBar: () => <div>DefaultButtonBar</div>,
            buttons: <div></div>,
        } as unknown as IButtonBarProps,
        lockedStatusProps: {
            isLocked: false,
        },
        menuButtonProps: {
            DefaultMenuButton: () => <div>DefaultMenuButton</div>,
            menuItems: [],
        },
        shareStatusProps: {
            shareStatus: "shared",
            isUnderStrictControl: false,
        },
    };

    const { container } = render(<Component {...props} />);
    return container.innerHTML;
}

describe("topBar customizer", () => {
    let Customizer: DefaultTopBarCustomizer;
    let mockWarn: ReturnType<typeof vi.fn>;
    let mutationContext: CustomizerMutationsContext;

    beforeEach(() => {
        mockWarn = vi.fn();
        mutationContext = createCustomizerMutationsContext();
        Customizer = new DefaultTopBarCustomizer(
            new TestingDashboardCustomizationLogger({ warn: mockWarn }),
            mutationContext,
            () => {
                function DefaultProv() {
                    return <div>DefaultTopBar</div>;
                }
                return DefaultProv;
            },
        );
    });

    describe("topBar rendering mode", () => {
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
                topBar: ["decorator"],
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
                topBar: ["provider"],
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
