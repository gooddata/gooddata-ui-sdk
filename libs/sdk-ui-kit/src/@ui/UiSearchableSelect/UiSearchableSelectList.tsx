// (C) 2026 GoodData Corporation

import { Fragment, type ReactNode, isValidElement } from "react";

import { defineMessages, useIntl } from "react-intl";

import { type IUiListboxInteractiveItem } from "../UiListbox/types.js";
import { UiListbox } from "../UiListbox/UiListbox.js";
import { UiSearchResultsAnnouncement } from "../UiSearchResultsAnnouncement/UiSearchResultsAnnouncement.js";

import { e } from "./searchableSelectBem.js";
import { useUiSearchableSelectContext } from "./UiSearchableSelectContext.js";

const messages = defineMessages({
    noItems: { id: "uiKit.searchableSelect.noItems" },
});

const LIST_MAX_HEIGHT = 280;

/**
 * @internal
 */
export interface IUiSearchableSelectListProps<T> {
    children: (item: T) => ReactNode;
    noItemsText?: string;
}

// `children` is read by UiSearchableSelect (findUiSearchableSelectListRenderItem), which builds the items
/**
 * @internal
 */
export function UiSearchableSelectList<T>({ noItemsText }: IUiSearchableSelectListProps<T>) {
    const intl = useIntl();
    const {
        listboxItems,
        query,
        buttonId,
        listboxId,
        focusedItemId,
        setFocusedItemId,
        setIsActiveDescendantShown,
        value,
        onChange,
        closeDropdown,
    } = useUiSearchableSelectContext();
    const noItemsMessage = noItemsText ?? intl.formatMessage(messages.noItems);
    // the results of the search, without the dividers
    const options = listboxItems.filter(
        (item): item is IUiListboxInteractiveItem<unknown> => item.type === "interactive",
    );

    return (
        <>
            {/* tells screen readers the results while searching, the no items text too */}
            <UiSearchResultsAnnouncement
                totalResults={query ? options.length : undefined}
                resultValues={options.map((option) => option.stringTitle)}
                noResultsText={noItemsMessage}
            />

            <UiListbox
                items={listboxItems}
                selectedItemId={value ?? undefined}
                onSelect={(item) => {
                    // like a native <select>, picking the already selected item only closes the list
                    if (item.id !== value) {
                        onChange(item.id);
                    }
                }}
                // UiListbox closes after a selection (shouldCloseOnSelect defaults to true) through onClose
                onClose={closeDropdown}
                // selects on clicks on the option element itself too (tests, assistive technologies)
                shouldSelectOnOptionClick
                // the highlight is moved by the search, which keeps focus (virtual focus)
                focusedItemId={focusedItemId}
                // hovering moves the same highlight, so keyboard and mouse don't highlight two rows, and like
                // an arrow key, it lets the search point at it
                onFocusedItemIdChange={(itemId) => {
                    setFocusedItemId(itemId);
                    setIsActiveDescendantShown(true);
                }}
                isCompact
                padding="none"
                maxHeight={LIST_MAX_HEIGHT}
                ariaAttributes={{ id: listboxId, "aria-labelledby": buttonId }}
                supportedViews={["desktop"]}
            />

            {listboxItems.length ? null : <div className={e("no-items")}>{noItemsMessage}</div>}
        </>
    );
}

/**
 * Finds the item render function of the UiSearchableSelectList among the select's children. The root needs it
 * to show the selected item on the button while the list is not rendered (the dropdown is closed).
 */
export function findUiSearchableSelectListRenderItem(
    children: ReactNode,
): ((item: unknown) => ReactNode) | undefined {
    for (const child of Array.isArray(children) ? children : [children]) {
        if (
            isValidElement<IUiSearchableSelectListProps<unknown>>(child) &&
            child.type === UiSearchableSelectList
        ) {
            return child.props.children;
        }
        if (isValidElement<{ children?: ReactNode }>(child) && child.type === Fragment) {
            const renderItem = findUiSearchableSelectListRenderItem(child.props.children);
            if (renderItem) {
                return renderItem;
            }
        }
    }
    return undefined;
}
