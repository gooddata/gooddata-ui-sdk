// (C) 2025 GoodData Corporation

import React, { useMemo, useState } from "react";

import { FormattedMessage, useIntl } from "react-intl";

import type { IWorkspacePermissions } from "@gooddata/sdk-model";
import { ErrorComponent, LoadingComponent, useWorkspaceStrict } from "@gooddata/sdk-ui";
import { EditableLabel, UiButton, UiCard, UiDate, type UiTab, UiTabs, UiTags } from "@gooddata/sdk-ui-kit";

import { CatalogDetailContentRow } from "./CatalogDetailContentRow.js";
import { useCatalogItemUpdate } from "./hooks/useCatalogItemUpdate.js";
import { CatalogItemLockMemo, type ICatalogItem, type ICatalogItemRef } from "../catalogItem/index.js";
import { type ObjectType, ObjectTypeIconMemo } from "../objectType/index.js";
import { usePermissionsState } from "../permission/index.js";

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
    onOpenClick?: (event: React.MouseEvent, linkClickEvent: OpenHandlerEvent) => void;
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
}: CatalogDetailContentProps & {
    focusRef?: React.RefObject<HTMLElement>;
}) {
    const intl = useIntl();
    const workspaceId = useWorkspaceStrict();

    const permissionsState = usePermissionsState();
    const currentUser = permissionsState.result?.user;

    const { item, status, error, updateItemTitle, updateItemDescription, updateItemTags } =
        useCatalogItemUpdate({
            currentUser,
            objectId,
            objectType,
            objectDefinition,
            onUpdate: onCatalogItemUpdate,
            onError: onCatalogItemUpdateError,
        });

    const canUpdate = canUpdateCatalogItem(permissionsState.result?.permissions, item);

    const tabs = useMemo(
        () =>
            [
                {
                    id: "details",
                    label: intl.formatMessage({ id: "analyticsCatalog.catalogItem.tab.details" }),
                },
            ] as UiTab[],
        [intl],
    );
    const [selectedTab, setSelectedTab] = useState(tabs[0]);

    return (
        <div className="gd-analytics-catalog-detail">
            {status === "loading" || status === "pending" ? (
                <div className="gd-analytics-catalog-detail__loading">
                    <LoadingComponent />
                </div>
            ) : null}
            {status === "error" && error ? (
                <div className="gd-analytics-catalog-detail__error">
                    <ErrorComponent
                        message={intl.formatMessage({ id: "analyticsCatalog.error.unknown.message" })}
                        description={error.message}
                    />
                </div>
            ) : null}
            {status === "success" && item ? (
                <div className="gd-analytics-catalog-detail__content">
                    <UiCard elevation="1">
                        <div className="gd-analytics-catalog-detail__card">
                            <div className="gd-analytics-catalog-detail__card__header">
                                <div className="gd-analytics-catalog-detail__card__header__title">
                                    <ObjectTypeIconMemo
                                        type={item.type ?? "analyticalDashboard"}
                                        visualizationType={item.visualisationType}
                                        size={32}
                                    />
                                    {item?.isLocked ? <CatalogItemLockMemo intl={intl} /> : null}
                                    <div className="gd-analytics-catalog-detail__card__header__title__name">
                                        {canUpdate ? (
                                            <EditableLabel
                                                isEditableLabelWidthBasedOnText={true}
                                                onSubmit={updateItemTitle}
                                                value={item.title}
                                            />
                                        ) : (
                                            <>{item.title}</>
                                        )}
                                    </div>
                                </div>
                                {canUpdate ? (
                                    <div className="gd-analytics-catalog-detail__card__header__row">
                                        <div className="gd-analytics-catalog-detail__card__header__row__subtitle">
                                            <FormattedMessage id="analyticsCatalog.catalogItem.description" />
                                        </div>
                                        <div className="gd-analytics-catalog-detail__card__header__row__content">
                                            <EditableLabel
                                                maxRows={9999}
                                                placeholder={intl.formatMessage({
                                                    id: "analyticsCatalog.catalogItem.description.add",
                                                })}
                                                isEditableLabelWidthBasedOnText={true}
                                                onSubmit={updateItemDescription}
                                                value={item.description}
                                            />
                                        </div>
                                    </div>
                                ) : (
                                    <>
                                        {item.description ? (
                                            <div className="gd-analytics-catalog-detail__card__header__row">
                                                <div className="gd-analytics-catalog-detail__card__header__row__subtitle">
                                                    <FormattedMessage id="analyticsCatalog.catalogItem.description" />
                                                </div>
                                                <div className="gd-analytics-catalog-detail__card__header__row__content">
                                                    {item.description}
                                                </div>
                                            </div>
                                        ) : null}
                                    </>
                                )}
                                <div>
                                    <div className="gd-analytics-catalog-detail__card__header__row__subtitle">
                                        <FormattedMessage id="analyticsCatalog.catalogItem.id" />
                                    </div>
                                    <div className="gd-analytics-catalog-detail__card__header__row__content">
                                        {item.identifier}
                                    </div>
                                </div>
                            </div>
                            <div className="gd-analytics-catalog-detail__card__actions">
                                <UiButton
                                    label={intl.formatMessage({ id: "analyticsCatalog.catalogItem.open" })}
                                    variant="primary"
                                    ref={focusRef as React.RefObject<HTMLButtonElement>}
                                    onClick={(e) => {
                                        onOpenClick?.(e, {
                                            item,
                                            workspaceId,
                                            newTab: e.metaKey || e.ctrlKey,
                                            preventDefault: e.preventDefault.bind(e),
                                        });
                                    }}
                                />
                            </div>
                        </div>
                    </UiCard>
                    <UiTabs
                        size="large"
                        tabs={tabs}
                        onTabSelect={setSelectedTab}
                        selectedTabId={selectedTab?.id ?? ""}
                    />
                    <div className="gd-analytics-catalog-detail__tab-content">
                        <CatalogDetailContentRow
                            title={<FormattedMessage id="analyticsCatalog.column.title.createdBy" />}
                            content={item.createdBy ?? undefined}
                        />
                        <CatalogDetailContentRow
                            title={<FormattedMessage id="analyticsCatalog.column.title.createdAt" />}
                            content={
                                item.createdAt ? (
                                    <UiDate date={item.createdAt} locale={intl.locale} />
                                ) : undefined
                            }
                        />
                        {item.createdBy === item.updatedBy && !item.updatedBy ? null : (
                            <CatalogDetailContentRow
                                title={<FormattedMessage id="analyticsCatalog.column.title.updatedBy" />}
                                content={item.updatedBy ?? undefined}
                            />
                        )}
                        {item.createdAt?.getTime() === item.updatedAt?.getTime() ? null : (
                            <CatalogDetailContentRow
                                title={<FormattedMessage id="analyticsCatalog.column.title.updatedAt" />}
                                content={
                                    item.updatedAt ? (
                                        <UiDate date={item.updatedAt} locale={intl.locale} />
                                    ) : undefined
                                }
                            />
                        )}
                        <CatalogDetailContentRow
                            title={<FormattedMessage id="analyticsCatalog.column.title.tags" />}
                            content={
                                <>
                                    <UiTags
                                        tags={item.tags.map((tag) => ({
                                            id: tag,
                                            label: tag,
                                            isDeletable: canUpdate,
                                        }))}
                                        canCreateTag={canUpdate}
                                        canDeleteTags={canUpdate}
                                        mode="multi-line"
                                        onTagClick={(tag) => {
                                            onTagClick?.(tag.label);
                                        }}
                                        onTagAdd={(tag) => {
                                            updateItemTags([...item.tags, tag.label]);
                                        }}
                                        onTagRemove={(tag) => {
                                            updateItemTags(item.tags.filter((t) => t !== tag.label));
                                        }}
                                        addLabel={intl.formatMessage({
                                            id: "analyticsCatalog.tags.manager.label.addLabel",
                                        })}
                                        nameLabel={intl.formatMessage({
                                            id: "analyticsCatalog.tags.manager.label.nameLabel",
                                        })}
                                        cancelLabel={intl.formatMessage({
                                            id: "analyticsCatalog.tags.manager.label.cancelLabel",
                                        })}
                                        saveLabel={intl.formatMessage({
                                            id: "analyticsCatalog.tags.manager.label.saveLabel",
                                        })}
                                        removeLabel={intl.formatMessage({
                                            id: "analyticsCatalog.tags.manager.label.removeLabel",
                                        })}
                                        moreLabel={intl.formatMessage({
                                            id: "analyticsCatalog.tags.manager.label.more",
                                        })}
                                        noTagsLabel={intl.formatMessage({
                                            id: "analyticsCatalog.tags.manager.label.noTags",
                                        })}
                                        closeLabel={intl.formatMessage({
                                            id: "analyticsCatalog.tags.manager.label.close",
                                        })}
                                    />
                                </>
                            }
                        />
                    </div>
                </div>
            ) : null}
        </div>
    );
}

function canUpdateCatalogItem(workspacePermissions?: IWorkspacePermissions, item?: ICatalogItem | null) {
    const isLocked = item?.isLocked;

    // if item is locked, user cannot update it at all
    if (isLocked) {
        return false;
    }
    // if user has manage project permission, they can update it not matter what
    // type of item it is
    if (workspacePermissions?.canManageProject) {
        return true;
    }

    // if user has create visualization permission, they can update it if it is visualization
    // or dashboard with access to it
    const allowed: ObjectType[] = ["analyticalDashboard", "insight"];
    if (workspacePermissions?.canCreateVisualization) {
        return !!item && allowed.includes(item.type);
    }

    return false;
}
