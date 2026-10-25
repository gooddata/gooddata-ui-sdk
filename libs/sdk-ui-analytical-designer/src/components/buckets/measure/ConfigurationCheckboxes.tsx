// (C) 2007-2026 GoodData Corporation

import { Fragment, type ReactNode } from "react";

import { defineMessages, useIntl } from "react-intl";
import { connect } from "react-redux";

import { Bubble, BubbleHoverTrigger, withBubble } from "@gooddata/sdk-ui-kit";

import {
    setBucketItemIsThresholdMeasure,
    setBucketItemIsTotalMeasure,
    setBucketItemShowInPercent,
    setBucketItemShowOnSecondaryAxis,
} from "../../../actions/buckets_actions.js";
import { ATTRIBUTE } from "../../../constants/bucket.js";
import { APPROXIMATE_COUNT_AGGREGATION, COUNT_AGGREGATION } from "../../../models/aggregation_function.js";
import { getLocalIdentifier } from "../../../models/bucket_item.js";
import {
    checkboxesSelector as configurationCheckboxesSelector,
    isATotalMeasureCheckboxSelector,
    isThresholdMeasureSelector,
} from "../../../selectors/configuration_checkboxes_selector.js";
import { isApproxCountEnabled } from "../../../selectors/feature_flag_selector.js";
import { type IAppState } from "../../../store/types.js";
import { type IDecoratedBucketItem, type IRawBucketItem } from "../../../typings/buckets.js";

import { ConfigurationCheckbox } from "./ConfigurationCheckbox.js";
import { IsATotalCheckboxBase } from "./IsATotalCheckbox.js";

const messages = defineMessages({
    thresholdMeasureAlreadyDefinedTooltip: { id: "dashboard.bucket_item.is_threshold.tooltip.disabled" },
    notEnoughMeasuresTooltip: { id: "dashboard.bucket_item.is_threshold.tooltip.disabled.oneMeasure" },
});

export interface IConfigurationCheckboxesOwnProps {
    bucketItem: IDecoratedBucketItem;
    bucketLocalIdentifier: string;
    onSetAttributeAggregation: (item: IRawBucketItem, aggregation: string) => void;
}

export interface IConfigurationCheckboxesStateProps {
    isShowInPercentDisabled: boolean;
    isShowInPercentVisible: boolean;
    isShowInPercentChecked: boolean;
    isShowOnSecondaryAxisVisible: boolean;
    isShowOnSecondaryAxisChecked: boolean;
    secondaryAxisCheckboxLabel: string;
    isApproxCountEnabled?: boolean;
    isTotalMeasureVisible: boolean;
    isTotalMeasureEnabled: boolean;
    isTotalMeasureChecked: boolean;
    isThresholdMeasureVisible: boolean;
    isThresholdMeasureDisabled: boolean;
    isThresholdMeasureChecked: boolean;
    measuresCount: number;
}

export interface IConfigurationCheckboxesDispatchProps {
    setBucketItemShowInPercent: (localIdentifier: string, value: boolean) => void;
    setBucketItemShowOnSecondaryAxis: (localIdentifier: string, value: boolean) => void;
    setBucketItemIsThresholdMeasure: (localIdentifier: string, value: boolean) => void;
    setBucketItemIsTotalMeasure: (localIdentifier: string, value: boolean) => void;
}

export type IConfigurationCheckboxesProps = IConfigurationCheckboxesOwnProps &
    IConfigurationCheckboxesStateProps &
    IConfigurationCheckboxesDispatchProps;

const CHECKBOX_TOOLTIP_ALIGN_POINTS = [{ align: "cr cl" }];
const CHECKBOX_TOOLTIP_ARROW_OFFSET = { "cr cl": [12, 0] }; // offset is needed to prevent bubble glitching

function CheckboxExplanation({ tooltipContent }: { tooltipContent: ReactNode }) {
    return (
        <BubbleHoverTrigger className="adi-bucket-item__checkbox-with-label__tooltip-trigger" eventsOnBubble>
            <span className="inlineBubbleHelp" />
            <Bubble alignPoints={CHECKBOX_TOOLTIP_ALIGN_POINTS} arrowOffsets={CHECKBOX_TOOLTIP_ARROW_OFFSET}>
                {tooltipContent}
            </Bubble>
        </BubbleHoverTrigger>
    );
}

const ConfigurationCheckboxWithTooltip = withBubble(ConfigurationCheckbox);

const mapStateToProps = (state: IAppState, props: IConfigurationCheckboxesOwnProps) => ({
    ...configurationCheckboxesSelector(state, props),
    ...isATotalMeasureCheckboxSelector(state, props),
    ...isThresholdMeasureSelector(state, props),
    isApproxCountEnabled: isApproxCountEnabled(state),
});

