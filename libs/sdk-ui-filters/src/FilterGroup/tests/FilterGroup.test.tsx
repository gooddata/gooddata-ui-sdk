// (C) 2007-2026 GoodData Corporation

import { type ReactElement, type ReactNode, useState } from "react";

import { act, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { IntlWrapper } from "@gooddata/sdk-ui";

import { type IAttributeFilterProps } from "../../AttributeFilter/AttributeFilter.js";
import { FilterGroup } from "../FilterGroup.js";

type IMockedAttributeFilterButtonProps = IAttributeFilterProps & {
    onToggleSelection?: () => void;
};

type IMockedDropdownListProps<T> = {
    items: T[];
    renderItem: (props: { item: T }) => ReactNode;
};

const mockAttributeFilterButton = vi.fn((props: IMockedAttributeFilterButtonProps) => {
    const ElementsSearchBarComponent = props.ElementsSearchBarComponent!;

    return (
        <div>
            <ElementsSearchBarComponent onSearch={() => {}} searchString="" />
            <button type="button" onClick={props.onToggleSelection}>
                Toggle selection for {props.title}
            </button>
        </div>
    );
});

vi.mock("@gooddata/sdk-ui-kit", async () => {
    const actual = await vi.importActual("@gooddata/sdk-ui-kit");

    return {
        ...actual,
        DropdownList: ({ items, renderItem }: IMockedDropdownListProps<unknown>) => (
            <div>
                {items.map((item: unknown, index: number) => (
                    <div key={index}>{renderItem({ item })}</div>
                ))}
            </div>
        ),
        useMediaQuery: () => false,
    };
});

vi.mock("../../AttributeFilter/AttributeFilterButton.js", () => ({
    AttributeFilterButton: (props: IMockedAttributeFilterButtonProps) => mockAttributeFilterButton(props),
}));

describe("FilterGroup", () => {
    const originalOffsetHeightDescriptor = Object.getOwnPropertyDescriptor(
        HTMLElement.prototype,
        "offsetHeight",
    );

    const waitForAutofocusFrame = async () => {
        await act(async () => {
            await new Promise<void>((resolve) => {
                requestAnimationFrame(() => resolve());
            });
        });
    };

    const mockVisibleInputLayout = () => {
        // jsdom reports zero layout size, so the real autofocus helper would treat the
        // remounted search input as invisible and never run the browser focus path.
        Object.defineProperty(HTMLElement.prototype, "offsetHeight", {
            configurable: true,
            get() {
                return 1;
            },
        });
    };

    afterEach(() => {
        if (originalOffsetHeightDescriptor) {
            Object.defineProperty(HTMLElement.prototype, "offsetHeight", originalOffsetHeightDescriptor);
        } else {
            Reflect.deleteProperty(HTMLElement.prototype, "offsetHeight");
        }
    });

    afterEach(() => {
        vi.clearAllMocks();
    });

    it("should keep focus on the toggled item when the group rerenders", async () => {
        const filters = [{ id: "region", title: "Region" }];

        function Component(): ReactElement {
            const [hasSelection, setHasSelection] = useState(false);

            return (
                <IntlWrapper locale="en-US">
                    <FilterGroup<{ id: string; title: string }>
                        title="Filter group"
                        filters={filters}
                        getFilterIdentifier={(filter) => filter.id}
                        hasSelectedElements={() => hasSelection}
                        renderFilter={(filter, AttributeFilterComponent) => {
                            if (!AttributeFilterComponent) {
                                throw new Error("AttributeFilterComponent is required.");
                            }

                            return (
                                <AttributeFilterComponent
                                    {...({
                                        title: filter.title,
                                        onToggleSelection: () => {
                                            setHasSelection((prev) => !prev);
                                        },
                                    } as IMockedAttributeFilterButtonProps)}
                                />
                            );
                        }}
                    />
                </IntlWrapper>
            );
        }

        render(<Component />);

        fireEvent.click(screen.getByRole("button", { name: /Filter group/i }));
        mockVisibleInputLayout();

        const searchInputBeforeToggle = await screen.findByRole("searchbox", {
            name: "Search attribute values",
        });
        const toggleSelectionButton = screen.getByRole("button", { name: "Toggle selection for Region" });
        toggleSelectionButton.focus();

        expect(toggleSelectionButton).toHaveFocus();

        fireEvent.click(toggleSelectionButton);

        await waitFor(() => {
            expect(screen.getByTestId("attribute-filter-button-subtitle")).toHaveTextContent("(1/1)");
        });
        await waitForAutofocusFrame();

        const searchInputAfterToggle = screen.getByRole("searchbox", {
            name: "Search attribute values",
        });
        expect(screen.getByRole("button", { name: "Toggle selection for Region" })).toHaveFocus();
        expect(searchInputBeforeToggle).not.toHaveFocus();
        expect(searchInputAfterToggle).not.toHaveFocus();

        expect(
            searchInputAfterToggle,
            "Search input remounted. DOM element should be the same as the one before the toggle.",
        ).toBe(searchInputBeforeToggle);
    });
});
