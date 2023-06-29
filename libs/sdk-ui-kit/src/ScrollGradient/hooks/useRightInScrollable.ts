// (C) 2022 GoodData Corporation

import { useState, useEffect } from "react";

import { useNumberState } from "./useNumberState.js";

export function useRightInScrollable(): {
    right: number;
    content: HTMLElement | null;
    setContent: (content: HTMLElement) => void;
} {
    const [right, setRight] = useNumberState();
    const [content, setContent] = useState<HTMLElement | null>(null);

    // eslint-disable-next-line react-hooks/exhaustive-deps
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
