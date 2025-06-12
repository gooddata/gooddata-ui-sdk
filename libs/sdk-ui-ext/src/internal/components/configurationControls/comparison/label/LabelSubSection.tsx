// (C) 2023 GoodData Corporation
import React from "react";
import { IntlShape, useIntl } from "react-intl";

import { PushDataCallback } from "@gooddata/sdk-ui";

import { comparisonMessages, messages } from "../../../../../locales.js";
import ConfigSubsection from "../../ConfigSubsection.js";
import { IVisualizationProperties } from "../../../../interfaces/Visualization.js";
import { IComparisonControlProperties } from "../../../../interfaces/ControlProperties.js";
import InputControl from "../../InputControl.js";
import {
    COMPARISON_LABEL_CONDITIONAL_ENABLED_VALUE_PATH,
    COMPARISON_LABEL_EQUALS_VALUE_PATH,
    COMPARISON_LABEL_NEGATIVE_VALUE_PATH,
    COMPARISON_LABEL_POSITIVE_VALUE_PATH,
    COMPARISON_LABEL_UNCONDITIONAL_VALUE_PATH,
} from "../ComparisonValuePath.js";
import {
    ComparisonPositionValues,
    CalculateAs,
    IDefaultLabelKeys,
    CalculationType,
} from "@gooddata/sdk-ui-charts";
import CheckboxControl from "../../CheckboxControl.js";

export interface ILabelSubSectionProps {
    sectionDisabled: boolean;
    showDisabledMessage?: boolean;
    defaultLabelKeys: IDefaultLabelKeys;
    calculationType: CalculationType;
    properties: IVisualizationProperties<IComparisonControlProperties>;
    pushData: PushDataCallback;
}

const DISABLED_MESSAGE_ALIGN_POINTS = [{ align: "cr cl", offset: { x: 0, y: 7 } }];

const getLabelValues = (
    properties: IVisualizationProperties<IComparisonControlProperties>,
    defaultLabelKeys: IDefaultLabelKeys,
    conditionalEnabled: boolean,
    intl: IntlShape,
) => {
    const unconditionalValue =
        properties?.controls?.comparison?.labelConfig?.unconditionalValue ||
        intl.formatMessage({ id: defaultLabelKeys.nonConditionalKey });

    if (conditionalEnabled) {
        const positiveValue =
            properties?.controls?.comparison?.labelConfig?.positive ||
            intl.formatMessage({ id: defaultLabelKeys.positiveKey });
        const negativeValue =
            properties?.controls?.comparison?.labelConfig?.negative ||
            intl.formatMessage({ id: defaultLabelKeys.negativeKey });
        const equalsValue =
            properties?.controls?.comparison?.labelConfig?.equals ||
            intl.formatMessage({ id: defaultLabelKeys.equalsKey });
        return {
            unconditionalValue,
            positiveValue,
            negativeValue,
            equalsValue,
        };
    }
    return {
        unconditionalValue,
    };
};

function getDisabledMessageId(
    showDisabledMessage: boolean,
    isPositionOnTop: boolean,
    isCalculateAsRatio: boolean,
): string {
    if (showDisabledMessage) {
        return messages.notApplicable.id;
    }
    if (isPositionOnTop) {
        return comparisonMessages.labelPositionOnTopDisabled.id;
    }
    if (isCalculateAsRatio) {
        return comparisonMessages.labelConditionalDisabledByRatio.id;
    }

    return undefined;
}

