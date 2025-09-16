// (C) 2025 GoodData Corporation

import { useCallback } from "react";

import { useIntl } from "react-intl";

import { type IUiTreeViewItem, type UiStaticTreeView, UiStaticTreeview } from "@gooddata/sdk-ui-kit";

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
