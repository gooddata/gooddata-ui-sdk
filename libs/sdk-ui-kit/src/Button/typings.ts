// (C) 2020-2022 GoodData Corporation

import { ReactNode } from "react";

/**
 * @internal
 */
export interface IButtonProps {
    id?: string;
    className?: string;
    disabled?: boolean;
    tabIndex?: number;
    tagName?: string;
    title?: string;
    type?: string;
    value?: ReactNode;
    iconLeft?: string;
    iconRight?: string;
    onClick?(e: React.MouseEvent): void;
}
