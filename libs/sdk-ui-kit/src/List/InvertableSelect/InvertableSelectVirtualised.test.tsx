// (C) 2026 GoodData Corporation

import { useState } from "react";

import { act, fireEvent, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { render } from "../../../test/render.js";
import { SELECT_ITEM_ACTION } from "../../@ui/hooks/useListWithActionsKeyboardNavigation.js";
import { ScopedIdStore } from "../../@ui/hooks/useScopedId.js";

import {
    type IInvertableSelectVirtualisedRenderItemProps,
    InvertableSelectVirtualised,
} from "./InvertableSelectVirtualised.js";

const items = ["Andrew Harris", "Betty Smith", "Carl Jones"];
const identity = (item: string) => item;

function Item({
    item,
    title,
    isSelected,
    focusedAction,
    onSelect,
    onDeselect,
}: IInvertableSelectVirtualisedRenderItemProps<string>) {
    const makeId = ScopedIdStore.useContextStoreOptional((ctx) => ctx.makeId);

    return (
        <div role="row" onClick={isSelected ? onDeselect : onSelect}>
            <div role="gridcell">
                <label>
                    <input
                        type="checkbox"
                        tabIndex={focusedAction === SELECT_ITEM_ACTION ? 0 : -1}
                        id={makeId?.({ item, specifier: SELECT_ITEM_ACTION })}
                        readOnly
                        checked={isSelected}
                    />
                    <span>{title}</span>
                </label>
            </div>
        </div>
    );
}

function StatefulSelect() {
    const [selection, setSelection] = useState<{ selectedItems: string[]; isInverted: boolean }>({
        selectedItems: [],
        isInverted: true,
    });

    return (
        <InvertableSelectVirtualised<string>
            items={items}
            totalItemsCount={items.length}
            itemHeight={28}
            getItemKey={identity}
            getItemTitle={identity}
            isInverted={selection.isInverted}
            selectedItems={selection.selectedItems}
            onSelect={(selectedItems, isInverted) => setSelection({ selectedItems, isInverted })}
            renderItem={(props) => <Item {...props} />}
        />
    );
}

describe("InvertableSelectVirtualised", () => {
    it("lets a focused value checkbox toggle natively on Space, keeping the same focused node", () => {
        render(<StatefulSelect />);

        const checkbox = screen.getByRole("checkbox", { name: "Andrew Harris" });
        act(() => {
            checkbox.focus();
        });
        expect(checkbox).toBeChecked();

        // The browser toggles a native checkbox on Space only when the keydown is not prevented.
        const isNotPrevented = fireEvent.keyDown(checkbox, { key: " ", code: "Space" });
        expect(isNotPrevented).toBe(true);

        // The browser then activates the checkbox with a click.
        fireEvent.click(checkbox);

        const toggledCheckbox = screen.getByRole("checkbox", { name: "Andrew Harris" });
        expect(toggledCheckbox).toBe(checkbox);
        expect(toggledCheckbox).not.toBeChecked();
        expect(document.activeElement).toBe(checkbox);

        expect(fireEvent.keyDown(checkbox, { key: " ", code: "Space" })).toBe(true);
        fireEvent.click(checkbox);

        expect(screen.getByRole("checkbox", { name: "Andrew Harris" })).toBe(checkbox);
        expect(checkbox).toBeChecked();
        expect(document.activeElement).toBe(checkbox);
    });

    it("still handles the arrow keys on the value checkbox", () => {
        render(<StatefulSelect />);

        const checkbox = screen.getByRole("checkbox", { name: "Andrew Harris" });
        act(() => {
            checkbox.focus();
        });

        expect(fireEvent.keyDown(checkbox, { key: "ArrowDown", code: "ArrowDown" })).toBe(false);
    });
});
