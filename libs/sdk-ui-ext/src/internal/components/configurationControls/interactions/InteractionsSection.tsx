// (C) 2023-2024 GoodData Corporation
import React from "react";
import { FormattedMessage, WrappedComponentProps, injectIntl } from "react-intl";

import ConfigSection from "../ConfigSection.js";
import { messages } from "../../../../locales.js";
import { IVisualizationProperties } from "../../../interfaces/Visualization.js";
import CheckboxControl from "../CheckboxControl.js";
import { Bubble, BubbleHoverTrigger, SeparatorLine } from "@gooddata/sdk-ui-kit";

export interface IInteractionsSectionProps {
    controlsDisabled: boolean;
    properties: IVisualizationProperties;
    propertiesMeta: any;
    pushData: (data: any) => any;
    InteractionsDetailRenderer?: () => React.ReactNode;
    supportsAlertConfiguration?: boolean;
    supportsDrillDownConfiguration?: boolean;
    supportsScheduledExportsConfiguration?: boolean;
}

const TOOLTIP_ALIGN_POINTS = [{ align: "cr cl", offset: { x: 5, y: 0 } }];
export const QuestionMarkTooltip = (props: { tooltipText: string }) => {
    return (
        <BubbleHoverTrigger>
            <span className="gd-interactions-section__question-mark gd-icon-circle-question" />
            <Bubble alignPoints={TOOLTIP_ALIGN_POINTS}>
                <FormattedMessage id={props.tooltipText} />
            </Bubble>
        </BubbleHoverTrigger>
    );
};

const InteractionsSection: React.FC<IInteractionsSectionProps & WrappedComponentProps> = (props) => {
    const {
        controlsDisabled,
        properties,
        propertiesMeta,
        pushData,
        InteractionsDetailRenderer,
        supportsAlertConfiguration,
        supportsDrillDownConfiguration,
        supportsScheduledExportsConfiguration,
    } = props;
    const isDrillDownDisabled = properties?.controls?.disableDrillDown ?? false;
    const isAlertsDisabled = properties?.controls?.disableAlerts ?? false;
    const isScheduledExportsDisabled = properties?.controls?.disableScheduledExports ?? false;
    const isSeparatorVisible =
        supportsDrillDownConfiguration &&
        (supportsAlertConfiguration || supportsScheduledExportsConfiguration);

    return (
        <ConfigSection
            id="interactions_section"
            className="gd-interactions-section"
            title={messages.interactions.id}
            propertiesMeta={propertiesMeta}
            pushData={pushData}
        >
            {supportsAlertConfiguration ? (
                <div className="gd-interactions-section__control-with-tooltip">
                    <CheckboxControl
                        valuePath="disableAlerts"
                        labelText={messages.interactionsAlerts.id}
                        properties={properties}
                        disabled={controlsDisabled}
                        checked={!isAlertsDisabled}
                        pushData={pushData}
                        isValueInverted={true}
                    />
                    <QuestionMarkTooltip tooltipText={messages.interactionsAlertsTooltip.id} />
                </div>
            ) : null}
            {supportsScheduledExportsConfiguration ? (
                <div className="gd-interactions-section__control-with-tooltip">
                    <CheckboxControl
                        valuePath="disableScheduledExports"
                        labelText={messages.interactionsScheduledExports.id}
                        properties={properties}
                        disabled={controlsDisabled}
                        checked={!isScheduledExportsDisabled}
                        pushData={pushData}
                        isValueInverted={true}
                    />
                    <QuestionMarkTooltip tooltipText={messages.interactionsScheduledExportsTooltip.id} />
                </div>
            ) : null}
            {isSeparatorVisible ? <SeparatorLine mT={10} mB={10} /> : null}
            {supportsDrillDownConfiguration ? (
                <CheckboxControl
                    valuePath="disableDrillDown"
                    labelText={messages.interactionsDrillDown.id}
                    properties={properties}
                    disabled={controlsDisabled}
                    checked={!isDrillDownDisabled}
                    pushData={pushData}
                    isValueInverted={true}
                />
            ) : null}
            {InteractionsDetailRenderer ? InteractionsDetailRenderer() : null}
        </ConfigSection>
    );
};

export default injectIntl(React.memo(InteractionsSection));
