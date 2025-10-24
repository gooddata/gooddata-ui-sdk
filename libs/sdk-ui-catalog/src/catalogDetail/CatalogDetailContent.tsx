// (C) 2025 GoodData Corporation

import { type MouseEvent, type RefObject, useMemo, useState } from "react";

import { useIntl } from "react-intl";

import { useWorkspaceStrict } from "@gooddata/sdk-ui";
import { UiButton, UiSkeleton, type UiTab, UiTabs } from "@gooddata/sdk-ui-kit";

import { CatalogDetailHeader } from "./CatalogDetailHeader.js";
import { CatalogDetailStatus } from "./CatalogDetailStatus.js";
import { CatalogDetailTabMetadata } from "./CatalogDetailTabMetadata.js";
import { CatalogDetailTabQuality } from "./CatalogDetailTabQuality.js";
import { useCatalogItemUpdate } from "./hooks/useCatalogItemUpdate.js";
import { type ICatalogItem, type ICatalogItemRef, canEditCatalogItem } from "../catalogItem/index.js";
import { type ObjectType } from "../objectType/index.js";
import { usePermissionsState } from "../permission/index.js";
import { useQualityIssuesById, useQualityReportState } from "../quality/index.js";

const Tabs = {
    METADATA: "metadata",
    QUALITY: "issues",
} as const;

/**
 * @internal
 */
export type OpenHandlerEvent = {
    /**
     * Catalog item to open.
     */
    item: ICatalogItem;
    /**
     * Workspace ID.
     */
    workspaceId: string;
    /**
     * Whether to open the catalog item in a new tab.
     */
    newTab: boolean;
    /**
     * Prevents the default action.
     */
    preventDefault: () => void;
};

/**
 * @internal
 */
export interface CatalogDetailContentProps {
    /**
     * An object id of the catalog item.
     */
    objectId?: string | null;
    /**
     * An object type of the catalog item.
     */
    objectType?: ObjectType | null;
    /**
     * An object definition of the catalog item.
     */
    objectDefinition?: Partial<ICatalogItem> | null;
    /**
     * Handler for opening catalog items.
     */
    onOpenClick?: (event: MouseEvent, linkClickEvent: OpenHandlerEvent) => void;
    /**
     * Handler for tag click.
     */
    onTagClick?: (tag: string) => void;
    /**
     * Handler for catalog item update.
     */
    onCatalogItemUpdate?: (item: ICatalogItem, changes: Partial<ICatalogItem> & ICatalogItemRef) => void;
    /**
     * Handler for catalog item update error.
     */
    onCatalogItemUpdateError?: (error: Error) => void;
}

type Props = CatalogDetailContentProps & {
    focusRef?: RefObject<HTMLButtonElement | null>;
};

/**
 * @internal
 */
export function CatalogDetailContent({
    objectId,
    objectType,
    objectDefinition,
    focusRef,
    onOpenClick,
    onTagClick,
    onCatalogItemUpdate,
    onCatalogItemUpdateError,
}: Props) {
    const intl = useIntl();
    const workspaceId = useWorkspaceStrict();

    const { result: { user: currentUser, permissions, settings } = {} } = usePermissionsState();

    const {
        item,
        status,
        error,
        updateItemTitle,
        updateItemDescription,
        updateItemTags,
        updateItemIsHidden,
    } = useCatalogItemUpdate({
        currentUser,
        objectId,
        objectType,
        objectDefinition,
        onUpdate: onCatalogItemUpdate,
        onError: onCatalogItemUpdateError,
    });

    const canEdit = canEditCatalogItem(permissions, item);

    // Quality
    const { status: qualityStatus } = useQualityReportState();

    const isQualityEnabled = Boolean(settings?.["enableGenAICatalogQualityChecker"]);
    const isQualityVisible = isQualityEnabled && qualityStatus !== "error";
    const isQualityLoading = qualityStatus === "loading" || qualityStatus === "pending";

    const issues = useQualityIssuesById(item?.identifier ?? "") ?? [];
    const issueCount = issues.length > 0 ? `(${issues.length})` : "";

    // Tabs
    const tabs: UiTab[] = useMemo(() => {
        const tabs: UiTab[] = [
            {
                id: Tabs.METADATA,
                label: intl.formatMessage({ id: "analyticsCatalog.catalogItem.tab.details" }),
            },
        ];
        if (isQualityVisible) {
            tabs.push({
                id: Tabs.QUALITY,
                label: intl.formatMessage(
                    { id: "analyticsCatalog.catalogItem.tab.quality" },
                    { count: issueCount },
                ),
            });
        }
        return tabs;
    }, [intl, isQualityVisible, issueCount]);
    const [selectedTabId, setSelectedTabId] = useState<UiTab["id"]>(Tabs.METADATA);

    return (
        <div className="gd-analytics-catalog-detail">
            <CatalogDetailStatus status={status} error={error}>
                {item ? (
                    <div className="gd-analytics-catalog-detail__content">
                        <CatalogDetailHeader
                            item={item}
                            canEdit={canEdit}
                            updateItemTitle={updateItemTitle}
                            updateItemDescription={updateItemDescription}
                            actions={
                                <UiButton
                                    label={intl.formatMessage({ id: "analyticsCatalog.catalogItem.open" })}
                                    variant="primary"
                                    ref={focusRef}
                                    onClick={(event) => {
                                        onOpenClick?.(event, {
                                            item,
                                            workspaceId,
                                            newTab: event.metaKey || event.ctrlKey,
                                            preventDefault: event.preventDefault.bind(event),
                                        });
                                    }}
                                />
                            }
                        />
                        <UiTabs
                            size="large"
                            tabs={tabs}
                            onTabSelect={(tab) => setSelectedTabId(tab.id)}
                            selectedTabId={selectedTabId}
                        />
                        {selectedTabId === Tabs.METADATA && (
                            <CatalogDetailTabMetadata
                                item={item}
                                canEdit={canEdit}
                                onTagClick={(tag) => {
                                    onTagClick?.(tag.label);
                                }}
                                onTagAdd={(tag) => {
                                    updateItemTags([...item.tags, tag.label]);
                                }}
                                onTagRemove={(tag) => {
                                    updateItemTags(item.tags.filter((t) => t !== tag.label));
                                }}
                                onIsHiddenChange={(isHidden) => {
                                    updateItemIsHidden(isHidden);
                                }}
                            />
                        )}
                        {selectedTabId === Tabs.QUALITY &&
                            (isQualityLoading ? (
                                <UiSkeleton itemsCount={2} itemHeight={65} itemsGap={10} />
                            ) : (
                                <CatalogDetailTabQuality item={item} issues={issues} />
                            ))}
                    </div>
                ) : null}
            </CatalogDetailStatus>
        </div>
    );
}
