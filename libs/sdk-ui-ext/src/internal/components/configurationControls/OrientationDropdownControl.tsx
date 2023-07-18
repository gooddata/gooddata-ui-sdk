// (C) 2023 GoodData Corporation
import React from "react";
import { injectIntl, WrappedComponentProps } from "react-intl";
import { ChartOrientationType } from "@gooddata/sdk-ui-charts";
import { IPushData } from "@gooddata/sdk-ui";

import { getTranslatedDropdownItems } from "../../utils/translations.js";
import { IVisualizationProperties } from "../../interfaces/Visualization.js";
import { messages } from "../../../locales.js";
import { orientationDropdownItems } from "../../constants/dropdowns.js";
import DropdownControl from "./DropdownControl.js";

export interface IOrientationDropdownControl {
    disabled: boolean;
    value: ChartOrientationType;
    showDisabledMessage: boolean;
    properties: IVisualizationProperties;
    pushData: (data: IPushData) => void;
}

export function getAxesByChartOrientation(properties: IVisualizationProperties) {
    const { xaxis, yaxis } = properties?.controls || {};

    if (!xaxis && !yaxis) {
        return { xaxis, yaxis };
    }

    const isInverted = (properties?.controls?.orientation?.position as ChartOrientationType) === "vertical";

    if (isInverted && yaxis) {
        return {
            xaxis: { ...yaxis, name: xaxis?.name },
            yaxis: { ...xaxis, min: undefined, max: undefined, name: yaxis?.name },
        };
    }

    return {
        xaxis: { ...yaxis, min: undefined, max: undefined, name: xaxis?.name },
        yaxis: { ...xaxis, name: yaxis?.name },
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
