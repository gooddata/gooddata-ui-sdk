// (C) 2025 GoodData Corporation

import React from "react";
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
export const UiBadge: React.FC<UiBadgeProps> = ({ label }) => {
    return <span className={b()}>{label}</span>;
};

export default UiBadge;
