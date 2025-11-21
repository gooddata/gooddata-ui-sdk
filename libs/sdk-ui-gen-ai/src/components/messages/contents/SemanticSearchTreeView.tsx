// (C) 2025 GoodData Corporation

import { type KeyboardEvent, type MouseEvent, useCallback, useId } from "react";

import { useIntl } from "react-intl";

import { isSemanticSearchRelationship, isSemanticSearchResultItem } from "@gooddata/sdk-model";
import {
    LeveledSearchTreeView,
    type LeveledSearchTreeViewProps,
    SemanticSearchIntlProvider,
    buildSemanticSearchTreeViewItems,
} from "@gooddata/sdk-ui-semantic-search/internal";

import { type SemanticSearchContents } from "../../../model.js";
import { useConfig } from "../../ConfigContext.js";

type SemanticSearchTreeViewProps = {
    workspace: string;
    content: SemanticSearchContents;
    locale: string;
};

export function SemanticSearchTreeView({ workspace, content, locale }: SemanticSearchTreeViewProps) {
    const intl = useIntl();
    const { canFullControl, canManage, canAnalyze, linkHandler } = useConfig();

    const canEdit = canFullControl || canManage || canAnalyze;

    const items = buildSemanticSearchTreeViewItems({
        intl,
        workspace,
        searchResults: content.searchResults,
        relationships: content.relationships,
        threshold: 0, // Keep all items for now
        canEdit,
    });
    const id = useId();
    const treeViewId = `gen-ai-chat/${id}/treeview`;

    const handleSelect = useCallback<LeveledSearchTreeViewProps["onSelect"]>(
        (item, mods, event: MouseEvent | KeyboardEvent) => {
            if (linkHandler) {
                const data = item.data;
                const itemUrl = item.url ?? "";
                const newTab = Boolean(mods.newTab);
                const preventDefault = event.preventDefault.bind(event);

                if (isSemanticSearchResultItem(data)) {
                    linkHandler({
                        id: data.id,
                        type: data.type,
                        workspaceId: data.workspaceId ?? workspace,
                        itemUrl,
                        newTab,
                        preventDefault,
                    });
                }
                if (isSemanticSearchRelationship(data)) {
                    linkHandler({
                        id: data.sourceObjectId,
                        type: data.sourceObjectType,
                        workspaceId: data.sourceWorkspaceId ?? workspace,
                        itemUrl,
                        newTab,
                        preventDefault,
                    });
                }
            }
        },
        [linkHandler, workspace],
    );

    if (items.length === 0) {
        return null;
    }

    return (
        <SemanticSearchIntlProvider locale={locale}>
            <LeveledSearchTreeView
                items={items}
                id={treeViewId}
                onSelect={handleSelect}
                maxHeight={300 + 2}
            />
        </SemanticSearchIntlProvider>
    );
}
