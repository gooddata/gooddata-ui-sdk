// (C) 2021 GoodData Corporation
import { ComponentType } from "react";

/**
 * @alpha
 */
export interface ITitleProps {
    title: string;
    onTitleChanged?: (newTitle: string) => void;
}

/**
 * @alpha
 */
export type CustomTitleComponent = ComponentType<ITitleProps>;
