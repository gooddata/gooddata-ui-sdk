// (C) 2024 GoodData Corporation
import React from "react";
import { Bubble, BubbleHoverTrigger } from "@gooddata/sdk-ui-kit";

const ALIGN_POINTS = [{ align: "bc tr" }, { align: "tc br" }];

export function Tooltip({ children, tooltip }: { children: React.ReactNode; tooltip: string }) {
    return (
        <BubbleHoverTrigger>
            {children}
            <Bubble alignPoints={ALIGN_POINTS}>{tooltip}</Bubble>
        </BubbleHoverTrigger>
    );
}
