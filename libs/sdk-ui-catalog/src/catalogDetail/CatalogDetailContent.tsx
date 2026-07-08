// (C) 2025-2026 GoodData Corporation

import { type MouseEvent, useCallback, useMemo, useRef } from "react";

import cx from "classnames";
import { useIntl } from "react-intl";

import { type SemanticQualityIssueAttributeName } from "@gooddata/sdk-model";
import { useLocalStorage } from "@gooddata/sdk-ui";
import { type IUiTab, UiSkeleton, UiTabs } from "@gooddata/sdk-ui-kit";

import { canEditCatalogItem } from "../catalogItem/permission.js";
import { type ICatalogItem, type ICatalogItemRef } from "../catalogItem/types.js";
import { useIsCertificationAllowed } from "../certification/gate.js";
import { useIsLineageEnabled } from "../lineage/gate.js";
import { useIsCatalogMetricEditorEnabled } from "../metric/gate.js";
import { type ObjectType } from "../objectType/types.js";
import { usePermissionsState } from "../permission/PermissionsContext.js";
import { useIsCatalogDescriptionGenerationEnabled, useIsCatalogQualityEnabled } from "../quality/gate.js";
import { useQualityIssuesById, useQualityReportState } from "../quality/QualityContext.js";

import { CatalogDetailActions } from "./CatalogDetailActions.js";
import { CatalogDetailHeader, type ICatalogDetailHeaderRef } from "./CatalogDetailHeader.js";
import { CatalogDetailStatus } from "./CatalogDetailStatus.js";
import { CatalogDetailTabCertification } from "./CatalogDetailTabCertification.js";
import { CatalogDetailTabLineage } from "./CatalogDetailTabLineage.js";
import { CatalogDetailTabMetadata } from "./CatalogDetailTabMetadata.js";
import { CatalogDetailTabQuality } from "./CatalogDetailTabQuality.js";
import { useCatalogItemUpdate } from "./hooks/useCatalogItemUpdate.js";
import { CatalogItemAccessRow } from "./share/CatalogItemAccessRow.js";
import { CatalogItemShareDialog } from "./share/CatalogItemShareDialog.js";
import { CatalogItemShareProvider } from "./share/CatalogItemShareProvider.js";
import { isShareableCatalogItem, toShareTarget } from "./share/guards.js";
import { useShareableLabels } from "./share/useShareableLabels.js";
import type { OpenHandlerEvent } from "./types.js";

const Tabs = {
    METADATA: "metadata",
    QUALITY: "issues",
    CERTIFICATION: "certification",
    LINEAGE: "lineage",
} as const;

