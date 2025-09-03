// (C) 2022 GoodData Corporation
import { ComponentType } from "react";

/**
 * @internal
 */
export interface IToolbarProps {
    children?: React.ReactNode;
}

/**
 * @internal
 */
export type CustomToolbarComponent = ComponentType<IToolbarProps>;
