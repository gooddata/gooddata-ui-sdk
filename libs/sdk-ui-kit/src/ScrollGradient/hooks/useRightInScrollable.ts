// (C) 2022-2025 GoodData Corporation

import { useEffect, useState } from "react";

import { useNumberState } from "./useNumberState.js";

export function useRightInScrollable(): {
    right: number;
    content: HTMLElement | null;
    setContent: (content: HTMLElement) => void;
} {
    const [right, setRight] = useNumberState();
    const [content, setContent] = useState<HTMLElement | null>(null);

    useEffect(() => {
        if (content) {
            const style = window.getComputedStyle(content, ":before");
            const currentRight = content.offsetWidth - parseFloat(style.width);
            if (currentRight !== right) {
                setRight(currentRight);
            }
        }
    });

    return {
        right,
        content,
        setContent,
    };
}
