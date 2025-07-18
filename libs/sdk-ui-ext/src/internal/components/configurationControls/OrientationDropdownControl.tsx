// (C) 2023-2025 GoodData Corporation
import { useCallback } from "react";
import { useIntl } from "react-intl";
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

export default function OrientationDropdownControl({
    value,
    disabled,
    properties,
    pushData,
    showDisabledMessage,
}: IOrientationDropdownControl) {
    const intl = useIntl();

    const generateDropdownItems = useCallback(() => {
        return getTranslatedDropdownItems(orientationDropdownItems, intl);
    }, [intl]);

    const handleOrientationChanged = useCallback(
        (data: IPushData) => {
            const { properties: newProperties } = data;
            const isChanged =
                newProperties?.controls?.orientation?.position !==
                properties?.controls?.orientation?.position;

            if (isChanged) {
                const { xaxis, yaxis } = getAxesByChartOrientation(newProperties);
                const cloneProperties = {
                    ...newProperties,
                    controls: {
                        ...newProperties.controls,
                        ...(xaxis ? { xaxis } : {}),
                        ...(yaxis ? { yaxis } : {}),
                    },
                };
                pushData({ ...data, properties: cloneProperties });
            } else {
                pushData(data);
            }
        },
        [properties, pushData],
    );

    return (
        <DropdownControl
            value={value}
            valuePath="orientation.position"
            labelText={messages.orientationTitle.id}
            disabled={disabled}
            properties={properties}
            pushData={handleOrientationChanged}
            items={generateDropdownItems()}
            showDisabledMessage={showDisabledMessage}
        />
    );
}
