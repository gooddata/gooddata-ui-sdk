// (C) 2025-2026 GoodData Corporation

import { bem } from "../@utils/bem.js";

const { b } = bem("gd-ui-kit-badge");

/**
 * @internal
 */
export interface IUiBadgeProps {
    label: string;
}

/**
 * @internal
 */
export function UiBadge({ label }: IUiBadgeProps) {
    return <span className={b()}>{label}</span>;
}
