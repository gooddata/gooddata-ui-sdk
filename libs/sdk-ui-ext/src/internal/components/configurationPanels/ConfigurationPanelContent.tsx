// (C) 2019-2026 GoodData Corporation

import { PureComponent, type ReactNode } from "react";

import {
    type IInsightDefinition,
    type ISettings,
    type IWorkspacePermissions,
    insightHasMeasures,
    insightMeasures,
} from "@gooddata/sdk-model";
import { type ChartType, DefaultLocale } from "@gooddata/sdk-ui";

import { type SectionName } from "./sectionName.js";
import { type IColorConfiguration } from "../../interfaces/Colors.js";
import {
    type IConfigurationPanelRenderers,
    type IReferencePoint,
    type IReferences,
    type IVisualizationProperties,
} from "../../interfaces/Visualization.js";
import {
    getChartFillIgnoredMeasureIdsFromMdObject,
    getMeasuresFromMdObject,
} from "../../utils/bucketHelper.js";
import { isForecastEnabled } from "../../utils/forecastHelper.js";
import { InternalIntlWrapper } from "../../utils/internalIntlProvider.js";
import { AdvancedSection } from "../configurationControls/advanced/AdvancedSection.js";
import { AnomaliesSection } from "../configurationControls/anomalies/AnomaliesSection.js";
import { ColorsSection } from "../configurationControls/colors/ColorsSection.js";
import { ForecastSection } from "../configurationControls/forecast/ForecastSection.js";
import { InteractionsSection } from "../configurationControls/interactions/InteractionsSection.js";
import { LegendSection } from "../configurationControls/legend/LegendSection.js";
import {
    isInsightSupportedForAlerts,
    isInsightSupportedForScheduledExports,
} from "../pluggableVisualizations/alerts.js";
import { isInsightSupportedForImplicitDrillToUrl } from "../pluggableVisualizations/drillDownUtil.js";

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
    permissions?: IWorkspacePermissions;
    axis?: string;
    pushData?(data: any): void;
    panelConfig?: PanelConfig;
    configurationPanelRenderers?: IConfigurationPanelRenderers;
}

export abstract class ConfigurationPanelContent<
    T extends IConfigurationPanelContentProps = IConfigurationPanelContentProps,
> extends PureComponent<T> {
    public static defaultProps: IConfigurationPanelContentProps = {
        properties: undefined,
        references: undefined,
        referencePoint: undefined,
        propertiesMeta: undefined,
        colors: undefined,
        locale: DefaultLocale,
        isError: false,
        isLoading: false,
        insight: undefined,
        pushData: () => {},
        featureFlags: {},
        permissions: undefined,
        axis: undefined,
        panelConfig: {},
    };

    protected supportedPropertiesList: string[] | undefined;

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
        return !!(!insight || !insightHasMeasures(insight) || isError || isLoading);
    }

    protected renderColorSection(): ReactNode {
        const { properties, propertiesMeta, pushData, colors, references, insight, isLoading, panelConfig } =
            this.props;

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
                supportsChartFill={panelConfig?.supportsChartFill}
                chartFillIgnoredMeasures={chartFillIgnoredMeasures}
                isChartFillDisabled={panelConfig?.isChartFillDisabled}
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

        const isAlertingEnabled = featureFlags?.enableAlerting;
        const isScheduledExportsEnabled = featureFlags?.enableScheduling;
        const showImplicitDrillToUrl =
            featureFlags?.enableImplicitDrillToUrl && isInsightSupportedForImplicitDrillToUrl(insight);
        const supportsKeyDriveAnalysis = featureFlags?.enableChangeAnalysis;
        const insightSupportsScheduledExports = isInsightSupportedForScheduledExports(insight);
        const insightSupportsAlerts = isInsightSupportedForAlerts(insight);
        const supportsAlertsConfiguration = insightSupportsAlerts && isAlertingEnabled;
        const supportsScheduledExportsConfiguration =
            insightSupportsScheduledExports && isScheduledExportsEnabled;
        const metrics = insight ? insightMeasures(insight) : [];

        return supportsAlertsConfiguration ||
            panelConfig?.supportsAttributeHierarchies ||
            showImplicitDrillToUrl ? (
            <InteractionsSection
                metrics={metrics}
                areControlsDisabledGetter={this.isControlDisabled}
                properties={properties}
                propertiesMeta={propertiesMeta}
                pushData={pushData}
                supportsAlertConfiguration={!!supportsAlertsConfiguration}
                supportsDrillDownConfiguration={panelConfig?.supportsAttributeHierarchies}
                supportsScheduledExportsConfiguration={!!supportsScheduledExportsConfiguration}
                InteractionsDetailRenderer={configurationPanelRenderers?.InteractionsDetailRenderer}
                showImplicitDrillToUrl={showImplicitDrillToUrl}
                supportsKeyDriveAnalysis={supportsKeyDriveAnalysis}
                // enableDrillToUrlByDefault is actually not a feature flag, but setting
                // for some reason the property is called featureFlags, but contains both feature flags and settings
                enableDrillToUrlByDefault={featureFlags?.enableDrillToUrlByDefault}
            />
        ) : null;
    }

    protected renderForecastSection(): ReactNode {
        const { pushData, properties, propertiesMeta, type, featureFlags, referencePoint, insight } =
            this.props;

        if (!featureFlags?.["enableSmartFunctions"]) {
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

    protected renderAnomaliesSection(): ReactNode {
        const {
            pushData,
            properties,
            permissions,
            propertiesMeta,
            type,
            featureFlags,
            referencePoint,
            insight,
            colors,
        } = this.props;

        if (!featureFlags?.["enableAnomalyDetectionVisualization"]) {
            return null;
        }
        if (!permissions?.canUseAiAssistant) {
            return null;
        }

        //NOTE: For now we keep it the same as forecast, but it should be different
        // in the future
        const { enabled, visible } = isForecastEnabled(referencePoint, insight, type);
        if (!visible || !colors) {
            return null;
        }

        return (
            <AnomaliesSection
                colors={colors}
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
        return featureFlags?.enableVisualizationFineTuning ? (
            <AdvancedSection
                controlsDisabled={this.isControlDisabled()}
                properties={properties}
                propertiesMeta={propertiesMeta}
                pushData={pushData}
            />
        ) : null;
    }
}
