// (C) 2007-2026 GoodData Corporation

import { type ReactElement, memo } from "react";

import cx from "classnames";
import { isEqual } from "lodash-es";
import { FormattedMessage, defineMessage, useIntl } from "react-intl";
import { useDispatch, useSelector } from "react-redux";

import { type ChartInlineVisualizationType } from "@gooddata/sdk-ui-ext";
import { Button, IconHash, InsightIcon } from "@gooddata/sdk-ui-kit";

import { visualizationPropertiesChanged } from "../../actions/properties_actions.js";
import { ATTRIBUTE, FACT } from "../../constants/bucket.js";
import {
    APPROXIMATE_COUNT_AGGREGATION,
    type ITranslatedAggregationFunction,
    getTranslatedApplicableAggregationFunctions,
} from "../../models/aggregation_function.js";
import { getType } from "../../models/bucket_item.js";
import { normalizeDraggedItemType } from "../../models/bucket_rules.js";
import { VisualizationPropertiesSelectors } from "../../selectors/visualization_properties_selector.js";
import { type AppDispatch, type IAppState } from "../../store/types.js";
import { type IDecoratedBucketItem, type IRawBucketItem } from "../../typings/buckets.js";
import { type ICatalogEntry } from "../../typings/state_objects.js";
import { CatalogItem } from "../catalog/item/CatalogItem.js";
import { AggregationSelect } from "../shared/AggregationSelect.js";

import { ConfigurationCheckboxes } from "./measure/ConfigurationCheckboxes.js";
import { MeasureNumberFormatPanel } from "./measure/MeasureNumberFormatPanel/MeasureNumberFormatPanel.js";
import { MeasureFilters } from "./measures/MeasureFilters.js";

export interface IMeasureBucketItemConfigurationOwnProps {
    bucketItem: IDecoratedBucketItem;
    localIdentifier: string;
    onSetAttributeAggregation: (item: IRawBucketItem, aggregation: string) => void;
    allowMetricVisualizations: boolean;
    supportedMetricVisualizationTypes: ChartInlineVisualizationType[];
    disableMeasureFilters: boolean;
}

export type IMeasureBucketItemConfigurationProps = IMeasureBucketItemConfigurationOwnProps;

export const MeasureBucketItemConfigurationBase = memo(function MeasureBucketItemConfiguration({
    bucketItem,
    localIdentifier,
    onSetAttributeAggregation,
    allowMetricVisualizations,
    supportedMetricVisualizationTypes,
    disableMeasureFilters,
}: IMeasureBucketItemConfigurationProps): ReactElement {
    const intl = useIntl();

    // a computed attribute is counted like any attribute: it offers the attribute aggregations and
    // renders the same "Count of" label, so the type is normalized once for everything below
    const itemType = normalizeDraggedItemType(getType(bucketItem));

    const getAggregationFunctions = (): ITranslatedAggregationFunction[] => {
        return getTranslatedApplicableAggregationFunctions(itemType, intl.formatMessage);
    };

    const renderAggregation = (): ReactElement => {
        const attribute = bucketItem.attribute as ICatalogEntry;

        const onSelect = (aggregation: string) =>
            onSetAttributeAggregation(bucketItem.original as IRawBucketItem, aggregation);
        const isApproximateCountSelected = isEqual(bucketItem.aggregation, APPROXIMATE_COUNT_AGGREGATION);
        const metricTitle = isApproximateCountSelected
            ? defineMessage({ id: "aggregations.metric_title.approximate_count.static" }).id
            : defineMessage({ id: "aggregations.title.count" }).id;

        return (
            <div className="adi-aggregation-wrapper">
                {itemType === FACT ? (
                    <div className="adi-bucket-select">
                        <AggregationSelect
                            className="s-fact-aggregation-switch"
                            aggregationFunctions={getAggregationFunctions()}
                            aggregation={bucketItem.aggregation}
                            onSelect={onSelect}
                        />
                        <span>{intl.formatMessage({ id: "of" })}</span>
                    </div>
                ) : (
                    false
                )}
                {itemType === ATTRIBUTE ? (
                    <span>
                        {intl.formatMessage({
                            id: metricTitle,
                        })}
                    </span>
                ) : (
                    false
                )}
                <CatalogItem item={attribute} draggable={false} />
            </div>
        );
    };

    return (
        <div className="adi-bucket-configuration adi-metric-bucket-item-configuration s-metric-bucket-item-configuration">
            {renderAggregation()}
            {allowMetricVisualizations ? (
                <InlineVisualizationSelect
                    supportedTypes={supportedMetricVisualizationTypes}
                    localIdentifier={bucketItem.localIdentifier}
                />
            ) : null}
            {!disableMeasureFilters && (
                <MeasureFilters bucketLocalIdentifier={localIdentifier} bucketItem={bucketItem} />
            )}
            <ConfigurationCheckboxes
                bucketItem={bucketItem}
                onSetAttributeAggregation={onSetAttributeAggregation}
                bucketLocalIdentifier={localIdentifier}
            />
            <MeasureNumberFormatPanel bucketItemLocalIdentifier={bucketItem.localIdentifier} />
        </div>
    );
});
export const MeasureBucketItemConfiguration = MeasureBucketItemConfigurationBase;

