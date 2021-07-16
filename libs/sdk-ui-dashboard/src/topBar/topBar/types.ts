// (C) 2021 GoodData Corporation
import { ComponentType } from "react";

import { IMenuButtonProps } from "../menuButton/types";
import { ITitleProps } from "../title/types";

/**
 * @alpha
 */
export interface ITopBarProps {
    menuButtonProps: IMenuButtonProps;
    titleProps: ITitleProps;
}

/**
 * @alpha
 */
export type CustomTopBarComponent = ComponentType;
