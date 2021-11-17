// (C) 2021 GoodData Corporation
import { ComponentType } from "react";
import { IButtonBarProps } from "../buttonBar/types";

import { IMenuButtonProps } from "../menuButton/types";
import { ITitleProps } from "../title/types";

/**
 * @alpha
 */
export interface ITopBarProps {
    menuButtonProps: IMenuButtonProps;
    titleProps: ITitleProps;
    buttonBarProps: IButtonBarProps;
    DefaultTopBar: CustomTopBarComponent;
}

/**
 * @alpha
 */
export type CustomTopBarComponent = ComponentType<ITopBarProps>;
