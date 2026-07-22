// (C) 2025-2026 GoodData Corporation

import { type KeyboardEvent, type MouseEvent, useCallback, useId } from "react";

import { useIntl } from "react-intl";
import { useSelector } from "react-redux";

import { isSemanticSearchRelationship, isSemanticSearchResultItem } from "@gooddata/sdk-model";
import { useBackendStrict } from "@gooddata/sdk-ui";
import {
    LeveledSearchTreeView,
    type LeveledSearchTreeViewProps,
    PermissionsProvider,
    SemanticSearchIntlProvider,
    buildSemanticSearchTreeViewItems,
} from "@gooddata/sdk-ui-semantic-search/internal";

import { type SemanticSearchContents } from "../../../model.js";
import { settingsSelector } from "../../../store/chatWindow/chatWindowSelectors.js";
import { useConfig } from "../../ConfigContext.js";

type SemanticSearchTreeViewProps = {
    workspace: string;
    content: SemanticSearchContents;
    maxHeight: number;
};

export function SemanticSearchTreeView(props: SemanticSearchTreeViewProps) {
    const intl = useIntl();

    return (
        <SemanticSearchIntlProvider locale={intl.locale}>
            <SemanticSearchTreeViewImpl {...props} />
        </SemanticSearchIntlProvider>
    );
}

export function SemanticSearchTreeViewImpl({ workspace, content, maxHeight }: SemanticSearchTreeViewProps) {
    const intl = useIntl();
    const backend = useBackendStrict();
    const { canFullControl, canManage, canAnalyze, linkHandler } = useConfig();
    const settings = useSelector(settingsSelector);

    const canEdit = canFullControl || canManage || canAnalyze;
    const useHostAnalyticalDesigner = Boolean(settings?.enableShellApplication_analyticalDesigner);
    const useHostDashboards = Boolean(settings?.enableShellApplication_dashboards);

    const items = buildSemanticSearchTreeViewItems({
        intl,
        workspace,
        searchResults: content.searchResults,
        relationships: content.relationships,
        threshold: 0, // Keep all items for now
        canEdit,
        uiPathOptions: {
            useHostedMetricEditor: true,
            useHostedAnalyticalDesigner: useHostAnalyticalDesigner,
            useHostedLdmModeler: true,
            useHostedDashboards: useHostDashboards,
        },
    });
    const id = useId();
    const treeViewId = `gen-ai-chat-${id}-treeview`;

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
        <PermissionsProvider backend={backend} workspace={workspace}>
            <LeveledSearchTreeView
                items={items}
                id={treeViewId}
                onSelect={handleSelect}
                maxHeight={maxHeight}
                tabIndex={0}
            />
        </PermissionsProvider>
    );
}
