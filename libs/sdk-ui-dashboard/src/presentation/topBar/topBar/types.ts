// (C) 2021 GoodData Corporation
import { ComponentType } from "react";
import { IButtonBarProps } from "../buttonBar/types.js";

import { IMenuButtonProps } from "../menuButton/types.js";
import { ILockedStatusProps, IShareStatusProps } from "../shareIndicators/index.js";
import { ITitleProps } from "../title/types.js";

/**
 * @alpha
 */
export interface ITopBarProps {
    menuButtonProps: IMenuButtonProps;
    titleProps: ITitleProps;
    buttonBarProps: IButtonBarProps;
    shareStatusProps: IShareStatusProps;
    lockedStatusProps: ILockedStatusProps;
    DefaultTopBar: CustomTopBarComponent;
}

/**
 * @alpha
 */
export type CustomTopBarComponent = ComponentType<ITopBarProps>;
