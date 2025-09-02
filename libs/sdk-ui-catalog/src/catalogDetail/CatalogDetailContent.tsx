// (C) 2025 GoodData Corporation

import React, { useMemo, useState } from "react";

import { FormattedMessage, useIntl } from "react-intl";

import { ErrorComponent, LoadingComponent, useWorkspaceStrict } from "@gooddata/sdk-ui";
import { UiButton, UiCard, UiDate, type UiTab, UiTabs, UiTags } from "@gooddata/sdk-ui-kit";

import { CatalogDetailContentRow } from "./CatalogDetailContentRow.js";
import { useCatalogItemLoad } from "./hooks/useCatalogItemLoad.js";
import type { ICatalogItem } from "../catalogItem/types.js";
import type { ObjectType } from "../objectType/index.js";
import { TitleColumnIcon } from "../objectType/TitleColumnIcon.js";

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
}: CatalogDetailContentProps & {
    focusRef?: React.RefObject<HTMLElement>;
}) {
    const intl = useIntl();
    const workspaceId = useWorkspaceStrict();
    const { item, status, error } = useCatalogItemLoad({ objectId, objectType, objectDefinition });

    const isDeletable = false;
    const isCreatable = false;
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
                                    <TitleColumnIcon type={item.type ?? "analyticalDashboard"} />
                                    <div className="gd-analytics-catalog-detail__card__header__title__name">
                                        {item.title}
                                    </div>
                                </div>
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
                                        tags={item.tags.map((tag) => ({ id: tag, label: tag, isDeletable }))}
                                        canCreateTag={isCreatable}
                                        canDeleteTags={isDeletable}
                                        mode="multi-line"
                                        onTagClick={(tag) => {
                                            onTagClick?.(tag.label);
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