const LabelSubSection: React.FC<ILabelSubSectionProps> = ({
    sectionDisabled,
    showDisabledMessage,
    defaultLabelKeys,
    calculationType,
    properties,
    pushData,
}) => {
    const intl = useIntl();
    const isCalculateAsRatio = calculationType === CalculateAs.RATIO;
    const isPositionOnTop = properties?.controls?.comparison?.position === ComparisonPositionValues.TOP;
    const disabled = sectionDisabled || isPositionOnTop;
    const shouldShowDisabledMessage = showDisabledMessage || isPositionOnTop;

    const conditionalDisabled = disabled || isCalculateAsRatio;
    const shouldShowConditionalDisabledMessage = shouldShowDisabledMessage || isCalculateAsRatio;
    const disabledMessageId = getDisabledMessageId(showDisabledMessage, isPositionOnTop, isCalculateAsRatio);

    const conditionalEnabled =
        !!properties?.controls?.comparison?.labelConfig?.isConditional &&
        calculationType !== CalculateAs.RATIO;
    const { unconditionalValue, positiveValue, negativeValue, equalsValue } = getLabelValues(
        properties,
        defaultLabelKeys,
        conditionalEnabled,
        intl,
    );

    return (
        <ConfigSubsection title={comparisonMessages.labelSubSectionTitle.id} canBeToggled={false}>
            <div className="comparison-label-conditional s-comparison-label-conditional">
                <CheckboxControl
                    valuePath={COMPARISON_LABEL_CONDITIONAL_ENABLED_VALUE_PATH}
                    labelText={comparisonMessages.labelConditionalTitle.id}
                    properties={properties}
                    checked={conditionalEnabled}
                    disabled={conditionalDisabled}
                    showDisabledMessage={shouldShowConditionalDisabledMessage}
                    disabledMessageId={disabledMessageId}
                    pushData={pushData}
                />
            </div>
            {conditionalEnabled ? (
                <>
                    <div className="comparison-label-itemline s-comparison-label-itemline">
                        <InputControl
                            type="text"
                            valuePath={COMPARISON_LABEL_POSITIVE_VALUE_PATH}
                            properties={properties}
                            labelText={comparisonMessages.labelPositiveTitle.id}
                            disabled={disabled}
                            showDisabledMessage={shouldShowDisabledMessage}
                            disabledMessageAlignPoints={DISABLED_MESSAGE_ALIGN_POINTS}
                            disabledMessageId={disabledMessageId}
                            placeholder={defaultLabelKeys.positiveKey}
                            pushData={pushData}
                            value={positiveValue}
                        />
                    </div>
                    <div className="comparison-label-itemline s-comparison-label-itemline">
                        <InputControl
                            type="text"
                            valuePath={COMPARISON_LABEL_NEGATIVE_VALUE_PATH}
                            properties={properties}
                            labelText={comparisonMessages.labelNegativeTitle.id}
                            disabled={disabled}
                            showDisabledMessage={shouldShowDisabledMessage}
                            disabledMessageAlignPoints={DISABLED_MESSAGE_ALIGN_POINTS}
                            disabledMessageId={disabledMessageId}
                            placeholder={defaultLabelKeys.negativeKey}
                            pushData={pushData}
                            value={negativeValue}
                        />
                    </div>
                    <div className="comparison-label-itemline s-comparison-label-itemline">
                        <InputControl
                            type="text"
                            valuePath={COMPARISON_LABEL_EQUALS_VALUE_PATH}
                            properties={properties}
                            labelText={comparisonMessages.labelEqualsTitle.id}
                            disabled={disabled}
                            showDisabledMessage={shouldShowDisabledMessage}
                            disabledMessageAlignPoints={DISABLED_MESSAGE_ALIGN_POINTS}
                            disabledMessageId={disabledMessageId}
                            placeholder={defaultLabelKeys.equalsKey}
                            pushData={pushData}
                            value={equalsValue}
                        />
                    </div>
                </>
            ) : (
                <div className="comparison-label-itemline s-comparison-label-itemline">
                    <InputControl
                        type="text"
                        valuePath={COMPARISON_LABEL_UNCONDITIONAL_VALUE_PATH}
                        properties={properties}
                        labelText={comparisonMessages.labelNameTitle.id}
                        disabled={disabled}
                        showDisabledMessage={shouldShowDisabledMessage}
                        disabledMessageAlignPoints={DISABLED_MESSAGE_ALIGN_POINTS}
                        disabledMessageId={disabledMessageId}
                        placeholder={defaultLabelKeys.nonConditionalKey}
                        pushData={pushData}
                        value={unconditionalValue}
                    />
                </div>
            )}
        </ConfigSubsection>
    );
};

export default LabelSubSection;
