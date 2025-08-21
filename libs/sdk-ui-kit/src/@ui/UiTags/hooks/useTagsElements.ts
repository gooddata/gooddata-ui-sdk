// (C) 2025 GoodData Corporation
import { useRef, useState } from "react";

import { useElementSize } from "../../hooks/useElementSize.js";

export function useTagsElements() {
    const {
        ref: allContainerRef,
        width: allContainerWidth,
        height: allContainerHeight,
    } = useElementSize<HTMLDivElement>();
    const {
        ref: tagsContainerRef,
        width: tagsContainerWidth,
        height: tagsContainerHeight,
    } = useElementSize<HTMLDivElement>();

    const rootRef = useRef<HTMLDivElement | null>(null);
    const tooltipTagsContainerRef = useRef<HTMLDivElement>(null);
    const hiddenTagsContainerRef = useRef<HTMLButtonElement>(null);
    const addButtonRef = useRef<HTMLDivElement>(null);
    const [tooltipTagsContainer, setTooltipContainer] = useState<HTMLDivElement>(null);

    return {
        rootRef,
        // container
        allContainerRef,
        allContainerWidth,
        allContainerHeight,
        // tags container
        tagsContainerRef,
        tagsContainerWidth,
        tagsContainerHeight,
        // hidden tags container
        hiddenTagsContainerRef,
        // tooltip tags container
        tooltipTagsContainerRef,
        tooltipTagsContainer,
        setTooltipContainer,
        // add button
        addButtonRef,
    };
}
