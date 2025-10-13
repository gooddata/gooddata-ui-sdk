// (C) 2025 GoodData Corporation

import { type ReactNode } from "react";

import { FormattedMessage, useIntl } from "react-intl";

import { EditableLabel, UiCard } from "@gooddata/sdk-ui-kit";

import { CatalogItemLockMemo, type ICatalogItem } from "../catalogItem/index.js";
import { ObjectTypeIconMemo } from "../objectType/index.js";

export interface Props {
    item: ICatalogItem;
    canEdit: boolean;
    actions: ReactNode;
    updateItemTitle: (title: string) => void;
    updateItemDescription: (description: string) => void;
}

export function CatalogDetailHeader({
    item,
    canEdit,
    actions,
    updateItemTitle,
    updateItemDescription,
}: Props) {
    const intl = useIntl();

    return (
        <UiCard elevation="1">
            <div className="gd-analytics-catalog-detail__card">
                <div className="gd-analytics-catalog-detail__card__header">
                    <div className="gd-analytics-catalog-detail__card__header__title">
                        <ObjectTypeIconMemo
                            type={item.type ?? "analyticalDashboard"}
                            visualizationType={item.visualizationType}
                            size={32}
                        />
                        {item?.isLocked ? <CatalogItemLockMemo intl={intl} /> : null}
                        <div className="gd-analytics-catalog-detail__card__header__title__name">
                            {canEdit ? (
                                <EditableLabel
                                    isEditableLabelWidthBasedOnText
                                    placeholder={intl.formatMessage({
                                        id: "analyticsCatalog.catalogItem.title.add",
                                    })}
                                    onSubmit={updateItemTitle}
                                    value={item.title}
                                    maxRows={9999}
                                >
                                    {item.title ||
                                        intl.formatMessage({
                                            id: "analyticsCatalog.catalogItem.title.add",
                                        })}
                                    <i className="gd-icon-pencil" />
                                </EditableLabel>
                            ) : (
                                <>{item.title}</>
                            )}
                        </div>
                    </div>
                    {canEdit ? (
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
                                    isEditableLabelWidthBasedOnText
                                    onSubmit={updateItemDescription}
                                    value={item.description}
                                >
                                    {item.description ||
                                        intl.formatMessage({
                                            id: "analyticsCatalog.catalogItem.description.add",
                                        })}
                                    <i className="gd-icon-pencil" />
                                </EditableLabel>
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
                <div className="gd-analytics-catalog-detail__card__actions">{actions}</div>
            </div>
        </UiCard>
    );
}
