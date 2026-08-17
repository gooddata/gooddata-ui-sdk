// (C) 2026 GoodData Corporation

import { type KeyboardEvent, useCallback, useId, useMemo, useState } from "react";

import cx from "classnames";
import { defineMessages, useIntl } from "react-intl";

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

import { getIconByType } from "./utils/icons.js";

const SEARCH_FIELD_VISIBILITY_THRESHOLD = 7;
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
    isLoading?: boolean;
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
    isLoading = false,
    ariaAttributes,
    onSelect,
    closeDropdown,
}: GenAiChatContextChooserBodyProps) {
    const intl = useIntl();
    const listboxId = useId();
    const [searchString, setSearchString] = useState("");

    const isSearchFieldVisible = inputItems.length > SEARCH_FIELD_VISIBILITY_THRESHOLD && !isLoading;
    const searchStringToUse = isSearchFieldVisible ? searchString : "";
    const normalizedSearch = searchStringToUse.trim().toLowerCase();

    const filteredItems = useMemo(() => {
        if (!normalizedSearch) {
            return inputItems;
        }

        return inputItems.filter((item) => item.title.toLowerCase().includes(normalizedSearch));
    }, [inputItems, normalizedSearch]);

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

    const hasNoData = !isLoading && filteredItems.length === 0;
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

    const listMaxHeight =
        Math.min(Math.max(filteredItems.length, 1), MAX_VISIBLE_ITEMS) * DEFAULT_ITEM_HEIGHT;

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
                            value={searchStringToUse}
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
                        totalResults={normalizedSearch ? filteredItems.length : undefined}
                        resultValues={
                            filteredItems.length <= DETAILED_ANNOUNCEMENT_THRESHOLD
                                ? filteredItems.map((item) => item.title)
                                : undefined
                        }
                    />
                </>
            ) : null}
            {hasNoData ? (
                <NoData
                    hasNoMatchingData={hasNoMatchingData}
                    notFoundLabel={intl.formatMessage(msgs.noMatchingData)}
                    noDataLabel={intl.formatMessage(msgs.noDataAvailable)}
                />
            ) : (
                <ScopedIdStore value={scopedIdStoreValue}>
                    <UiPagedVirtualList
                        maxHeight={listMaxHeight}
                        items={filteredItems}
                        itemHeight={DEFAULT_ITEM_HEIGHT}
                        itemsGap={0}
                        itemPadding={0}
                        skeletonItemsCount={isLoading ? LOADING_SKELETON_ITEMS_COUNT : 0}
                        isLoading={isLoading}
                        representAs="listbox"
                        closeDropdown={closeDropdown}
                        onKeyDownConfirm={handleSelect}
                        listboxProps={{
                            id: listboxId,
                            "aria-label": intl.formatMessage(msgs.listAriaLabel),
                        }}
                    >
                        {(item) => <ContextChooserItem item={item} onSelect={() => handleSelect(item)} />}
                    </UiPagedVirtualList>
                </ScopedIdStore>
            )}
        </div>
    );
}

function ContextChooserItem({ item, onSelect }: { item: IGenAIContextObject; onSelect: () => void }) {
    const icon = getIconByType(item.type);

    return (
        <div className="gd-list-item" title={item.title} onClick={onSelect}>
            {icon.iconBefore ? <UiIcon size={16} type={icon.iconBefore} color={icon.iconColor} /> : null}
            <ShortenedText ellipsisPosition="end">{item.title}</ShortenedText>
        </div>
    );
}
