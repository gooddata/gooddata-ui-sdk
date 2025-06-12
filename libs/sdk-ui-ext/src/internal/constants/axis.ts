// (C) 2019-2020 GoodData Corporation
import { VisualizationTypes, ChartType } from "@gooddata/sdk-ui";

export const AXIS = {
    PRIMARY: "primary",
    SECONDARY: "secondary",
    DUAL: "dual",
};

export enum AXIS_NAME {
    X = "xaxis",
    Y = "yaxis",
    SECONDARY_X = "secondary_xaxis",
    SECONDARY_Y = "secondary_yaxis",
}

export const DUAL_AXES_SUPPORTED_CHARTS: ChartType[] = [
    VisualizationTypes.COLUMN,
    VisualizationTypes.BAR,
    VisualizationTypes.LINE,
    VisualizationTypes.COMBO,
];

const BASE_X_AXIS = {
    name: AXIS_NAME.X,
    title: "properties.xaxis.title",
    subtitle: "",
    primary: false,
};

const BASE_Y_AXIS = {
    name: AXIS_NAME.Y,
    title: "properties.yaxis.title",
    subtitle: "",
    primary: true,
};

const BASE_SECONDARY_Y_AXIS = {
    ...BASE_Y_AXIS,
    name: AXIS_NAME.SECONDARY_Y,
};

const BAR_X_AXIS = {
    ...BASE_X_AXIS,
    primary: true,
};

const BAR_SECONDARY_X_AXIS = {
    ...BASE_X_AXIS,
    name: AXIS_NAME.SECONDARY_X,
    primary: true,
};

const BAR_Y_AXIS = {
    ...BASE_Y_AXIS,
    primary: false,
};

export const BASE_CHART_AXIS_CONFIG = {
    [AXIS.PRIMARY]: [BASE_X_AXIS, BASE_Y_AXIS],
    [AXIS.SECONDARY]: [BASE_X_AXIS, BASE_SECONDARY_Y_AXIS],
    [AXIS.DUAL]: [
        BASE_X_AXIS,
        {
            ...BASE_Y_AXIS,
            subtitle: "properties.axis.left",
        },
        {
            ...BASE_SECONDARY_Y_AXIS,
            subtitle: "properties.axis.right",
        },
    ],
};

export const BAR_CHART_AXIS_CONFIG = {
    [AXIS.PRIMARY]: [BAR_X_AXIS, BAR_Y_AXIS],
    [AXIS.SECONDARY]: [BAR_SECONDARY_X_AXIS, BAR_Y_AXIS],
    [AXIS.DUAL]: [
        {
            ...BAR_SECONDARY_X_AXIS,
            subtitle: "properties.axis.top",
        },
        {
            ...BAR_X_AXIS,
            subtitle: "properties.axis.bottom",
        },
        BAR_Y_AXIS,
    ],
};
