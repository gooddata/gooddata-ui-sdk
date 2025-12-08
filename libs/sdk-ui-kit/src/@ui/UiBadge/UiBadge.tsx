// (C) 2025 GoodData Corporation

import { bem } from "../@utils/bem.js";

const { b } = bem("gd-ui-kit-badge");

/**
 * @internal
 */
export interface UiBadgeProps {
    label: string;
}

/**
 * @internal
 */
export function UiBadge({ label }: UiBadgeProps) {
    return <span className={b()}>{label}</span>;
}
