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
        listboxLabelledBy,
        listboxLabel,
        listboxId,
        focusedItemId,
        setFocusedItemId,
        setIsActiveDescendantShown,
        value,
        onChange,
        closeDropdown,
        shouldCloseOnSelect,
        isFullscreen,
    } = useUiSearchableSelectContext();
    const noItemsMessage = noItemsText ?? intl.formatMessage(messages.noItems);
    // the results of the search, without the dividers
    const options = listboxItems.filter(
        (item): item is IUiListboxInteractiveItem<unknown> => item.type === "interactive",
    );

    return (
        <>
            <UiSearchResultsAnnouncement
                totalResults={query ? options.length : undefined}
                resultValues={options.map((option) => option.stringTitle)}
                noResultsText={noItemsMessage}
            />

            <UiListbox
                items={listboxItems}
                selectedItemId={value ?? undefined}
                onSelect={(item) => {
                    if (item.id !== value) {
                        onChange(item.id);
                    }
                }}
                onClose={closeDropdown}
                shouldCloseOnSelect={shouldCloseOnSelect}
                shouldSelectOnOptionClick
                focusedItemId={focusedItemId}
                onFocusedItemIdChange={(itemId) => {
                    setFocusedItemId(itemId);
                    setIsActiveDescendantShown(true);
                }}
                isCompact={!isFullscreen}
                padding="none"
                maxHeight={isFullscreen ? undefined : LIST_MAX_HEIGHT}
                ariaAttributes={{
                    id: listboxId,
                    "aria-labelledby": listboxLabelledBy,
                    "aria-label": listboxLabel,
                }}
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
