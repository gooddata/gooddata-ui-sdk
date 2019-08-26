// (C) 2019 GoodData Corporation
import * as React from "react";
import noop = require("lodash/noop");
import { ChartType } from "../../../constants/visualizationTypes";
import { VisualizationObject } from "@gooddata/typings";

import { hasMeasures } from "../../utils/mdObjectHelper";
import { IVisualizationProperties, IFeatureFlags, IReferences } from "../../interfaces/Visualization";
import { IColorConfiguration } from "../../interfaces/Colors";
import ColorsSection from "../configurationControls/colors/ColorsSection";
import LegendSection from "../configurationControls/legend/LegendSection";
import { InternalIntlWrapper } from "../../utils/internalIntlProvider";
import { DEFAULT_LOCALE } from "../../../constants/localization";

export interface IConfigurationPanelContentProps {
    properties?: IVisualizationProperties;
    references?: IReferences;
    propertiesMeta?: any;
    colors?: IColorConfiguration;
    locale: string;
    type?: ChartType;
    isError?: boolean;
    isLoading?: boolean;
    mdObject?: VisualizationObject.IVisualizationObjectContent;
    featureFlags?: IFeatureFlags;
    axis?: string;
    pushData?(data: any): void;
}

export default abstract class ConfigurationPanelContent extends React.PureComponent<
    IConfigurationPanelContentProps
> {
    public static defaultProps: IConfigurationPanelContentProps = {
        properties: null,
        references: null,
        propertiesMeta: null,
        colors: null,
        locale: DEFAULT_LOCALE,
        isError: false,
        isLoading: false,
        mdObject: null,
        pushData: noop,
        featureFlags: {},
        axis: null,
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

    protected abstract renderConfigurationPanel(): JSX.Element;

    protected isControlDisabled() {
        const { mdObject, isError, isLoading } = this.props;
        return !hasMeasures(mdObject) || isError || isLoading;
    }

    protected renderColorSection() {
        const {
            properties,
            propertiesMeta,
            pushData,
            colors,
            featureFlags,
            references,
            mdObject,
            isLoading,
        } = this.props;

        const controlsDisabled = this.isControlDisabled();

        return (
            <ColorsSection
                properties={properties}
                propertiesMeta={propertiesMeta}
                references={references}
                colors={colors}
                controlsDisabled={controlsDisabled}
                pushData={pushData}
                hasMeasures={hasMeasures(mdObject)}
                showCustomPicker={featureFlags.enableCustomColorPicker as boolean}
                isLoading={isLoading}
            />
        );
    }

    protected renderLegendSection() {
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
}
