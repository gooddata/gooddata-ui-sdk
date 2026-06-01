// (C) 2026 GoodData Corporation

import { type MouseEvent, useCallback } from "react";

import { type IAnalyticalBackend } from "@gooddata/sdk-backend-spi";
import { DomainHomepageLink, HeaderWorkspacePicker, type IHeaderWorkspace } from "@gooddata/sdk-ui-kit";

import { usePagedWorkspaces } from "./usePagedWorkspaces.js";

/**
 * @alpha
 */
export interface IWorkspacePickerProps {
    backend: IAnalyticalBackend;
    userId: string;
    selectedWorkspace?: IHeaderWorkspace;
    onWorkspaceSelect: (workspace: IHeaderWorkspace) => void;
    onHomepageLinkClick?: (evt: MouseEvent) => void;
}

/**
 * @alpha
 */
export function WorkspacePicker({
    backend,
    userId,
    selectedWorkspace,
    onWorkspaceSelect,
    onHomepageLinkClick,
}: IWorkspacePickerProps) {
    const {
        items,
        totalItemsCount,
        isLoading,
        search,
        onSearch,
        loadInitialItems,
        reset,
        initialLoadCompleted,
        hasNextPage,
        skeletonItemsCount,
        isNextPageLoading,
        shouldLoadNextPage,
        loadNextPage,
    } = usePagedWorkspaces({
        backend,
        userId,
    });

    const handleOpenStateChanged = useCallback(
        (opened: boolean) => {
            if (opened) {
                // Fetch initial items when dropdown opens
                loadInitialItems();
            } else {
                reset();
            }
        },
        [loadInitialItems, reset],
    );

    return (
        <HeaderWorkspacePicker
            projectPickerFooter={<DomainHomepageLink onClick={onHomepageLinkClick} />}
            workspaces={items}
            selectedWorkspace={selectedWorkspace}
            totalWorkspacesCount={totalItemsCount}
            searchString={search}
            showSearch={initialLoadCompleted}
            isLoading={isLoading ? items.length === 0 : false}
            onSelect={onWorkspaceSelect}
            onSearch={onSearch}
            onOpenStateChanged={handleOpenStateChanged}
            //paging props
            loadNextPage={loadNextPage}
            hasNextPage={hasNextPage}
            skeletonItemsCount={skeletonItemsCount}
            isNextPageLoading={isNextPageLoading}
            shouldLoadNextPage={shouldLoadNextPage}
        />
    );
}
