// (C) 2022 GoodData Corporation
import { ComponentType } from "react";

/**
 * @internal
 */
// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface IToolbarProps {
    children?: React.ReactNode;
}

/**
 * @internal
 */
export type CustomToolbarComponent = ComponentType<IToolbarProps>;
