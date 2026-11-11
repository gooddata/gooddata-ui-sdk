// (C) 2026 GoodData Corporation

import { type ReactNode, type RefObject, useRef, useState } from "react";

import { screen, waitFor } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { blurOnRemoval } from "../../../test/blurOnRemoval.test.utils.js";
import { render } from "../../../test/render.js";
import { UiFloatingElement } from "../UiFloatingElement/UiFloatingElement.js";
import { UiListbox } from "../UiListbox/UiListbox.js";

import { type IUiDropdownProps } from "./types.js";
import { UiDropdown } from "./UiDropdown.js";

function renderDropdown(
    accessibilityConfig: IUiDropdownProps["accessibilityConfig"],
    { nameAfterTrigger = false }: { nameAfterTrigger?: boolean } = {},
) {
    return render(
        <UiDropdown
            openOnInit
            accessibilityConfig={accessibilityConfig}
            renderButton={({ ref, ariaAttributes, toggleDropdown }) => (
                <button
                    ref={ref as never}
                    type="button"
                    aria-label="Open"
                    onClick={toggleDropdown}
                    {...ariaAttributes}
                >
                    Open
                </button>
            )}
            renderBody={({ ariaAttributes, triggerId }) => (
                <UiListbox
                    items={[{ type: "interactive", id: "a", stringTitle: "A", data: "a" }]}
                    ariaAttributes={
                        nameAfterTrigger
                            ? { ...ariaAttributes, "aria-labelledby": triggerId }
                            : ariaAttributes
                    }
                    onSelect={() => {}}
                />
            )}
        />,
    );
}

describe("UiDropdown", () => {
    // A listbox inside a listbox is not allowed; the body is the widget, the panel only holds it.
    it("leaves a widget role to the body", () => {
        renderDropdown({ triggerRole: "combobox", popupRole: "listbox" });

        const trigger = screen.getByRole("combobox", { name: "Open" });
        const listbox = screen.getByRole("listbox");
        expect(listbox).toHaveAttribute("id", trigger.getAttribute("aria-controls"));
        expect(document.querySelector(".gd-ui-kit-floating-element")).not.toHaveAttribute("role");
    });

    it("lets a body without a name of its own take the trigger's", () => {
        renderDropdown({ triggerRole: "button", popupRole: "listbox" }, { nameAfterTrigger: true });

        expect(screen.getByRole("listbox", { name: "Open" })).toBeInTheDocument();
    });

    it("makes the panel itself the dialog, named after the trigger", () => {
        renderDropdown({ triggerRole: "button", popupRole: "dialog" });

        const trigger = screen.getByRole("button", { name: "Open" });
        const dialog = screen.getByRole("dialog");
        expect(dialog).toHaveClass("gd-ui-kit-floating-element");
        expect(dialog).toHaveAttribute("aria-labelledby", trigger.parentElement!.id);
    });
});

const FRUITS = ["Apple", "Banana", "Cherry"];

interface IFruitDropdownProps {
    enableFocusTrap?: boolean;
    onPick?: (fruit: string) => void;
}

function FruitDropdown({ enableFocusTrap, onPick }: IFruitDropdownProps) {
    return (
        <UiDropdown
            autofocusOnOpen
            enableFocusTrap={enableFocusTrap}
            accessibilityConfig={{ triggerRole: "combobox", popupRole: "listbox" }}
            renderButton={({ ref, ariaAttributes, toggleDropdown }) => (
                <button
                    ref={ref as RefObject<HTMLButtonElement>}
                    type="button"
                    aria-label="Fruit"
                    onClick={toggleDropdown}
                    {...ariaAttributes}
                >
                    Fruit
                </button>
            )}
            renderBody={({ ariaAttributes, closeDropdown }) => (
                <UiListbox
                    items={FRUITS.map((fruit) => ({
                        type: "interactive" as const,
                        id: fruit,
                        stringTitle: fruit,
                        data: fruit,
                    }))}
                    ariaAttributes={{ ...ariaAttributes, "aria-label": "Fruits" }}
                    onSelect={(item) => {
                        onPick?.(item.data);
                        closeDropdown();
                    }}
                    onClose={closeDropdown}
                />
            )}
        />
    );
}

