// (C) 2021 GoodData Corporation
import { ComponentType } from "react";
import { IButtonBarProps } from "../buttonBar/types";

import { IMenuButtonProps } from "../menuButton/types";
import { ILockedStatusProps, IShareStatusProps } from "../shareIndicators";
import { ITitleProps } from "../title/types";

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
