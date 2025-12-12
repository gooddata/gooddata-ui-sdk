// (C) 2023-2025 GoodData Corporation

import { type ReactNode, memo } from "react";

import { FormattedMessage } from "react-intl";

import { Bubble, BubbleHoverTrigger, SeparatorLine } from "@gooddata/sdk-ui-kit";

import { messages } from "../../../../locales.js";
import { type IVisualizationProperties } from "../../../interfaces/Visualization.js";
import { type SectionName } from "../../configurationPanels/sectionName.js";
import { CheckboxControl } from "../CheckboxControl.js";
import { ConfigSection } from "../ConfigSection.js";

export interface IInteractionsSectionProps {
    controlsDisabled?: boolean;
    areControlsDisabledGetter?: (sectionName?: SectionName) => boolean;
    properties: IVisualizationProperties;
    propertiesMeta: any;
    pushData: (data: any) => any;
    InteractionsDetailRenderer?: () => ReactNode;
    supportsAlertConfiguration?: boolean;
    supportsDrillDownConfiguration?: boolean;
    supportsScheduledExportsConfiguration?: boolean;
    enableImplicitDrillToUrl?: boolean;
}

const TOOLTIP_ALIGN_POINTS = [{ align: "cr cl", offset: { x: 5, y: 0 } }];
export function QuestionMarkTooltip(props: { tooltipText: string }) {
    return (
        <BubbleHoverTrigger>
            <span className="gd-interactions-section__question-mark gd-icon-circle-question" />
            <Bubble alignPoints={TOOLTIP_ALIGN_POINTS}>
                <FormattedMessage id={props.tooltipText} />
            </Bubble>
        </BubbleHoverTrigger>
    );
}

export const InteractionsSection = memo(function InteractionsSection({
    areControlsDisabledGetter,
    properties,
    propertiesMeta,
    pushData,
    InteractionsDetailRenderer,
    supportsAlertConfiguration,
    supportsDrillDownConfiguration,
    supportsScheduledExportsConfiguration,
    enableImplicitDrillToUrl,
}: IInteractionsSectionProps) {
    const isDrillDownDisabled = properties?.controls?.["disableDrillDown"] ?? false;
    const isDrillIntoURLDisabled = properties?.controls?.["disableDrillIntoURL"] ?? true;
    const isAlertsDisabled = properties?.controls?.["disableAlerts"] ?? false;
    const isScheduledExportsDisabled = properties?.controls?.["disableScheduledExports"] ?? false;
    const isSeparatorVisible =
        supportsDrillDownConfiguration &&
        (supportsAlertConfiguration || supportsScheduledExportsConfiguration);

    return (
        <ConfigSection
            id="interactions_section"
            className="gd-interactions-section"
            title={messages["interactions"].id}
            propertiesMeta={propertiesMeta}
            pushData={pushData}
        >
            {supportsAlertConfiguration ? (
                <div className="gd-interactions-section__control-with-tooltip">
                    <CheckboxControl
                        valuePath="disableAlerts"
                        labelText={messages["interactionsAlerts"].id}
                        properties={properties}
                        disabled={areControlsDisabledGetter("interactions.alerts")}
                        checked={!isAlertsDisabled}
                        pushData={pushData}
                        isValueInverted
                    />
                    <QuestionMarkTooltip tooltipText={messages["interactionsAlertsTooltip"].id} />
                </div>
            ) : null}
            {supportsScheduledExportsConfiguration ? (
                <div className="gd-interactions-section__control-with-tooltip">
                    <CheckboxControl
                        valuePath="disableScheduledExports"
                        labelText={messages["interactionsScheduledExports"].id}
                        properties={properties}
                        disabled={areControlsDisabledGetter("interactions.scheduled_exports")}
                        checked={!isScheduledExportsDisabled}
                        pushData={pushData}
                        isValueInverted
                    />
                    <QuestionMarkTooltip tooltipText={messages["interactionsScheduledExportsTooltip"].id} />
                </div>
            ) : null}
            {isSeparatorVisible ? <SeparatorLine mT={10} mB={10} /> : null}
            {supportsDrillDownConfiguration ? (
                <CheckboxControl
                    valuePath="disableDrillDown"
                    labelText={messages["interactionsDrillDown"].id}
                    properties={properties}
                    disabled={areControlsDisabledGetter("interactions.drill_down")}
                    checked={!isDrillDownDisabled}
                    pushData={pushData}
                    isValueInverted
                />
            ) : null}
            {InteractionsDetailRenderer ? InteractionsDetailRenderer() : null}
            {enableImplicitDrillToUrl ? (
                <CheckboxControl
                    valuePath="disableDrillIntoURL"
                    labelText={messages["interactionsDrillIntoURL"].id}
                    properties={properties}
                    disabled={areControlsDisabledGetter("interactions.drill_into_url")}
                    checked={!isDrillIntoURLDisabled}
                    pushData={pushData}
                    isValueInverted
                />
            ) : null}
        </ConfigSection>
    );
});
