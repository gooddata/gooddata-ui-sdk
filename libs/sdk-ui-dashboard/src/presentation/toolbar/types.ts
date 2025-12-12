// (C) 2022-2025 GoodData Corporation

import { type ComponentType, type ReactNode } from "react";

/**
 * @internal
 */
export interface IToolbarProps {
    children?: ReactNode;
}

/**
 * @internal
 */
export type CustomToolbarComponent = ComponentType<IToolbarProps>;