export function ConfigurationCheckboxesBase({
    isShowInPercentVisible,
    isShowInPercentDisabled,
    isShowInPercentChecked,
    isShowOnSecondaryAxisVisible,
    isShowOnSecondaryAxisChecked,
    isThresholdMeasureVisible,
    isThresholdMeasureDisabled,
    isThresholdMeasureChecked,
    secondaryAxisCheckboxLabel,
    isApproxCountEnabled,
    bucketItem,
    isTotalMeasureVisible,
    isTotalMeasureEnabled,
    isTotalMeasureChecked,
    measuresCount,
    setBucketItemShowInPercent,
    setBucketItemShowOnSecondaryAxis,
    setBucketItemIsThresholdMeasure,
    setBucketItemIsTotalMeasure,
    onSetAttributeAggregation,
}: IConfigurationCheckboxesProps) {
    const intl = useIntl();

    const getItem = () => {
        return bucketItem.original as IRawBucketItem;
    };

    const isApproxCountChecked = () => {
        return bucketItem.aggregation === APPROXIMATE_COUNT_AGGREGATION;
    };

    const onShowInPercent = (value: boolean) => {
        const localIdentifier = getLocalIdentifier(getItem());
        setBucketItemShowInPercent(localIdentifier, value);
    };

    const onShowOnSecondaryAxis = (value: boolean) => {
        const localIdentifier = getLocalIdentifier(bucketItem);
        setBucketItemShowOnSecondaryAxis(localIdentifier, value);
    };

    const onToggleThreshold = (value: boolean) => {
        const localIdentifier = getLocalIdentifier(bucketItem);
        setBucketItemIsThresholdMeasure(localIdentifier, value);
    };

    const onApproxCountChanged = (checked: boolean) => {
        const aggregation = checked ? APPROXIMATE_COUNT_AGGREGATION : COUNT_AGGREGATION;
        return onSetAttributeAggregation(getItem(), aggregation);
    };

    const attribute = bucketItem.attribute;
    const isApproxCountCheckboxVisible = isApproxCountEnabled && attribute?.type === ATTRIBUTE;
    const isApproxAndPercentageSectionVisible = isShowInPercentVisible || isApproxCountCheckboxVisible;

    return (
        <Fragment>
            {isApproxAndPercentageSectionVisible ? (
                <section className="adi-approx-count-show-in-percent">
                    {isApproxCountCheckboxVisible ? (
                        <div className="adi-approximate-count adi-bucket-item__checkbox-with-label">
                            <ConfigurationCheckbox
                                checked={isApproxCountChecked()}
                                onChange={(checked) => onApproxCountChanged(checked)}
                                label={intl.formatMessage({
                                    id: "dashboard.bucket_item.approximate_count",
                                })}
                                name="approximate-count"
                            />
                            <CheckboxExplanation
                                tooltipContent={intl.formatMessage({
                                    id: "dashboard.bucket_item.approximate_count.tooltip",
                                })}
                            />
                        </div>
                    ) : null}
                    {isShowInPercentVisible ? (
                        <div className="adi-show-in-percent">
                            <ConfigurationCheckbox
                                checked={isShowInPercentChecked}
                                disabled={isShowInPercentDisabled}
                                onChange={onShowInPercent}
                                label={intl.formatMessage({
                                    id: "dashboard.bucket_item.show_contribution",
                                })}
                                name="show-in-percent"
                            />
                        </div>
                    ) : null}
                </section>
            ) : null}

            {isShowOnSecondaryAxisVisible ? (
                <section className="adi-show-on-secondary-axis">
                    <ConfigurationCheckbox
                        checked={isShowOnSecondaryAxisChecked}
                        onChange={onShowOnSecondaryAxis}
                        label={intl.formatMessage({
                            id: secondaryAxisCheckboxLabel,
                        })}
                        name="show-on-secondary-axis"
                    />
                </section>
            ) : null}

            {isThresholdMeasureVisible ? (
                <section className="adi-enable-threshold">
                    <div className="adi-bucket-item__checkbox-with-label">
                        <ConfigurationCheckboxWithTooltip
                            checked={isThresholdMeasureChecked}
                            disabled={isThresholdMeasureDisabled}
                            onChange={onToggleThreshold}
                            label={intl.formatMessage({
                                id: "dashboard.bucket_item.is_threshold",
                            })}
                            name="threshold-measure"
                            showBubble={isThresholdMeasureDisabled}
                            bubbleTextId={
                                measuresCount > 1
                                    ? messages.thresholdMeasureAlreadyDefinedTooltip.id
                                    : messages.notEnoughMeasuresTooltip.id
                            }
                        />
                        <CheckboxExplanation
                            tooltipContent={intl.formatMessage(
                                {
                                    id: "dashboard.bucket_item.is_threshold.tooltip.enabled",
                                },
                                {
                                    a: (chunk: ReactNode) => (
                                        <a
                                            href="https://www.gooddata.com/docs/cloud/create-visualizations/visualization-types/line-charts/#line-style-by-metric"
                                            rel="noopener noreferrer"
                                            target="_blank"
                                        >
                                            {chunk}
                                        </a>
                                    ),
                                },
                            )}
                        />
                    </div>
                </section>
            ) : null}

            <IsATotalCheckboxBase
                localIdentifier={bucketItem.localIdentifier}
                bucketItem={bucketItem}
                onIsATotalMeasureChange={setBucketItemIsTotalMeasure}
                isTotalMeasureVisible={isTotalMeasureVisible}
                isTotalMeasureEnabled={isTotalMeasureEnabled}
                isTotalMeasureChecked={isTotalMeasureChecked}
            />
        </Fragment>
    );
}

const mapDispatchToProps: IConfigurationCheckboxesDispatchProps = {
    setBucketItemShowInPercent,
    setBucketItemShowOnSecondaryAxis,
    setBucketItemIsThresholdMeasure,
    setBucketItemIsTotalMeasure,
};

export const ConfigurationCheckboxes = connect<
    IConfigurationCheckboxesStateProps,
    IConfigurationCheckboxesDispatchProps,
    IConfigurationCheckboxesOwnProps,
    IAppState
>(
    mapStateToProps,
    mapDispatchToProps,
)(ConfigurationCheckboxesBase);