const PRIMARY_COLOR = "var(--gd-palette-primary-base, #14b2e2)";

export interface IInlineVisualizationSelectProps {
    localIdentifier: string;
    supportedTypes: ChartInlineVisualizationType[];
}

export function InlineVisualizationSelect({
    localIdentifier,
    supportedTypes,
}: IInlineVisualizationSelectProps): ReactElement {
    const dispatch = useDispatch<AppDispatch>();
    const visualizationProperties = useSelector((state: IAppState) =>
        VisualizationPropertiesSelectors.getProperties(state),
    );

    const inlineVisualizations: Record<string, { type?: ChartInlineVisualizationType }> | undefined =
        visualizationProperties["inlineVisualizations"];
    const selectedType = inlineVisualizations?.[localIdentifier]?.type ?? "metric";
    const onSelect = (type: ChartInlineVisualizationType) =>
        dispatch(
            visualizationPropertiesChanged(
                {
                    ...visualizationProperties,
                    inlineVisualizations: {
                        ...inlineVisualizations,
                        [localIdentifier]: {
                            type,
                        },
                    },
                },
                true,
            ),
        );

    return (
        <div className="adi-metric-visualization-select-wrapper">
            <FormattedMessage id="dashboard.bucket_item.inline_visualization_type.select" />
            <div className="adi-metric-visualization-select s-metric-visualization-select gd-button-group">
                {supportedTypes.map((type: ChartInlineVisualizationType) => {
                    const isSelected = selectedType === type;
                    return (
                        <Button
                            key={type}
                            className={cx(
                                "adi-metric-visualization-select-item",
                                "gd-button-secondary",
                                "gd-button-small",
                                `s-metric-visualization-select-item-${type}`,
                                {
                                    "adi-metric-visualization-select-item-selected": isSelected,
                                    "is-active": isSelected,
                                },
                            )}
                            value={<InlineVisualizationIcon type={type} isSelected={isSelected} />}
                            onClick={() => onSelect(type)}
                        />
                    );
                })}
            </div>
        </div>
    );
}

function InlineVisualizationIcon({
    type,
    isSelected,
}: {
    type: ChartInlineVisualizationType;
    isSelected: boolean;
}): ReactElement {
    const color = isSelected ? PRIMARY_COLOR : "#B0BECA";
    switch (type) {
        case "metric": {
            return <IconHash color={color} width={13} height={13} />;
        }
        case "line": {
            return <InsightIcon visualizationUrl="local:line" iconProps={{ color, width: 13, height: 13 }} />;
        }
        case "column": {
            return (
                <InsightIcon visualizationUrl="local:column" iconProps={{ color, width: 13, height: 13 }} />
            );
        }
        default:
            return null;
    }
}
