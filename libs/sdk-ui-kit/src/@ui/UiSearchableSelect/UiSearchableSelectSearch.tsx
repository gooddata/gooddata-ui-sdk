// (C) 2026 GoodData Corporation

import { defineMessages, useIntl } from "react-intl";

import { useDebounce } from "@gooddata/sdk-ui";

import { type IAccessibilityConfigBase } from "../../typings/accessibility.js";
import { type IUiListboxInteractiveItem } from "../UiListbox/types.js";
import { getNextFocusableItemId, makeItemId } from "../UiListbox/UiListbox.js";
import { UiTextInput } from "../UiTextInput/UiTextInput.js";

import { e } from "./searchableSelectBem.js";
import { useUiSearchableSelectContext } from "./UiSearchableSelectContext.js";

const messages = defineMessages({
    searchPlaceholder: { id: "uiKit.searchableSelect.searchPlaceholder" },
    searchAriaLabel: { id: "uiKit.searchableSelect.searchAriaLabel" },
});

/**
 * @internal
 */
export interface IUiSearchableSelectSearchProps {
    accessibilityConfig?: IAccessibilityConfigBase;
    placeholder?: string;
}

/**
 * @internal
 */
export function UiSearchableSelectSearch({
    accessibilityConfig = {},
    placeholder,
}: IUiSearchableSelectSearchProps) {
    const intl = useIntl();
    const {
        query,
        setQuery,
        listboxItems,
        listboxId,
        focusedItemId,
        setFocusedItemId,
        isActiveDescendantShown,
        setIsActiveDescendantShown,
        value,
        onChange,
        closeDropdown,
    } = useUiSearchableSelectContext();

    // while typing, the search points at the highlight only a moment after the last key, like in React Aria,
    // so that screen readers read the typed letter first
    const showActiveDescendantLater = useDebounce(() => setIsActiveDescendantShown(true), 300);
    const changeQuery = (nextQuery: string) => {
        setQuery(nextQuery);
        setIsActiveDescendantShown(false);
        // without a query, it's like a fresh opening again: the search points at nothing until an arrow key
        if (nextQuery) {
            showActiveDescendantLater();
        } else {
            showActiveDescendantLater.cancel();
        }
    };

    // focus stays in the search, which moves the highlight that the list shows (virtual focus)
    const activeItem = listboxItems.find(
        (item): item is IUiListboxInteractiveItem<unknown> =>
            item.type === "interactive" && item.id === focusedItemId,
    );

    return (
        <div className={e("search")}>
            <UiTextInput
                value={query}
                onChange={changeQuery}
                onKeyDown={(event) => {
                    // while an input method composes text (e.g. Japanese), the keys are its own; Safari reports
                    // the key that ends the composition after it, with only the keyCode 229 left
                    if (event.nativeEvent.isComposing || event.keyCode === 229) {
                        return;
                    }
                    if (event.key === "ArrowDown" || event.key === "ArrowUp") {
                        // keeps the caret where it is
                        event.preventDefault();
                        const direction = event.key === "ArrowDown" ? "down" : "up";
                        setIsActiveDescendantShown(true);
                        setFocusedItemId(
                            getNextFocusableItemId({ items: listboxItems, focusedItemId, direction }),
                        );
                    } else if (event.key === "Enter" && activeItem) {
                        // like escape, the event ends here, so that e.g. a surrounding dialog doesn't submit
                        event.preventDefault();
                        event.stopPropagation();
                        // like a native <select>, picking the already selected item only closes the list
                        if (activeItem.id !== value) {
                            onChange(activeItem.id);
                        }
                        closeDropdown();
                    } else if (event.key === "Escape") {
                        // the first escape clears the query, the next one closes the list; the event ends here,
                        // so that e.g. a surrounding dialog doesn't close too
                        event.preventDefault();
                        event.stopPropagation();
                        if (query) {
                            changeQuery("");
                        } else {
                            closeDropdown();
                        }
                    }
                }}
                placeholder={placeholder ?? intl.formatMessage(messages.searchPlaceholder)}
                iconBefore="search"
                size="small"
                accessibilityConfig={{
                    ariaLabel: intl.formatMessage(messages.searchAriaLabel),
                    ...accessibilityConfig,
                    // a combobox that filters the list it controls; the list is shown while the search is
                    role: "combobox",
                    ariaExpanded: true,
                    ariaControls: listboxId,
                    ariaAutocomplete: "list",
                    ariaActiveDescendant: isActiveDescendantShown
                        ? makeItemId(listboxId, activeItem)
                        : undefined,
                }}
            />
        </div>
    );
}
