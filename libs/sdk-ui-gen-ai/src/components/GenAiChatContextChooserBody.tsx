// (C) 2026 GoodData Corporation

import { type KeyboardEvent, useCallback, useEffect, useId } from "react";

import cx from "classnames";
import { defineMessages, useIntl } from "react-intl";

import { type ObjRef, areObjRefsEqual } from "@gooddata/sdk-model";
import { useDebouncedState } from "@gooddata/sdk-ui";
import {
    DEFAULT_ITEM_HEIGHT,
    DETAILED_ANNOUNCEMENT_THRESHOLD,
    Input,
    NoData,
    ScopedIdStore,
    ShortenedText,
    UiIcon,
    UiPagedVirtualList,
    UiSearchResultsAnnouncement,
    UiSubmenuHeader,
    isTypingKey,
    useScopedIdStoreValue,
} from "@gooddata/sdk-ui-kit";

import { type IGenAIContextObject } from "../types.js";

import { getIconByObject } from "./utils/icons.js";

const SEARCH_FIELD_VISIBILITY_THRESHOLD = 7;
const SEARCH_DEBOUNCE_MS = 300;
const MAX_VISIBLE_ITEMS = 7;
const LOADING_SKELETON_ITEMS_COUNT = 3;

const msgs = defineMessages({
    close: {
        id: "gd.gen-ai.context.close",
    },
    listAriaLabel: {
        id: "gd.gen-ai.context.list.ariaLabel",
    },
    searchPlaceholder: {
        id: "gd.gen-ai.context.search.placeholder",
    },
    searchAriaLabel: {
        id: "gd.gen-ai.context.search.ariaLabel",
    },
    noMatchingData: {
        id: "gd.gen-ai.context.noMatchingData",
    },
    noDataAvailable: {
        id: "gd.gen-ai.context.noDataAvailable",
    },
});

type GenAiChatContextChooserBodyProps = {
    inputItems: IGenAIContextObject[];
    title: string;
    titleId: string;
    search: string;
    onSearchChange: (search: string) => void;
    selectedIds?: ObjRef[];
    isLoading?: boolean;
    hasNextPage?: boolean;
    loadNextPage?: () => void;
    ariaAttributes: {
        id: string;
        role?: string;
        "aria-labelledby"?: string;
    };
    onSelect: (item: IGenAIContextObject) => void;
    closeDropdown: () => void;
};

