// (C) 2024 GoodData Corporation

import { useEffect, useState } from "react";

export const useOverflow = (container: HTMLDivElement, content: HTMLPreElement) => {
    const [isOverflowing, setIsOverflowing] = useState(true);

    useEffect(() => {
        // Check if the text is overflowing
        const checkOverflow = () => {
            if (container && content) {
                // Check if the content height exceeds the container's height
                setIsOverflowing(content.scrollHeight > container.clientHeight);
            }
        };

        checkOverflow(); // Check overflow on mount

        // Set up MutationObserver to detect content changes
        const observer = new MutationObserver(checkOverflow);
        if (content) {
            observer.observe(content, { childList: true, subtree: true, characterData: true });
        }

        // Clean up observer on component unmount
        return () => observer.disconnect();
    }, [container, content]);

    return isOverflowing;
};
