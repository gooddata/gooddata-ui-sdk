// (C) 2026 GoodData Corporation

import { useState } from "react";

// (C) 2026 GoodData Corporation
import { act, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { render } from "../../../test/render.js";
import { type IAccessibilityConfigBase } from "../../typings/accessibility.js";

import { type IUiSearchableSelectProps, UiSearchableSelect } from "./UiSearchableSelect.js";
import { UiSearchableSelectItem } from "./UiSearchableSelectItem.js";
import { UiSearchableSelectList } from "./UiSearchableSelectList.js";
import { UiSearchableSelectSearch } from "./UiSearchableSelectSearch.js";

const requiredProps = {
    accessibilityConfig: { ariaLabel: "Label" },
    items: [{ name: "Option #1" }],
    onChange: () => {},
    placeholder: "Placeholder",
    value: null,
    children: (
        <>
            <UiSearchableSelectSearch />
            <UiSearchableSelectList<{ name: string }>>
                {/**
                 * Unfortunately, we cannot infer type here in children from parent `items`. This is an intentional
                 * drawback to accepting arbitrary format of `items`. The similar thing happens in React Aria from which
                 * the API of this component was inspired from. So we have to provide `<{ name: string }>`
                 */}
                {({ name }) => <UiSearchableSelectItem id={name}>{name}</UiSearchableSelectItem>}
            </UiSearchableSelectList>
        </>
    ),
} satisfies IUiSearchableSelectProps<{ name: string }>;

afterEach(() => {
    vi.useRealTimers();
});

describe("UiSearchableSelect", async () => {
    it("should show a button that opens a popup with a search field and select options", async () => {
        const accessibilityConfig: IAccessibilityConfigBase = { ariaLabel: "Select label" };
        const items = [{ name: "Item #1" }, { name: "Item #2" }];
        const placeholder = "Select placeholder";
        const { user } = render(
            <UiSearchableSelect
                {...requiredProps}
                accessibilityConfig={accessibilityConfig}
                items={items}
                placeholder={placeholder}
            >
                <UiSearchableSelectSearch
                    accessibilityConfig={{ ariaLabel: "Select search items" }}
                    placeholder="Select search placeholder"
                />
                <UiSearchableSelectList<(typeof items)[number]>>
                    {({ name }) => <UiSearchableSelectItem id={name}>{name}</UiSearchableSelectItem>}
                </UiSearchableSelectList>
            </UiSearchableSelect>,
        );

        // NOTE: Normally if both aria-label and button text is applied, it announces only the label. So make sure both are announced there.
        expect(
            screen.getByRole("button", { name: "Select placeholder Select label", expanded: false }),
        ).toBeVisible();
        expect(screen.queryByRole("button", { expanded: true })).not.toBeInTheDocument();
        // Button has also "Search placeholder in its accessible name so regex the label"
        expect(screen.getByRole("button", { name: /Select label/ })).toHaveTextContent("Select placeholder");
        expect(screen.getByRole("button", { name: /Select label/ })).toHaveAttribute(
            "aria-haspopup",
            "listbox",
        );

        await user.click(screen.getByRole("button", { name: /Select label/ }));

        expect(screen.getByRole("button", { name: /Select label/, expanded: true })).toBeVisible();

        expect(screen.getByRole("combobox", { name: "Select search items", expanded: true })).toBeVisible();
        expect(screen.getByPlaceholderText("Select search placeholder")).toBeVisible();
        expect(screen.getByRole("combobox", { name: "Select search items" })).toHaveFocus();
        expect(screen.getByRole("listbox", { name: "Select label" })).toBeVisible();
        expect(screen.getByRole("option", { name: "Item #1" })).toBeVisible();
        expect(screen.getByRole("option", { name: "Item #2" })).toBeVisible();
    });

    it("should have default search label and search placeholder", async () => {
        const { user } = render(<UiSearchableSelect {...requiredProps} />);

        await user.click(screen.getByRole("button"));

        expect(screen.getByRole("combobox", { name: "Search items" })).toBeVisible();
        expect(screen.getByPlaceholderText("Search...")).toBeVisible();
    });

    it("should have default no items text", async () => {
        const { user } = render(<UiSearchableSelect {...requiredProps} items={[]} />);

        await user.click(screen.getByRole("button"));

        expect(screen.getByText("No items found.")).toBeVisible();
    });

    it("should support opening by default", async () => {
        // NOTE: The intention of this prop is mainly to be able to do "Opened" visual regression state in NeoBackstop
        const defaultOpen = true;
        render(<UiSearchableSelect {...requiredProps} defaultOpen={defaultOpen} />);

        expect(screen.getByRole("button", { expanded: true })).toBeVisible();
    });

    it("should support controlled selecting", async () => {
        const items = [
            { id: "id-1", name: "Item #1" },
            { id: "id-2", name: "Item #2" },
            { id: "id-3", name: "Item #3" },
        ];
        const placeholder = "Search placeholder";
        const defaultValue = "id-2";
        const onChange = vi.fn();
        function Wrapper() {
            const [value, setValue] = useState(defaultValue);

            return (
                <UiSearchableSelect
                    {...requiredProps}
                    accessibilityConfig={{ ariaLabel: "Select label" }}
                    items={items}
                    placeholder={placeholder}
                    value={value}
                    onChange={(newValue) => {
                        onChange(newValue);
                        setValue(newValue);
                    }}
                >
                    <UiSearchableSelectSearch />
                    <UiSearchableSelectList<(typeof items)[number]>>
                        {({ id, name }) => <UiSearchableSelectItem id={id}>{name}</UiSearchableSelectItem>}
                    </UiSearchableSelectList>
                </UiSearchableSelect>
            );
        }
        const { user } = render(<Wrapper />);

        expect(screen.getByRole("button")).not.toHaveTextContent("Search placeholder");
        expect(screen.getByRole("button")).toHaveTextContent("Item #2");
        // NOTE: Normally if both aria-label and button text is applied, it announces only the label. So make sure both are announced there.
        expect(screen.getByRole("button", { name: "Item #2 Select label" })).toBeVisible();

        await user.click(screen.getByRole("button", { expanded: false }));
        // NOTE: Selecting an already selected item should not trigger an `onChange` call.
        await user.click(screen.getByRole("option", { name: "Item #2" }));
        await user.click(screen.getByRole("button", { expanded: false }));
        await user.click(screen.getByRole("option", { name: "Item #1" }));
        await user.click(screen.getByRole("button", { expanded: false }));
        await user.click(screen.getByRole("option", { name: "Item #3" }));
        // NOTE: Leave select open to assert on `aria-selected` on options below
        await user.click(screen.getByRole("button", { expanded: false }));

        expect(screen.getByRole("option", { name: "Item #1", selected: false })).toBeVisible();
        expect(screen.getByRole("option", { name: "Item #2", selected: false })).toBeVisible();
        expect(screen.getByRole("option", { name: "Item #3", selected: true })).toBeVisible();
        expect(screen.getByRole("button", { expanded: true })).toHaveTextContent("Item #3");
        expect(onChange.mock.calls.flat()).toEqual(["id-1", "id-3"]);
    });

    it("should filter items by the search query", async () => {
        const items = [
            { id: "id-1", name: "Apple" },
            { id: "id-2", name: "Banana" },
            { id: "id-3", name: "Pineapple" },
        ];
        const { user } = render(
            <UiSearchableSelect {...requiredProps} items={items}>
                <UiSearchableSelectSearch accessibilityConfig={{ ariaLabel: "Search items" }} />
                <UiSearchableSelectList<(typeof items)[number]>>
                    {({ id, name }) => <UiSearchableSelectItem id={id}>{name}</UiSearchableSelectItem>}
                </UiSearchableSelectList>
            </UiSearchableSelect>,
        );

        await user.click(screen.getByRole("button"));
        // NOTE: "apple" matches the start of "Apple" (in a different case) and the middle of "Pineapple".
        await user.type(screen.getByRole("combobox", { name: "Search items" }), "apple");

        expect(screen.getByRole("option", { name: "Apple" })).toBeVisible();
        expect(screen.queryByRole("option", { name: "Banana" })).not.toBeInTheDocument();
        expect(screen.getByRole("option", { name: "Pineapple" })).toBeVisible();
    });

    it("should clear the search query after closing", async () => {
        const items = [
            { id: "id-1", name: "Apple" },
            { id: "id-2", name: "Banana" },
            { id: "id-3", name: "Pineapple" },
        ];
        const { user } = render(
            <UiSearchableSelect {...requiredProps} items={items}>
                <UiSearchableSelectSearch />
                <UiSearchableSelectList<(typeof items)[number]>>
                    {({ id, name }) => <UiSearchableSelectItem id={id}>{name}</UiSearchableSelectItem>}
                </UiSearchableSelectList>
            </UiSearchableSelect>,
        );

        await user.click(screen.getByRole("button", { expanded: false }));
        await user.type(screen.getByRole("combobox", { name: "Search items" }), "apple");
        await user.click(screen.getByRole("button", { expanded: true }));
        await user.click(screen.getByRole("button", { expanded: false }));

        expect(screen.getByRole("combobox", { name: "Search items" })).toHaveValue("");
        expect(screen.getByRole("option", { name: "Apple" })).toBeVisible();
        expect(screen.getByRole("option", { name: "Banana" })).toBeVisible(); // NOTE: This should now be visible
        expect(screen.getByRole("option", { name: "Pineapple" })).toBeVisible();
    });

    it("should support showing custom no items text", async () => {
        const items = [{ name: "Item #1" }];
        const { user } = render(
            <UiSearchableSelect {...requiredProps} items={items}>
                <UiSearchableSelectSearch />
                <UiSearchableSelectList<(typeof items)[number]> noItemsText="No matching items.">
                    {({ name }) => <UiSearchableSelectItem id={name}>{name}</UiSearchableSelectItem>}
                </UiSearchableSelectList>
            </UiSearchableSelect>,
        );

        await user.click(screen.getByRole("button"));
        await user.type(screen.getByRole("combobox", { name: "Search items" }), "abrakadabra");

        expect(screen.getByText("No matching items.")).toBeVisible();
    });

    it("should open on enter, highlight options with arrow down and select option on enter", async () => {
        const items = [{ name: "Item #1" }, { name: "Item #2" }, { name: "Item #3" }];
        const defaultValue = null;
        function Wrapper() {
            const [value, setValue] = useState<string | null>(defaultValue);

            return (
                <UiSearchableSelect {...requiredProps} items={items} value={value} onChange={setValue}>
                    <UiSearchableSelectSearch />
                    <UiSearchableSelectList<(typeof items)[number]>>
                        {({ name }) => <UiSearchableSelectItem id={name}>{name}</UiSearchableSelectItem>}
                    </UiSearchableSelectList>
                </UiSearchableSelect>
            );
        }
        const { user } = render(<Wrapper />);

        await user.tab();
        await user.keyboard("{Enter}");
        // NOTE: The list should not have highlighted the first option right away, only after key down
        await user.keyboard("{ArrowDown}");
        await user.keyboard("{ArrowDown}");

        expect(screen.getByRole("combobox", { name: "Search items" })).toHaveAttribute(
            "aria-activedescendant",
            screen.getByRole("option", { name: "Item #2" }).id,
        );
        // NOTE: The search should still have focus after key down press
        expect(screen.getByRole("combobox", { name: "Search items" })).toHaveFocus();

        await user.keyboard("{Enter}");

        expect(screen.getByRole("button", { expanded: false })).toHaveTextContent("Item #2");
    });

    it("should highlight the selected option right away and move with arrows from there", async () => {
        const items = [{ name: "Item #1" }, { name: "Item #2" }, { name: "Item #3" }];
        const defaultValue = "Item #2";
        function Wrapper() {
            const [value, setValue] = useState(defaultValue);

            return (
                <UiSearchableSelect {...requiredProps} items={items} value={value} onChange={setValue}>
                    <UiSearchableSelectSearch />
                    <UiSearchableSelectList<(typeof items)[number]>>
                        {({ name }) => <UiSearchableSelectItem id={name}>{name}</UiSearchableSelectItem>}
                    </UiSearchableSelectList>
                </UiSearchableSelect>
            );
        }
        const { user } = render(<Wrapper />);

        await user.click(screen.getByRole("button"));

        /**
         * NOTE: The search should not point at the selected option via aria-activedescendant on open. Otherwise screen readers
         * would announce only the option and skip the search. Without it, NVDA announces both, the search and then the selected
         * option, as it follows the `aria-controls` on the search. VoiceOver, however, ignores aria-controls, so it announces
         * only the search, and the option only after an arrow key.
         */
        expect(screen.getByRole("combobox", { name: "Search items" })).not.toHaveAttribute(
            "aria-activedescendant",
        );

        await user.keyboard("{ArrowUp}");

        expect(screen.getByRole("combobox", { name: "Search items" })).toHaveAttribute(
            "aria-activedescendant",
            screen.getByRole("option", { name: "Item #1" }).id,
        );
    });

    it("should return focus to the button after selecting an option with enter", async () => {
        const { user } = render(<UiSearchableSelect {...requiredProps} />);

        await user.click(screen.getByRole("button"));
        await user.keyboard("{ArrowDown}{Enter}");

        expect(screen.getByRole("button")).toHaveFocus();
    });

    it("should connect the search to the list it filters", async () => {
        const { user } = render(<UiSearchableSelect {...requiredProps} />);

        await user.click(screen.getByRole("button"));

        expect(screen.getByRole("combobox", { name: "Search items" })).toHaveAttribute(
            "aria-autocomplete",
            "list",
        );
        expect(screen.getByRole("combobox", { name: "Search items" })).toHaveAttribute(
            "aria-controls",
            screen.getByRole("listbox").id,
        );
    });

    it("should clear the search query on escape first and close popup on the second escape", async () => {
        const { user } = render(<UiSearchableSelect {...requiredProps} />);

        await user.click(screen.getByRole("button"));
        await user.type(screen.getByRole("combobox", { name: "Search items" }), "option");
        await user.keyboard("{Escape}");

        expect(screen.getByRole("combobox", { name: "Search items" })).toHaveValue("");
        expect(screen.getByRole("button", { expanded: true })).toBeVisible(); // NOTE: Still open

        await user.keyboard("{Escape}");

        expect(screen.getByRole("button", { expanded: false })).toHaveFocus();
    });

    it("should announce the search results", async () => {
        /**
         * Testing library doesn't play nice with `vi.useFakeTimers()`. See https://github.com/testing-library/dom-testing-library/issues/987#issuecomment-1266266801
         * for more details. We also use `advanceTimeDelta: 1` to speed up tests.
         */
        vi.useFakeTimers({ shouldAdvanceTime: true, advanceTimeDelta: 1 });
        const items = [
            { id: "id-1", name: "Apple" },
            { id: "id-2", name: "Banana" },
            { id: "id-3", name: "Pineapple" },
        ];
        const { user } = render(
            <UiSearchableSelect {...requiredProps} items={items}>
                <UiSearchableSelectSearch />
                <UiSearchableSelectList<(typeof items)[number]>>
                    {({ id, name }) => <UiSearchableSelectItem id={id}>{name}</UiSearchableSelectItem>}
                </UiSearchableSelectList>
            </UiSearchableSelect>,
        );

        await user.click(screen.getByRole("button"));

        expect(screen.getByRole("status")).toHaveTextContent(""); // NOTE: Nothing to announce before searching

        await user.type(screen.getByRole("combobox", { name: "Search items" }), "apple");
        await act(() => vi.advanceTimersByTimeAsync(1000));

        expect(screen.getByRole("status")).toHaveTextContent("2 results: Apple, Pineapple");
    });

    it("should announce the no items text when no items match the search query", async () => {
        vi.useFakeTimers({ shouldAdvanceTime: true, advanceTimeDelta: 1 });
        const items = [{ name: "Item #1" }];
        const { user } = render(
            <UiSearchableSelect {...requiredProps} items={items}>
                <UiSearchableSelectSearch />
                <UiSearchableSelectList<(typeof items)[number]> noItemsText="No matching items.">
                    {({ name }) => <UiSearchableSelectItem id={name}>{name}</UiSearchableSelectItem>}
                </UiSearchableSelectList>
            </UiSearchableSelect>,
        );

        await user.click(screen.getByRole("button"));
        await user.type(screen.getByRole("combobox", { name: "Search items" }), "abrakadabra");
        await act(() => vi.advanceTimersByTimeAsync(1000));

        expect(screen.getByRole("status")).toHaveTextContent("No matching items.");
    });

    it("should close and move focus to the next element on tab", async () => {
        const { user } = render(
            <>
                <UiSearchableSelect {...requiredProps} accessibilityConfig={{ ariaLabel: "Select label" }} />
                <button>Next</button>
            </>,
        );

        await user.click(screen.getByRole("button", { name: /Select label/ }));
        await user.tab();

        expect(screen.getByRole("button", { name: /Select label/, expanded: false })).toBeVisible();
        expect(screen.getByRole("button", { name: "Next" })).toHaveFocus();
    });

    it("should connect the button to the list it opens", async () => {
        const { user } = render(<UiSearchableSelect {...requiredProps} />);

        // The list is rendered only while open, so the button points at it only then
        expect(screen.getByRole("button")).not.toHaveAttribute("aria-controls");

        await user.click(screen.getByRole("button"));

        expect(screen.getByRole("button")).toHaveAttribute("aria-controls", screen.getByRole("listbox").id);
    });

    it("should highlight the first match while searching and the selected one after clearing", async () => {
        vi.useFakeTimers({ shouldAdvanceTime: true, advanceTimeDelta: 1 });
        const items = [
            { id: "id-1", name: "Apple" },
            { id: "id-2", name: "Banana" },
            { id: "id-3", name: "Cherry" },
            { id: "id-4", name: "Pineapple" },
        ];
        const { user } = render(
            <UiSearchableSelect {...requiredProps} items={items} value="id-2">
                <UiSearchableSelectSearch />
                <UiSearchableSelectList<(typeof items)[number]>>
                    {({ id, name }) => <UiSearchableSelectItem id={id}>{name}</UiSearchableSelectItem>}
                </UiSearchableSelectList>
            </UiSearchableSelect>,
        );

        await user.click(screen.getByRole("button"));
        /*
         * NOTE: The popup moves the focus into the search in an animation frame. Fake timers run frames only
         * every 16 ms of fake time, while the click takes just a few fake milliseconds (one per user-event
         * pause, with advanceTimeDelta: 1), so without waiting, the arrows below would go to the button.
         * Awaiting `vi.advanceTimersToNextFrame()` would help also.
         */
        await waitFor(() => expect(screen.getByRole("combobox", { name: "Search items" })).toHaveFocus());
        // NOTE: From the selected Banana to Pineapple, which matches the search, but isn't its first match
        await user.keyboard("{ArrowDown}{ArrowDown}");
        await user.type(screen.getByRole("combobox", { name: "Search items" }), "apple");

        expect(screen.getByRole("combobox", { name: "Search items" })).not.toHaveAttribute(
            "aria-activedescendant",
        );

        await act(() => vi.advanceTimersByTimeAsync(300));

        expect(screen.getByRole("combobox", { name: "Search items" })).toHaveAttribute(
            "aria-activedescendant",
            screen.getByRole("option", { name: "Apple" }).id,
        );

        await user.keyboard("{Escape}");
        /**
         * NOTE: Waiting the typing delay, to make sure the pointer doesn't come back. But there should not be
         * any delay on clearing.
         */
        await act(() => vi.advanceTimersByTimeAsync(300));

        // NOTE: Like a fresh opening, so that screen readers don't announce the selected option again
        expect(screen.getByRole("combobox", { name: "Search items" })).not.toHaveAttribute(
            "aria-activedescendant",
        );

        await user.keyboard("{ArrowDown}");

        expect(screen.getByRole("combobox", { name: "Search items" })).toHaveAttribute(
            "aria-activedescendant",
            screen.getByRole("option", { name: "Cherry" }).id,
        );
    });

    it("should not introduce double highlight if both keyboard and hover is applied", async () => {
        const items = [{ name: "Item #1" }, { name: "Item #2" }, { name: "Item #3" }, { name: "Item #4" }];
        const { user } = render(
            <UiSearchableSelect {...requiredProps} items={items}>
                <UiSearchableSelectSearch />
                <UiSearchableSelectList<(typeof items)[number]>>
                    {({ name }) => <UiSearchableSelectItem id={name}>{name}</UiSearchableSelectItem>}
                </UiSearchableSelectList>
            </UiSearchableSelect>,
        );

        await user.click(screen.getByRole("button"));
        await user.hover(screen.getByRole("option", { name: "Item #3" }));

        // NOTE: Like an arrow key, hovering points at the option at once, so screen readers announce it
        expect(screen.getByRole("combobox", { name: "Search items" })).toHaveAttribute(
            "aria-activedescendant",
            screen.getByRole("option", { name: "Item #3" }).id,
        );

        await user.keyboard("{ArrowDown}");

        expect(screen.getByRole("combobox", { name: "Search items" })).toHaveAttribute(
            "aria-activedescendant",
            screen.getByRole("option", { name: "Item #4" }).id,
        );
    });

    it("should filter items by a custom filter", async () => {
        const items = [
            { id: "id-1", name: "Item #1", keyword: "apple" },
            { id: "id-2", name: "Item #2", keyword: "banana" },
        ];
        const { user } = render(
            <UiSearchableSelect
                {...requiredProps}
                items={items}
                // NOTE: The filter gets the item's own data, so it can match other fields than the title
                filter={(item, query) =>
                    [item.name, item.keyword].some((text) => text.toLowerCase().includes(query))
                }
            >
                <UiSearchableSelectSearch />
                <UiSearchableSelectList<(typeof items)[number]>>
                    {({ id, name }) => <UiSearchableSelectItem id={id}>{name}</UiSearchableSelectItem>}
                </UiSearchableSelectList>
            </UiSearchableSelect>,
        );

        await user.click(screen.getByRole("button"));
        await user.type(screen.getByRole("combobox", { name: "Search items" }), "apple");

        expect(screen.getByRole("option", { name: "Item #1" })).toBeVisible();
        expect(screen.queryByRole("option", { name: "Item #2" })).not.toBeInTheDocument();
    });

    it("should support `lang` property on the select items", async () => {
        const items = [{ id: "id-1", name: "Item #1", lang: "de" }];
        const { user } = render(
            <UiSearchableSelect {...requiredProps} items={items}>
                <UiSearchableSelectSearch />
                <UiSearchableSelectList<(typeof items)[number]>>
                    {({ id, name, lang }) => (
                        <UiSearchableSelectItem id={id} lang={lang}>
                            {name}
                        </UiSearchableSelectItem>
                    )}
                </UiSearchableSelectList>
            </UiSearchableSelect>,
        );

        await user.click(screen.getByRole("button"));

        // NOTE: Screen readers can then read the item in its own language (WCAG 3.1.2 Language of Parts)
        expect(screen.getByRole("option", { name: "Item #1" })).toHaveAttribute("lang", "de");
    });

    it("should show all items before searching, also with a custom filter", async () => {
        const items = [
            { id: "id-1", name: "Item #1", code: "one" },
            { id: "id-2", name: "Item #2", code: "two" },
        ];
        const { user } = render(
            <UiSearchableSelect
                {...requiredProps}
                items={items}
                // NOTE: A filter that matches whole values only would match no item for an empty query
                filter={(item, query) => item.code === query}
            >
                <UiSearchableSelectSearch />
                <UiSearchableSelectList<(typeof items)[number]>>
                    {({ id, name }) => <UiSearchableSelectItem id={id}>{name}</UiSearchableSelectItem>}
                </UiSearchableSelectList>
            </UiSearchableSelect>,
        );

        await user.click(screen.getByRole("button"));

        expect(screen.getByRole("option", { name: "Item #1" })).toBeVisible();
        expect(screen.getByRole("option", { name: "Item #2" })).toBeVisible();
    });

    it("should not let the enter that selects an option reach the elements around", async () => {
        const onChange = vi.fn();
        const onKeyDown = vi.fn();
        const { user } = render(
            // NOTE: Like a dialog that submits on enter; the popup is portaled, but React events bubble to it
            <div onKeyDown={(event) => onKeyDown(event.key)}>
                <UiSearchableSelect {...requiredProps} onChange={onChange} />
            </div>,
        );

        await user.click(screen.getByRole("button"));
        await user.type(screen.getByRole("combobox", { name: "Search items" }), "option");
        await user.keyboard("{ArrowDown}{Enter}");

        expect(onChange.mock.calls).toEqual([["Option #1"]]);
        expect(onKeyDown).not.toHaveBeenCalledWith("Enter");
    });
});