/**
 * @public
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
    objectDefinition?: ICatalogItemRef | ICatalogItem | null;
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
     * Handler for catalog item create (e.g. duplicate).
     */
    onCatalogItemCreate?: (item: ICatalogItem) => void;
    /**
     * Handler for catalog item update.
     */
    onCatalogItemUpdate?: (item: ICatalogItem) => void;
    /**
     * Handler for catalog item delete.
     */
    onCatalogItemDelete?: (ref: ICatalogItemRef) => void;
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
    onCatalogItemCreate,
    onCatalogItemUpdate,
    onCatalogItemDelete,
    onCatalogItemUpdateError,
    onCatalogItemNavigation,
}: ICatalogDetailContentProps) {
    const intl = useIntl();

    const { result: { user: currentUser, permissions, settings } = {} } = usePermissionsState();

    const {
        item,
        status,
        error,
        updateItemTitle,
        updateItemDescription,
        updateItemTags,
        updateItemIsHidden,
        updateItemIsHiddenFromKda,
        updateItemMetricType,
        updateItemFormat,
        updateItemCertification,
        applyItemUpdate,
        applyItemDelete,
    } = useCatalogItemUpdate({
        currentUser,
        objectId,
        objectType,
        objectDefinition,
        onUpdate: onCatalogItemUpdate,
        onDelete: onCatalogItemDelete,
        onError: onCatalogItemUpdateError,
    });

    const canEdit = canEditCatalogItem(permissions, item);

    // Sharing (object-level permissions) — gated by the column-level-permissions
    // flag and limited to shareable item kinds (attributes, facts).
    const enableColumnLevelPermissions = Boolean(settings?.enableColumnLevelPermissions);
    const shareableItem =
        item && enableColumnLevelPermissions && isShareableCatalogItem(item) ? item : undefined;
    const shareTarget = useMemo(
        () => (shareableItem ? toShareTarget(shareableItem) : undefined),
        [shareableItem],
    );
    // Labels of the shared attribute drive both the header info row and the per-grantee
    // label-scope picker; fetched once here and passed to the share provider.
    const shareLabels = useShareableLabels(shareableItem);

    const separators = settings?.separators;
    const enableMetricFormatOverrides = Boolean(settings?.["enableMetricFormatOverrides"]);
    const currencyFormatOverride = settings?.currencyFormatOverride ?? null;
    const isDescriptionGenerationEnabled = useIsCatalogDescriptionGenerationEnabled();
    const isMetricEditorEnabled = useIsCatalogMetricEditorEnabled();

    // Quality
    const { status: qualityStatus } = useQualityReportState();

    const isQualityEnabled = useIsCatalogQualityEnabled();
    const isQualityVisible = isQualityEnabled && qualityStatus !== "error";
    const isQualityLoading = qualityStatus === "loading" || qualityStatus === "pending";

    const issues = useQualityIssuesById(item?.identifier ?? "") ?? [];
    const issueCount = issues.length > 0 ? `(${issues.length})` : "";

    // Certification
    const isCertificationVisible = useIsCertificationAllowed(item?.type);

    // Lineage
    const isLineageVisible = useIsLineageEnabled(item?.type);

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
        if (isCertificationVisible) {
            tabs.push({
                id: Tabs.CERTIFICATION,
                label: intl.formatMessage({ id: "analyticsCatalog.catalogItem.tab.certification" }),
            });
        }
        if (isLineageVisible) {
            tabs.push({
                id: Tabs.LINEAGE,
                label: intl.formatMessage({ id: "analyticsCatalog.catalogItem.tab.lineage" }),
            });
        }
        return tabs;
    }, [intl, isCertificationVisible, isQualityVisible, isLineageVisible, issueCount]);

    const [selectedTabId, setSelectedTabId] = useSelectedTabId(tabs);
    return (
        <CatalogItemShareProvider shareableItem={shareableItem} target={shareTarget} labels={shareLabels}>
            <div className="gd-analytics-catalog-detail">
                <CatalogDetailStatus status={status} error={error}>
                    {item ? (
                        <div
                            className={cx("gd-analytics-catalog-detail__content", {
                                lineage: selectedTabId === Tabs.LINEAGE,
                            })}
                        >
                            <CatalogDetailHeader
                                item={item}
                                canEdit={canEdit}
                                updateItemTitle={updateItemTitle}
                                updateItemDescription={updateItemDescription}
                                isDescriptionGenerationEnabled={isDescriptionGenerationEnabled}
                                headerRef={headerRef}
                                labels={shareableItem ? shareLabels.labels : undefined}
                                labelsLoading={shareableItem ? shareLabels.loading : false}
                                showInfoRow={enableColumnLevelPermissions}
                                actions={
                                    <CatalogDetailActions
                                        item={item}
                                        canEdit={canEdit}
                                        isMetricEditorEnabled={isMetricEditorEnabled}
                                        onOpen={onOpenClick}
                                        onCatalogItemCreate={onCatalogItemCreate}
                                        onCatalogItemUpdate={applyItemUpdate}
                                        onCatalogItemDelete={applyItemDelete}
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
                                    // With OLP off the dataset isn't relocated to the header,
                                    // so keep the Dataset row in the metadata tab.
                                    showDatasetRow={!enableColumnLevelPermissions}
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
                                    onIsHiddenFromKdaChange={(isHiddenFromKda) => {
                                        updateItemIsHiddenFromKda(isHiddenFromKda);
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
                                    accessRow={<CatalogItemAccessRow />}
                                />
                            )}
                            {selectedTabId === Tabs.CERTIFICATION && isCertificationVisible ? (
                                <CatalogDetailTabCertification
                                    item={item}
                                    canEdit={canEdit}
                                    onCertificationChange={(certification) => {
                                        updateItemCertification(certification);
                                    }}
                                />
                            ) : null}
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
                            {selectedTabId === Tabs.LINEAGE && <CatalogDetailTabLineage item={item} />}
                        </div>
                    ) : null}
                </CatalogDetailStatus>
                <CatalogItemShareDialog />
            </div>
        </CatalogItemShareProvider>
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
