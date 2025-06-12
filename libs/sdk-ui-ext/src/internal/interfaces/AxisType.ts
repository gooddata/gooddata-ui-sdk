// (C) 2019-2023 GoodData Corporation
export type AxisType = "xaxis" | "yaxis" | "secondary_xaxis" | "secondary_yaxis";

export type AxisPositionType =
    | "auto"
    | "bottom"
    | "middle"
    | "top"
    | "left"
    | "center"
    | "right"
    | "low"
    | "high";

export interface IAxisNameProperties {
    visible?: boolean;
    position?: AxisPositionType;
}

export interface IAxisProperties {
    name: AxisType;
    title: string;
    subtitle?: string;
    primary: boolean;
    visible: boolean;
}
