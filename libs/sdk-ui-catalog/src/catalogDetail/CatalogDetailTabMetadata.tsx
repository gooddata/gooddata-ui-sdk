// (C) 2025 GoodData Corporation

import cx from "classnames";
import { FormattedMessage, useIntl } from "react-intl";

import type { ISeparators, MetricType } from "@gooddata/sdk-model";
import { UiDate, UiIcon, type UiTagDef, UiTooltip } from "@gooddata/sdk-ui-kit";

import { CatalogDetailContentRow } from "./CatalogDetailContentRow.js";
import { CatalogDetailMetricSettings } from "./CatalogDetailMetricSettings.js";
import { CatalogDetailTags } from "./CatalogDetailTags.js";
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
    onMetricTypeChange?: (metricType: MetricType | undefined) => void;
    onFormatChange?: (format: string | null) => void;
    separators?: ISeparators;
    currencyFormatOverride?: string | null;
    enableMetricFormatOverrides?: boolean;
};

export function CatalogDetailTabMetadata({
    item,
    canEdit,
    onTagClick,
    onTagAdd,
    onTagRemove,
    onIsHiddenChange,
    onMetricTypeChange,
    onFormatChange,
    separators,
    currencyFormatOverride,
    enableMetricFormatOverrides,
}: Props) {
    const intl = useIntl();
    const isMeasure = item.type === "measure";

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
            {isMeasure && enableMetricFormatOverrides ? (
                <CatalogDetailMetricSettings
                    metricType={item.metricType}
                    format={item.format}
                    canEdit={canEdit}
                    separators={separators}
                    currencyFormatOverride={currencyFormatOverride}
                    onMetricTypeChange={onMetricTypeChange}
                    onFormatChange={onFormatChange}
                    enableMetricFormatOverrides={enableMetricFormatOverrides}
                />
            ) : null}
            <CatalogDetailContentRow
                title={<FormattedMessage id="analyticsCatalog.column.title.tags" />}
                content={
                    <CatalogDetailTags
                        tags={item.tags}
                        canEdit={canEdit}
                        onTagClick={onTagClick}
                        onTagAdd={onTagAdd}
                        onTagRemove={onTagRemove}
                    />
                }
            />
        </div>
    );
}
