// (C) 2025 GoodData Corporation

import { FormattedMessage, useIntl } from "react-intl";

import { UiDate, type UiTagDef, UiTags } from "@gooddata/sdk-ui-kit";

import { CatalogDetailContentRow } from "./CatalogDetailContentRow.js";
import type { ICatalogItem } from "../catalogItem/index.js";

type Props = {
    item: ICatalogItem;
    canEdit: boolean;
    onTagClick: (tag: UiTagDef) => void;
    onTagAdd: (tag: UiTagDef) => void;
    onTagRemove: (tag: UiTagDef) => void;
};

export function CatalogDetailTabMetadata({ item, canEdit, onTagClick, onTagAdd, onTagRemove }: Props) {
    const intl = useIntl();

    return (
        <div className="gd-analytics-catalog-detail__tab-content">
            {item.dataSet ? (
                <CatalogDetailContentRow
                    title={<FormattedMessage id="analyticsCatalog.column.title.dataSet" />}
                    content={item.dataSet.title}
                />
            ) : null}
            <CatalogDetailContentRow
                title={<FormattedMessage id="analyticsCatalog.column.title.createdBy" />}
                content={item.createdBy ?? undefined}
            />
            <CatalogDetailContentRow
                title={<FormattedMessage id="analyticsCatalog.column.title.createdAt" />}
                content={item.createdAt ? <UiDate date={item.createdAt} locale={intl.locale} /> : undefined}
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
                        item.updatedAt ? <UiDate date={item.updatedAt} locale={intl.locale} /> : undefined
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
                                isDeletable: canEdit,
                            }))}
                            canCreateTag={canEdit}
                            canDeleteTags={canEdit}
                            mode="multi-line"
                            onTagClick={onTagClick}
                            onTagAdd={onTagAdd}
                            onTagRemove={onTagRemove}
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
    );
}