function Page({ children }: { children: ReactNode }) {
    return (
        <>
            <button type="button">Before</button>
            {children}
            <button type="button">After</button>
        </>
    );
}

function FloatingBar() {
    const anchor = useRef<HTMLDivElement>(null);
    const [picked, setPicked] = useState<string>();
    return (
        <Page>
            <div ref={anchor}>Anchor</div>
            <UiFloatingElement anchor={anchor} isOpen>
                <FruitDropdown onPick={setPicked} />
                <button type="button">Next in bar</button>
                <output>{picked}</output>
            </UiFloatingElement>
        </Page>
    );
}

async function openFromKeyboard(user: ReturnType<typeof render>["user"]): Promise<HTMLElement> {
    const trigger = screen.getByRole("combobox", { name: "Fruit" });
    trigger.focus();
    await user.keyboard("{Enter}");
    const listbox = await screen.findByRole("listbox", { name: "Fruits" });
    await waitFor(() => expect(listbox.contains(document.activeElement)).toBe(true));
    return trigger;
}

describe("UiDropdown keyboard and focus", () => {
    it("opens from the keyboard with the focus in its list", async () => {
        const { user } = render(<FruitDropdown />);

        const trigger = await openFromKeyboard(user);

        expect(trigger).toHaveAttribute("aria-expanded", "true");
    });

    it("picks an item with the arrow keys and Enter, and gives the focus back to the trigger", async () => {
        const picks: string[] = [];
        const { user } = render(<FruitDropdown onPick={(fruit) => picks.push(fruit)} />);
        const trigger = await openFromKeyboard(user);

        await user.keyboard("{ArrowDown}{Enter}");

        expect(picks).toEqual(["Banana"]);
        expect(screen.queryByRole("listbox")).toBeNull();
        await waitFor(() => expect(trigger).toHaveFocus());
    });

    it("closes on Escape and gives the focus back to the trigger", async () => {
        const { user } = render(<FruitDropdown />);
        const trigger = await openFromKeyboard(user);

        await user.keyboard("{Escape}");

        expect(screen.queryByRole("listbox")).toBeNull();
        await waitFor(() => expect(trigger).toHaveFocus());
    });

    it("closes on a click outside and leaves the focus where the click put it", async () => {
        const { user } = render(
            <Page>
                <FruitDropdown />
            </Page>,
        );
        await openFromKeyboard(user);
        const after = screen.getByRole("button", { name: "After" });

        await user.click(after);

        expect(screen.queryByRole("listbox")).toBeNull();
        await waitFor(() => expect(after).toHaveFocus());
    });

    it("keeps Tab inside the open panel", async () => {
        const { user } = render(
            <Page>
                <FruitDropdown />
            </Page>,
        );
        await openFromKeyboard(user);
        const listbox = screen.getByRole("listbox", { name: "Fruits" });

        await user.tab();

        expect(listbox.contains(document.activeElement)).toBe(true);
    });

    it("closes when Tab leaves a panel without a focus trap", async () => {
        const { user } = render(
            <Page>
                <FruitDropdown enableFocusTrap={false} />
            </Page>,
        );
        await openFromKeyboard(user);

        await user.tab();

        expect(screen.queryByRole("listbox")).toBeNull();
    });

    describe("inside a floating element", () => {
        it.each([
            ["on Escape", "{Escape}"],
            ["on a keyboard pick", "{ArrowDown}{Enter}"],
        ])("gives the focus back to the trigger %s", async (_, keys) => {
            blurOnRemoval();
            const { user } = render(<FloatingBar />);
            const trigger = await openFromKeyboard(user);

            await user.keyboard(keys);

            expect(screen.queryByRole("listbox")).toBeNull();
            await waitFor(() => expect(trigger).toHaveFocus());
        });

        it("moves Tab on to the next control after it closes", async () => {
            blurOnRemoval();
            const { user } = render(<FloatingBar />);
            const trigger = await openFromKeyboard(user);
            await user.keyboard("{Escape}");
            await waitFor(() => expect(trigger).toHaveFocus());

            await user.tab();

            expect(screen.getByRole("button", { name: "Next in bar" })).toHaveFocus();
        });
    });
});
