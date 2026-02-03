// (C) 2023-2026 GoodData Corporation

import { type ReactNode, memo } from "react";

import { FormattedMessage } from "react-intl";

import { type IMeasure } from "@gooddata/sdk-model";
import { Bubble, BubbleHoverTrigger, SeparatorLine, UiIcon } from "@gooddata/sdk-ui-kit";

import { messages } from "../../../../locales.js";
import { type IVisualizationProperties } from "../../../interfaces/Visualization.js";
import { type SectionName } from "../../configurationPanels/sectionName.js";
import { CheckboxControl } from "../CheckboxControl.js";
import { ConfigSection } from "../ConfigSection.js";

export interface IInteractionsSectionProps {
    metrics?: IMeasure[];
    controlsDisabled?: boolean;
    areControlsDisabledGetter?: (sectionName?: SectionName) => boolean;
    properties?: IVisualizationProperties;
    propertiesMeta?: any;
    pushData?: (data: any) => any;
    InteractionsDetailRenderer?: () => ReactNode;
    supportsAlertConfiguration?: boolean;
    supportsDrillDownConfiguration?: boolean;
    supportsScheduledExportsConfiguration?: boolean;
    supportsKeyDriveAnalysis?: boolean;
    showImplicitDrillToUrl?: boolean;
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
    metrics,
    areControlsDisabledGetter,
    properties,
    propertiesMeta,
    pushData,
    InteractionsDetailRenderer,
    supportsAlertConfiguration,
    supportsDrillDownConfiguration,
    supportsScheduledExportsConfiguration,
    supportsKeyDriveAnalysis,
    showImplicitDrillToUrl,
}: IInteractionsSectionProps) {
    const isDrillDownDisabled = properties?.controls?.["disableDrillDown"] ?? false;
    const isDrillIntoURLDisabled = properties?.controls?.["disableDrillIntoURL"] ?? true;
    const isAlertsDisabled = properties?.controls?.["disableAlerts"] ?? false;
    const isScheduledExportsDisabled = properties?.controls?.["disableScheduledExports"] ?? false;
    const isKdaDisabled = properties?.controls?.["disableKeyDriveAnalysis"] ?? false;
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
                        disabled={areControlsDisabledGetter?.("interactions.alerts")}
                        checked={!isAlertsDisabled}
                        pushData={pushData}
                        isValueInverted
                    />
                    <QuestionMarkTooltip tooltipText={messages["interactionsAlertsTooltip"].id!} />
                </div>
            ) : null}
            {supportsScheduledExportsConfiguration ? (
                <div className="gd-interactions-section__control-with-tooltip">
                    <CheckboxControl
                        valuePath="disableScheduledExports"
                        labelText={messages["interactionsScheduledExports"].id}
                        properties={properties}
                        disabled={areControlsDisabledGetter?.("interactions.scheduled_exports")}
                        checked={!isScheduledExportsDisabled}
                        pushData={pushData}
                        isValueInverted
                    />
                    <QuestionMarkTooltip tooltipText={messages["interactionsScheduledExportsTooltip"].id!} />
                </div>
            ) : null}
            {supportsKeyDriveAnalysis && metrics && metrics.length > 0 ? (
                <>
                    <div className="gd-interactions-section__control-with-tooltip">
                        <CheckboxControl
                            valuePath="disableKeyDriveAnalysis"
                            labelText={messages["interactionsKda"].id}
                            properties={properties}
                            disabled={areControlsDisabledGetter?.("interactions.kda")}
                            checked={!isKdaDisabled}
                            pushData={pushData}
                            isValueInverted
                        />
                        <QuestionMarkTooltip tooltipText={messages["interactionsKdaTooltip"].id!} />
                    </div>
                    <div className="gd-interactions-section__kda_metrics_list">
                        {metrics.map((m) => {
                            const isKdaMetricDisabled = getKdaMetricDisabled(properties, m);
                            return (
                                <div
                                    key={m.measure.localIdentifier}
                                    className="gd-interactions-section__kda_metrics_list__item"
                                >
                                    <CheckboxControl
                                        valuePath={`disableKeyDriveAnalysisOn.${m.measure.localIdentifier}`}
                                        labelContent={
                                            <div className="gd-interactions-section__kda_metrics_list__item__label">
                                                <UiIcon type="metric" color="currentColor" />{" "}
                                                {m.measure.title}
                                            </div>
                                        }
                                        properties={properties}
                                        disabled={
                                            areControlsDisabledGetter?.("interactions.kda") || isKdaDisabled
                                        }
                                        checked={!isKdaDisabled && !isKdaMetricDisabled}
                                        pushData={pushData}
                                        isValueInverted
                                    />
                                </div>
                            );
                        })}
                    </div>
                </>
            ) : null}
            {isSeparatorVisible ? <SeparatorLine mT={10} mB={10} /> : null}
            {supportsDrillDownConfiguration ? (
                <CheckboxControl
                    valuePath="disableDrillDown"
                    labelText={messages["interactionsDrillDown"].id}
                    properties={properties}
                    disabled={areControlsDisabledGetter?.("interactions.drill_down")}
                    checked={!isDrillDownDisabled}
                    pushData={pushData}
                    isValueInverted
                />
            ) : null}
            {InteractionsDetailRenderer ? InteractionsDetailRenderer() : null}
            {showImplicitDrillToUrl ? (
                <CheckboxControl
                    valuePath="disableDrillIntoURL"
                    labelText={messages["interactionsDrillIntoURL"].id}
                    properties={properties}
                    disabled={areControlsDisabledGetter?.("interactions.drill_into_url")}
                    checked={!isDrillIntoURLDisabled}
                    pushData={pushData}
                    isValueInverted
                    defaultValue
                />
            ) : null}
        </ConfigSection>
    );
});

function getKdaMetricDisabled(properties: IVisualizationProperties | undefined, m: IMeasure): boolean {
    return properties?.controls?.["disableKeyDriveAnalysisOn"]?.[m.measure.localIdentifier] ?? false;
}
