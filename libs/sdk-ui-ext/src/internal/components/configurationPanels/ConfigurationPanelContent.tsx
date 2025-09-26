// (C) 2019-2025 GoodData Corporation

import { PureComponent, ReactNode } from "react";

import { IInsightDefinition, ISettings, insightHasMeasures } from "@gooddata/sdk-model";
import { ChartType, DefaultLocale } from "@gooddata/sdk-ui";

import { SectionName } from "./sectionName.js";
import { IColorConfiguration } from "../../interfaces/Colors.js";
import {
    IConfigurationPanelRenderers,
    IReferencePoint,
    IReferences,
    IVisualizationProperties,
} from "../../interfaces/Visualization.js";
import {
    getChartFillIgnoredMeasureIdsFromMdObject,
    getMeasuresFromMdObject,
} from "../../utils/bucketHelper.js";
import { isForecastEnabled } from "../../utils/forecastHelper.js";
import { InternalIntlWrapper } from "../../utils/internalIntlProvider.js";
import AdvancedSection from "../configurationControls/advanced/AdvancedSection.js";
import ColorsSection from "../configurationControls/colors/ColorsSection.js";
import ForecastSection from "../configurationControls/forecast/ForecastSection.js";
import InteractionsSection from "../configurationControls/interactions/InteractionsSection.js";
import LegendSection from "../configurationControls/legend/LegendSection.js";
import {
    isInsightSupportedForAlerts,
    isInsightSupportedForScheduledExports,
} from "../pluggableVisualizations/alerts.js";

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
> extends PureComponent<T> {
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
        pushData: () => {},
        featureFlags: {},
        axis: null,
        panelConfig: {},
    };

    protected supportedPropertiesList: string[];

    constructor(props: T) {
        super(props);
        this.isControlDisabled = this.isControlDisabled.bind(this);
    }

    public override render() {
        return (
            <div key={`config-${this.props.type}`}>
                <InternalIntlWrapper locale={this.props.locale}>
                    {this.renderConfigurationPanel()}
                </InternalIntlWrapper>
            </div>
        );
    }

    protected abstract renderConfigurationPanel(): ReactNode;

    /**
     * Optionally pass a sectionName to specialize disabling logic for specific sections.
     * Default logic disables if no measures, error, or loading.
     */
    protected isControlDisabled(_sectionName?: SectionName): boolean {
        const { insight, isError, isLoading } = this.props;
        return !insight || !insightHasMeasures(insight) || isError || isLoading;
    }

    protected renderColorSection(): ReactNode {
        const {
            properties,
            propertiesMeta,
            pushData,
            colors,
            featureFlags,
            references,
            insight,
            isLoading,
            panelConfig,
        } = this.props;

        const controlsDisabled = this.isControlDisabled();
        const hasMeasures = getMeasuresFromMdObject(insight).length > 0;
        const chartFillIgnoredMeasures = getChartFillIgnoredMeasureIdsFromMdObject(insight, properties);
        return (
            <ColorsSection
                properties={properties}
                propertiesMeta={propertiesMeta}
                references={references}
                colors={colors}
                controlsDisabled={controlsDisabled}
                pushData={pushData}
                hasMeasures={hasMeasures}
                isLoading={isLoading}
                isChartAccessibilityFeaturesEnabled={!!featureFlags.enableChartAccessibilityFeatures}
                supportsChartFill={panelConfig.supportsChartFill}
                chartFillIgnoredMeasures={chartFillIgnoredMeasures}
                isChartFillDisabled={panelConfig.isChartFillDisabled}
            />
        );
    }

    protected renderLegendSection(): ReactNode {
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

    protected renderInteractionsSection(): ReactNode {
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
                areControlsDisabledGetter={this.isControlDisabled}
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

    protected renderForecastSection(): ReactNode {
        const { pushData, properties, propertiesMeta, type, featureFlags, referencePoint, insight } =
            this.props;

        if (!featureFlags["enableSmartFunctions"]) {
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

    protected renderAdvancedSection(): ReactNode {
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
