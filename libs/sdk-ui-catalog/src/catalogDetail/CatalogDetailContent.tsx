// (C) 2025-2026 GoodData Corporation

import { type MouseEvent, useCallback, useMemo, useRef } from "react";

import { useIntl } from "react-intl";

import { type SemanticQualityIssueAttributeName } from "@gooddata/sdk-model";
import { useLocalStorage, useWorkspaceStrict } from "@gooddata/sdk-ui";
import { type IUiTab, UiButton, UiSkeleton, UiTabs } from "@gooddata/sdk-ui-kit";

import { CatalogDetailHeader, type ICatalogDetailHeaderRef } from "./CatalogDetailHeader.js";
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
export interface ICatalogDetailContentProps {
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
     * Handler for navigating to a catalog item. Consumers can handle route changes.
     */
    onCatalogItemNavigation?: (event: MouseEvent, ref: ICatalogItemRef) => void;
    /**
     * Handler for catalog item update.
     */
    onCatalogItemUpdate?: (item: ICatalogItem, changes: Partial<ICatalogItem> & ICatalogItemRef) => void;
    /**
     * Handler for catalog item update error.
     */
    onCatalogItemUpdateError?: (error: Error) => void;
}

/**
 * @internal
 */
export function CatalogDetailContent({
    objectId,
    objectType,
    objectDefinition,
    onOpenClick,
    onTagClick,
    onCatalogItemUpdate,
    onCatalogItemUpdateError,
    onCatalogItemNavigation,
}: ICatalogDetailContentProps) {
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
        updateItemMetricType,
        updateItemFormat,
    } = useCatalogItemUpdate({
        currentUser,
        objectId,
        objectType,
        objectDefinition,
        onUpdate: onCatalogItemUpdate,
        onError: onCatalogItemUpdateError,
    });

    const canEdit = canEditCatalogItem(permissions, item);
    const separators = settings?.separators;
    const enableMetricFormatOverrides = Boolean(settings?.["enableMetricFormatOverrides"]);
    const currencyFormatOverride = settings?.currencyFormatOverride ?? null;

    // Quality
    const { status: qualityStatus } = useQualityReportState();

    const isQualityEnabled = Boolean(settings?.["enableGenAICatalogQualityChecker"]);
    const isQualityVisible = isQualityEnabled && qualityStatus !== "error";
    const isQualityLoading = qualityStatus === "loading" || qualityStatus === "pending";

    const issues = useQualityIssuesById(item?.identifier ?? "") ?? [];
    const issueCount = issues.length > 0 ? `(${issues.length})` : "";

    const headerRef = useRef<ICatalogDetailHeaderRef>(null);

    const handleEditClick = useCallback((attributeName: SemanticQualityIssueAttributeName) => {
        if (attributeName === "TITLE") {
            headerRef.current?.focusTitle();
        }
        if (attributeName === "DESCRIPTION") {
            headerRef.current?.focusDescription();
        }
    }, []);

    // Tabs
    const tabs: IUiTab[] = useMemo(() => {
        const tabs: IUiTab[] = [
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

    const [selectedTabId, setSelectedTabId] = useSelectedTabId(tabs);

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
                            headerRef={headerRef}
                            actions={
                                <UiButton
                                    label={intl.formatMessage({ id: "analyticsCatalog.catalogItem.open" })}
                                    variant="primary"
                                    accessibilityConfig={{ role: "link" }}
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
                                    // Adding unique tags only
                                    updateItemTags([...new Set([...item.tags, tag.label])]);
                                }}
                                onTagRemove={(tag) => {
                                    updateItemTags(item.tags.filter((t) => t !== tag.label));
                                }}
                                onIsHiddenChange={(isHidden) => {
                                    updateItemIsHidden(isHidden);
                                }}
                                onMetricTypeChange={(metricType) => {
                                    updateItemMetricType(metricType);
                                }}
                                onFormatChange={(format) => {
                                    updateItemFormat(format);
                                }}
                                separators={separators}
                                currencyFormatOverride={
                                    enableMetricFormatOverrides ? currencyFormatOverride : undefined
                                }
                                enableMetricFormatOverrides={enableMetricFormatOverrides}
                            />
                        )}
                        {selectedTabId === Tabs.QUALITY &&
                            (isQualityLoading ? (
                                <UiSkeleton itemsCount={2} itemHeight={65} itemsGap={10} />
                            ) : (
                                <CatalogDetailTabQuality
                                    item={item}
                                    issues={issues}
                                    canEdit={canEdit}
                                    onEditClick={handleEditClick}
                                    onCatalogItemNavigation={onCatalogItemNavigation}
                                />
                            ))}
                    </div>
                ) : null}
            </CatalogDetailStatus>
        </div>
    );
}

/**
 * Hook for managing the currently selected tab ID with persistent storage.
 */
function useSelectedTabId(tabs: IUiTab[]): [IUiTab["id"], (tabId: IUiTab["id"]) => void] {
    const [storedTabId, setStoredTabId] = useLocalStorage<IUiTab["id"]>(
        "gd.analyticsCatalog.catalogDetail.tabId",
        Tabs.METADATA,
    );
    const selectedTabId = tabs.some((tab) => tab.id === storedTabId) ? storedTabId : Tabs.METADATA;
    return [selectedTabId, setStoredTabId];
}
