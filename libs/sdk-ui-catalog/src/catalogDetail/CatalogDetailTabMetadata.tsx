// (C) 2025 GoodData Corporation

import cx from "classnames";
import { FormattedMessage, useIntl } from "react-intl";

import { UiDate, UiIcon, type UiTagDef, UiTags, UiTooltip } from "@gooddata/sdk-ui-kit";

import { CatalogDetailContentRow } from "./CatalogDetailContentRow.js";
import type { ICatalogItem } from "../catalogItem/index.js";
import type { ObjectType } from "../objectType/types.js";

const TYPES_SUPPORTING_IS_HIDDEN: ObjectType[] = ["insight", "measure", "attribute", "fact"];

type Props = {
    item: ICatalogItem;
    canEdit: boolean;
    onTagClick: (tag: UiTagDef) => void;
    onTagAdd: (tag: UiTagDef) => void;
    onTagRemove: (tag: UiTagDef) => void;
    onIsHiddenChange: (isHidden: boolean) => void;
};

export function CatalogDetailTabMetadata({
    item,
    canEdit,
    onTagClick,
    onTagAdd,
    onTagRemove,
    onIsHiddenChange,
}: Props) {
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
            {TYPES_SUPPORTING_IS_HIDDEN.includes(item.type) ? (
                <CatalogDetailContentRow
                    title={
                        <>
                            <FormattedMessage id="analyticsCatalog.column.title.isHidden" />
                            <UiTooltip
                                anchor={<UiIcon type="question" size={12} color="complementary-6" />}
                                content={
                                    <FormattedMessage id="analyticsCatalog.column.isHidden.field.tooltip" />
                                }
                                arrowPlacement="left"
                                optimalPlacement
                                offset={10}
                                width={280}
                                triggerBy={["hover", "click"]}
                            />
                        </>
                    }
                    content={
                        <label className="input-checkbox-toggle">
                            <input
                                type="checkbox"
                                checked={item.isHidden !== true}
                                disabled={!canEdit}
                                onChange={(event) => {
                                    onIsHiddenChange(!event.target.checked);
                                }}
                                className={cx("s-checkbox-toggle", canEdit ? "s-enabled" : "s-disabled")}
                            />
                            <span className="input-label-text" />
                        </label>
                    }
                />
            ) : null}
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
