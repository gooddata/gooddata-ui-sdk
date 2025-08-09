// (C) 2025 GoodData Corporation
import React, { useCallback } from "react";
import { UiStaticTreeview, type UiStaticTreeView, type IUiTreeViewItem } from "@gooddata/sdk-ui-kit";
import { useIntl } from "react-intl";
import { HistorySearchTreeViewItem } from "./HistorySearchTreeViewItem.js";

type Props = {
    id: string;
    searchHistory: string[];
    onSelect: (value: string) => void;
    onFocus: (nodeId: string) => void;
};

/**
 * A tree view component for history search results.
 * @internal
 */
export function HistorySearchTreeView({ id, searchHistory, onSelect, onFocus }: Props) {
    const intl = useIntl();
    const items = buildItems(searchHistory);

    const handleSelect = useCallback(
        (item: IUiTreeViewItem<string>) => {
            onSelect(item.data);
        },
        [onSelect],
    );

    return (
        <UiStaticTreeview
            items={items}
            ariaAttributes={{
                id,
                tabIndex: -1,
                "aria-label": intl.formatMessage({ id: "semantic-search.tree.history" }),
            }}
            onSelect={handleSelect}
            onFocus={onFocus}
            ItemComponent={HistorySearchTreeViewItem}
            shouldKeyboardActionPreventDefault={false}
        />
    );
}

function buildItems(searchHistory: string[]): UiStaticTreeView<string>[] {
    return searchHistory.map(
        (value, idx): UiStaticTreeView<string> => ({
            item: {
                id: String(idx),
                stringTitle: value,
                data: value,
            },
        }),
    );
}
