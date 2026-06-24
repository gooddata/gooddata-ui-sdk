// (C) 2025-2026 GoodData Corporation

import cx from "classnames";
import type { ReactNode } from "react";
import { FormattedMessage, useIntl } from "react-intl";

import type { ISeparators, MetricType } from "@gooddata/sdk-model";
import { type IUiTagDef, UiDate, UiIcon, UiTooltip } from "@gooddata/sdk-ui-kit";

import {
    isCatalogItemAttribute,
    isCatalogItemDataSet,
    isCatalogItemFact,
    isCatalogItemHidable,
    isCatalogItemMeasure,
} from "../catalogItem/guards.js";
import { type ICatalogItem } from "../catalogItem/types.js";

import { CatalogDetailContentRow } from "./CatalogDetailContentRow.js";
import { CatalogDetailGranularities } from "./CatalogDetailGranularities.js";
import { CatalogDetailMetricSettings } from "./CatalogDetailMetricSettings.js";
import { CatalogDetailTags } from "./CatalogDetailTags.js";

type Props = {
    item: ICatalogItem;
    canEdit: boolean;
    onTagClick: (tag: IUiTagDef) => void;
    onTagAdd: (tag: IUiTagDef) => void;
    onTagRemove: (tag: IUiTagDef) => void;
    onIsHiddenChange: (isHidden: boolean) => void;
    onIsHiddenFromKdaChange: (isHiddenFromKda: boolean) => void;
    onMetricTypeChange?: (metricType: MetricType | undefined) => void;
    onFormatChange?: (format: string | null) => void;
    separators?: ISeparators;
    currencyFormatOverride?: string | null;
    enableMetricFormatOverrides?: boolean;
    /**
     * Inline access row rendered at the top of the list. Self-contained (reads the
     * share context); undefined / nothing rendered when sharing is unavailable.
     */
    accessRow?: ReactNode;
    /**
     * Show the Dataset row here. True when object-level permissions are off — with
     * the flag on the dataset is relocated to the header info row instead.
     */
    showDatasetRow?: boolean;
};

export function CatalogDetailTabMetadata({
    item,
    canEdit,
    onTagClick,
    onTagAdd,
    onTagRemove,
    onIsHiddenChange,
    onIsHiddenFromKdaChange,
    onMetricTypeChange,
    onFormatChange,
    separators,
    currencyFormatOverride,
    enableMetricFormatOverrides,
    accessRow,
    showDatasetRow,
}: Props) {
    const intl = useIntl();
    const isMeasure = isCatalogItemMeasure(item);
    const isDataSet = isCatalogItemDataSet(item);
    const granularities = isDataSet ? (item.dataSet.attributes ?? []) : [];
    const datasetTitle =
        isCatalogItemAttribute(item) || isCatalogItemFact(item) ? item.dataSet?.title : undefined;

    return (
        <dl className="gd-analytics-catalog-detail__tab-content">
            {accessRow}
            {showDatasetRow && datasetTitle ? (
                <CatalogDetailContentRow
                    title={<FormattedMessage id="analyticsCatalog.column.title.dataSet" />}
                    content={datasetTitle}
                />
            ) : null}
            {isDataSet && granularities.length > 0 ? (
                <CatalogDetailContentRow
                    title={<FormattedMessage id="analyticsCatalog.column.title.granularities" />}
                    content={<CatalogDetailGranularities granularities={granularities} />}
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
            {isCatalogItemHidable(item) ? (
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
                                aria-label={intl.formatMessage({
                                    id: "analyticsCatalog.column.title.isHidden",
                                })}
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
            {isMeasure ? (
                <CatalogDetailContentRow
                    title={
                        <>
                            <FormattedMessage id="analyticsCatalog.column.title.isHiddenFromKda" />
                            <UiTooltip
                                anchor={<UiIcon type="question" size={12} color="complementary-6" />}
                                content={
                                    <FormattedMessage id="analyticsCatalog.column.isHiddenFromKda.field.tooltip" />
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
                                checked={item.isHiddenFromKda !== true}
                                disabled={!canEdit}
                                aria-label={intl.formatMessage({
                                    id: "analyticsCatalog.column.title.isHiddenFromKda",
                                })}
                                onChange={(event) => {
                                    onIsHiddenFromKdaChange(!event.target.checked);
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
        </dl>
    );
}
