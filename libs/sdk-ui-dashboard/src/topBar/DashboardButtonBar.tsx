// (C) 2021 GoodData Corporation
import React, { ComponentType } from "react";

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
export type DashboardButtonBarComponent = ComponentType<IDashboardButtonBarProps>;
