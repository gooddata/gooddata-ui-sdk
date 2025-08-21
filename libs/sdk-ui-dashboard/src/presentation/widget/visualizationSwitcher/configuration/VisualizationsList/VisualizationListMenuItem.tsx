// (C) 2024-2025 GoodData Corporation

import React from "react";

import { Item } from "@gooddata/sdk-ui-kit";

interface IVisualizationListMenuItemProps {
    className: string;
    text: string;
    disabled?: boolean;
    onClick?: (e: React.MouseEvent<HTMLElement>) => void;
}

export function VisualizationListMenuItem({
    className,
    disabled,
    text,
    onClick,
}: IVisualizationListMenuItemProps) {
    return (
        <Item onClick={onClick} className={className} disabled={disabled}>
            {text}
        </Item>
    );
}
