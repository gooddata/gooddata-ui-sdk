// (C) 2019-2024 GoodData Corporation
import React from "react";
import noop from "lodash/noop.js";
import { ChartType, DefaultLocale } from "@gooddata/sdk-ui";
import { IInsightDefinition, ISettings, insightHasMeasures } from "@gooddata/sdk-model";

import {
    IReferences,
    IVisualizationProperties,
    IConfigurationPanelRenderers,
    IReferencePoint,
} from "../../interfaces/Visualization.js";
import { IColorConfiguration } from "../../interfaces/Colors.js";
import ColorsSection from "../configurationControls/colors/ColorsSection.js";
import LegendSection from "../configurationControls/legend/LegendSection.js";
import { InternalIntlWrapper } from "../../utils/internalIntlProvider.js";
import { getMeasuresFromMdObject } from "../../utils/bucketHelper.js";
import InteractionsSection from "../configurationControls/interactions/InteractionsSection.js";
import ForecastSection from "../configurationControls/forecast/ForecastSection.js";
import { isForecastEnabled } from "../../utils/forecastHelper.js";
import {
    isInsightSupportedForAlerts,
    isInsightSupportedForScheduledExports,
} from "../pluggableVisualizations/alerts.js";
import AdvancedSection from "../configurationControls/advanced/AdvancedSection.js";

export interface IConfigurationPanelContentProps<PanelConfig = any> {
    properties?: IVisualizationProperties;
    references?: IReferences;
    referencePoint?: IReferencePoint;
    propertiesMeta?: any;
    colors?: IColorConfiguration;
    locale: string;
    type?: ChartType;
    isError?: boolean;
    isLoading?: boolean;
    insight?: IInsightDefinition;
    featureFlags?: ISettings;
    axis?: string;
    pushData?(data: any): void;
    panelConfig?: PanelConfig;
    configurationPanelRenderers?: IConfigurationPanelRenderers;
}

export default abstract class ConfigurationPanelContent<
    T extends IConfigurationPanelContentProps = IConfigurationPanelContentProps,
> extends React.PureComponent<T> {
    public static defaultProps: IConfigurationPanelContentProps = {
        properties: null,
        references: null,
        referencePoint: null,
        propertiesMeta: null,
        colors: null,
        locale: DefaultLocale,
        isError: false,
        isLoading: false,
        insight: null,
        pushData: noop,
        featureFlags: {},
        axis: null,
        panelConfig: {},
    };

    protected supportedPropertiesList: string[];

    public render() {
        return (
            <div key={`config-${this.props.type}`}>
                <InternalIntlWrapper locale={this.props.locale}>
                    {this.renderConfigurationPanel()}
                </InternalIntlWrapper>
            </div>
        );
    }

    protected abstract renderConfigurationPanel(): React.ReactNode;

    protected isControlDisabled(): boolean {
        const { insight, isError, isLoading } = this.props;
        return !insight || !insightHasMeasures(insight) || isError || isLoading;
    }

    protected renderColorSection(): React.ReactNode {
        const { properties, propertiesMeta, pushData, colors, featureFlags, references, insight, isLoading } =
            this.props;

        const controlsDisabled = this.isControlDisabled();
        const hasMeasures = getMeasuresFromMdObject(insight).length > 0;

        return (
            <ColorsSection
                properties={properties}
                propertiesMeta={propertiesMeta}
                references={references}
                colors={colors}
                controlsDisabled={controlsDisabled}
                pushData={pushData}
                hasMeasures={hasMeasures}
                showCustomPicker={featureFlags.enableCustomColorPicker as boolean}
                isLoading={isLoading}
            />
        );
    }

    protected renderLegendSection(): React.ReactNode {
        const { properties, propertiesMeta, pushData } = this.props;
        const controlsDisabled = this.isControlDisabled();

        return (
            <LegendSection
                properties={properties}
                propertiesMeta={propertiesMeta}
                controlsDisabled={controlsDisabled}
                pushData={pushData}
            />
        );
    }

    protected renderInteractionsSection(): React.ReactNode {
        const {
            pushData,
            properties,
            propertiesMeta,
            panelConfig,
            configurationPanelRenderers,
            featureFlags,
            insight,
        } = this.props;

        const isAlertingEnabled = featureFlags.enableAlerting;
        const isScheduledExportsEnabled = featureFlags.enableScheduling;
        const insightSupportsScheduledExports = isInsightSupportedForScheduledExports(insight);
        const insightSupportsAlerts = isInsightSupportedForAlerts(insight);
        const supportsAlertsConfiguration = insightSupportsAlerts && isAlertingEnabled;
        const supportsScheduledExportsConfiguration =
            insightSupportsScheduledExports && isScheduledExportsEnabled;

        return supportsAlertsConfiguration || panelConfig.supportsAttributeHierarchies ? (
            <InteractionsSection
                controlsDisabled={this.isControlDisabled()}
                properties={properties}
                propertiesMeta={propertiesMeta}
                pushData={pushData}
                supportsAlertConfiguration={supportsAlertsConfiguration}
                supportsDrillDownConfiguration={panelConfig.supportsAttributeHierarchies}
                supportsScheduledExportsConfiguration={supportsScheduledExportsConfiguration}
                InteractionsDetailRenderer={configurationPanelRenderers?.InteractionsDetailRenderer}
            />
        ) : null;
    }

    protected renderForecastSection(): React.ReactNode {
        const { pushData, properties, propertiesMeta, type, featureFlags, referencePoint, insight } =
            this.props;

        if (!featureFlags.enableSmartFunctions) {
            return null;
        }

        const { enabled, visible } = isForecastEnabled(referencePoint, insight, type);
        if (!visible) {
            return null;
        }

        return (
            <ForecastSection
                controlsDisabled={this.isControlDisabled()}
                properties={properties}
                propertiesMeta={propertiesMeta}
                enabled={enabled}
                pushData={pushData}
            />
        );
    }

    protected renderAdvancedSection(): React.ReactNode {
        const { pushData, properties, propertiesMeta, featureFlags } = this.props;
        return featureFlags.enableVisualizationFineTuning ? (
            <AdvancedSection
                controlsDisabled={this.isControlDisabled()}
                properties={properties}
                propertiesMeta={propertiesMeta}
                pushData={pushData}
            />
        ) : null;
    }
}
