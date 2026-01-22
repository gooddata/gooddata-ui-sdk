// (C) 2021-2026 GoodData Corporation

import { type ComponentType } from "react";

import { type IButtonBarProps } from "../buttonBar/types.js";
import { type IMenuButtonProps } from "../menuButton/types.js";
import { type ILockedStatusProps } from "../shareIndicators/lockedStatus/types.js";
import { type IShareStatusProps } from "../shareIndicators/shareStatus/types.js";
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
