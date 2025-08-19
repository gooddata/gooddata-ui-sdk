// (C) 2023-2025 GoodData Corporation
import React from "react";

import { WrappedComponentProps, injectIntl } from "react-intl";

import { IPushData } from "@gooddata/sdk-ui";
import { ChartOrientationType } from "@gooddata/sdk-ui-charts";

import DropdownControl from "./DropdownControl.js";
import { messages } from "../../../locales.js";
import { orientationDropdownItems } from "../../constants/dropdowns.js";
import { IVisualizationProperties } from "../../interfaces/Visualization.js";
import { getTranslatedDropdownItems } from "../../utils/translations.js";

export interface IOrientationDropdownControl {
    disabled: boolean;
    value: ChartOrientationType;
    showDisabledMessage: boolean;
    properties: IVisualizationProperties;
    pushData: (data: IPushData) => void;
}

export function convertXYNamePosition(namePosition: { position: string }) {
    if (!namePosition?.position) {
        return undefined;
    }

    const xAxisPosition = ["left", "center", "right"];
    const yAxisPosition = ["top", "middle", "bottom"];
    let currentPosition = xAxisPosition.indexOf(namePosition.position);

    if (currentPosition >= 0) {
        return { position: yAxisPosition[currentPosition] };
    }

    currentPosition = yAxisPosition.indexOf(namePosition.position);
    return { position: xAxisPosition[currentPosition] };
}

export function getAxesByChartOrientation(properties: IVisualizationProperties) {
    const { xaxis, yaxis } = properties?.controls || {};

    if (!xaxis && !yaxis) {
        return { xaxis, yaxis };
    }

    const resetProperties: { [properties: string]: string | number | undefined } = {
        rotation: undefined,
        min: undefined,
        max: undefined,
        format: undefined,
    };
    const newXAxisName = convertXYNamePosition(yaxis?.name);
    const newYAxisName = convertXYNamePosition(xaxis?.name);

    return {
        xaxis: { ...resetProperties, ...yaxis, name: newXAxisName },
        yaxis: { ...resetProperties, ...xaxis, name: newYAxisName },
    };
}

class OrientationDropdownControl extends React.PureComponent<
    IOrientationDropdownControl & WrappedComponentProps
> {
    constructor(props: IOrientationDropdownControl & WrappedComponentProps) {
        super(props);
        this.handleOrientationChanged = this.handleOrientationChanged.bind(this);
    }

    private handleOrientationChanged(data: IPushData) {
        const { properties } = data;
        const isChanged =
            properties?.controls?.orientation?.position !==
            this.props.properties?.controls?.orientation?.position;

        if (isChanged) {
            const { xaxis, yaxis } = getAxesByChartOrientation(properties);
            const cloneProperties = {
                ...properties,
                controls: {
                    ...properties.controls,
                    ...(xaxis ? { xaxis } : {}),
                    ...(yaxis ? { yaxis } : {}),
                },
            };
            this.props.pushData({ ...data, properties: cloneProperties });
        } else {
            this.props.pushData(data);
        }
    }

    public render() {
        return (
            <DropdownControl
                value={this.props.value}
                valuePath="orientation.position"
                labelText={messages.orientationTitle.id}
                disabled={this.props.disabled}
                properties={this.props.properties}
                pushData={this.handleOrientationChanged}
                items={this.generateDropdownItems()}
                showDisabledMessage={this.props.showDisabledMessage}
            />
        );
    }

    private generateDropdownItems() {
        return getTranslatedDropdownItems(orientationDropdownItems, this.props.intl);
    }
}

export default injectIntl(OrientationDropdownControl);
