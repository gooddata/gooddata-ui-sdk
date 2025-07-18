// (C) 2022-2025 GoodData Corporation
import { ComponentType, ReactNode } from "react";

/**
 * @internal
 */
// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface IToolbarProps {
    children?: ReactNode;
}

/**
 * @internal
 */
export type CustomToolbarComponent = ComponentType<IToolbarProps>;
