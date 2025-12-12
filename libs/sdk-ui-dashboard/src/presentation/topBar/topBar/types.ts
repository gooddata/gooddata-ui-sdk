// (C) 2021-2025 GoodData Corporation
import { type ComponentType } from "react";

import { type IButtonBarProps } from "../buttonBar/types.js";
import { type IMenuButtonProps } from "../menuButton/types.js";
import { type ILockedStatusProps, type IShareStatusProps } from "../shareIndicators/index.js";
import { type ITitleProps } from "../title/types.js";

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
