// (C) 2021 GoodData Corporation
import React, { ComponentType } from "react";
import { Placement } from "../model/types/topBarTypes";

/**
 * Defines contract for button bar that can be placed
 * @internal
 */
export interface IDashboardButtonBarProps {
    onButtonHover: (buttonId: string) => void;
    onButtonClicked: (buttonId: string) => void;
}

/**
 * @internal
 */
// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface IDefaultButtonBarProps {}

/**
 * @internal
 */
export const DashboardButtonBar: React.FC<IDashboardButtonBarProps & IDefaultButtonBarProps> = (
    _props: IDashboardButtonBarProps & IDefaultButtonBarProps,
) => {
    return null;
};

/**
 * @internal
 */
export type DashboardButtonBarComponent = ComponentType<IDashboardButtonBarProps & IDefaultButtonBarProps>;

export const defaultDashboardButtonBarProps = {
    Component: DashboardButtonBar,
    placement: "right" as Placement,
};