export function GenAiChatContextChooserBody({
    inputItems,
    title,
    titleId,
    search,
    selectedIds,
    onSearchChange,
    isLoading = false,
    hasNextPage = false,
    loadNextPage,
    ariaAttributes,
    onSelect,
    closeDropdown,
}: GenAiChatContextChooserBodyProps) {
    const intl = useIntl();
    const listboxId = useId();
    const [searchString, setSearchString, debouncedSearch] = useDebouncedState(search, SEARCH_DEBOUNCE_MS);

    useEffect(() => {
        if (debouncedSearch.trim() !== search) {
            onSearchChange(debouncedSearch.trim());
        }
    }, [debouncedSearch, search, onSearchChange]);

    const isSearchFieldVisible =
        inputItems.length > SEARCH_FIELD_VISIBILITY_THRESHOLD || searchString.length > 0 || hasNextPage;
    const normalizedSearch = search.trim().toLowerCase();

    const scopedIdStoreValue = useScopedIdStoreValue(
        (item: IGenAIContextObject) => `${item.type}-${item.id}`,
    );

    const handleSelect = useCallback(
        (item: IGenAIContextObject) => {
            onSelect(item);
            closeDropdown();
        },
        [closeDropdown, onSelect],
    );

    const hasNoData = !isLoading && inputItems.length === 0;
    const hasNoMatchingData = hasNoData && normalizedSearch.length > 0;
    const searchFilled = searchString.length > 0;

    const onEscKeyPress = useCallback(
        (event: KeyboardEvent) => {
            if (searchFilled) {
                event.stopPropagation();
            } else {
                closeDropdown();
            }
        },
        [closeDropdown, searchFilled],
    );

    const shouldShowPagedList = !hasNoData || hasNextPage;
    const skeletonItemsCount =
        isLoading || (hasNextPage && inputItems.length === 0) ? LOADING_SKELETON_ITEMS_COUNT : 0;

    const visibleRowsCount = inputItems.length + skeletonItemsCount;
    const listMaxHeight = Math.min(Math.max(visibleRowsCount, 1), MAX_VISIBLE_ITEMS) * DEFAULT_ITEM_HEIGHT;

    return (
        <div
            {...ariaAttributes}
            aria-labelledby={titleId}
            className="gd-gen-ai-chat__context-chooser"
            data-testid="context_chooser_menu"
        >
            <UiSubmenuHeader
                title={title}
                titleId={titleId}
                height="medium"
                onClose={closeDropdown}
                closeAriaLabel={intl.formatMessage(msgs.close)}
            />
            {isSearchFieldVisible ? (
                <>
                    <div
                        onKeyDown={(event) => {
                            if (isTypingKey(event)) {
                                event.stopPropagation();
                            }
                        }}
                    >
                        <Input
                            className={cx("gd-list-searchfield", "gd-flex-item")}
                            value={searchString}
                            onChange={(value) => setSearchString(String(value))}
                            onEscKeyPress={onEscKeyPress}
                            placeholder={intl.formatMessage(msgs.searchPlaceholder)}
                            autofocus
                            clearOnEsc
                            isSearch
                            isSmall
                            type="search"
                            accessibilityConfig={{
                                ariaLabel: intl.formatMessage(msgs.searchAriaLabel),
                                ariaControls: listboxId,
                            }}
                        />
                    </div>
                    <UiSearchResultsAnnouncement
                        totalResults={normalizedSearch ? inputItems.length : undefined}
                        resultValues={
                            inputItems.length <= DETAILED_ANNOUNCEMENT_THRESHOLD
                                ? inputItems.map((item) => item.title)
                                : undefined
                        }
                    />
                </>
            ) : null}
            {shouldShowPagedList ? (
                <ScopedIdStore value={scopedIdStoreValue}>
                    <UiPagedVirtualList
                        maxHeight={listMaxHeight}
                        items={inputItems}
                        itemHeight={DEFAULT_ITEM_HEIGHT}
                        itemsGap={0}
                        itemPadding={0}
                        skeletonItemsCount={skeletonItemsCount}
                        isLoading={isLoading}
                        hasNextPage={hasNextPage}
                        loadNextPage={loadNextPage}
                        representAs="listbox"
                        closeDropdown={closeDropdown}
                        onKeyDownConfirm={handleSelect}
                        listboxProps={{
                            id: listboxId,
                            "aria-label": intl.formatMessage(msgs.listAriaLabel),
                        }}
                    >
                        {(item) => (
                            <ContextChooserItem
                                item={item}
                                selected={selectedIds?.some((r) => areObjRefsEqual(r, item.ref))}
                                onSelect={() => handleSelect(item)}
                            />
                        )}
                    </UiPagedVirtualList>
                </ScopedIdStore>
            ) : (
                <NoData
                    hasNoMatchingData={hasNoMatchingData}
                    notFoundLabel={intl.formatMessage(msgs.noMatchingData)}
                    noDataLabel={intl.formatMessage(msgs.noDataAvailable)}
                />
            )}
        </div>
    );
}

function ContextChooserItem({
    item,
    selected,
    onSelect,
}: {
    item: IGenAIContextObject;
    selected?: boolean;
    onSelect: () => void;
}) {
    const icon = getIconByObject(item);

    return (
        <div
            className={cx("gd-list-item", {
                "gd-list-item--selected": selected,
            })}
            onClick={onSelect}
            aria-selected={selected}
        >
            {icon.iconBefore ? <UiIcon size={16} type={icon.iconBefore} color={icon.iconColor} /> : null}
            <ShortenedText ellipsisPosition="end">{item.title}</ShortenedText>
        </div>
    );
}
