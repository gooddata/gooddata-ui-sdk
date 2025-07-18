// (C) 2024-2025 GoodData Corporation

import { MouseEvent } from "react";
import { Item } from "@gooddata/sdk-ui-kit";

interface IVisualizationListMenuItemProps {
    className: string;
    text: string;
    disabled?: boolean;
    onClick?: (e: MouseEvent<Element>) => void;
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
