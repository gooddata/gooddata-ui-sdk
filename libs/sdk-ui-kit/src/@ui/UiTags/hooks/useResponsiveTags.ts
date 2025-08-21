// (C) 2025 GoodData Corporation
import { DependencyList, useLayoutEffect, useState } from "react";

import { useTagsElements } from "./useTagsElements.js";
import { UiTagDef } from "../types.js";

const PADDING = 5;
const MIN_WIDTH = 10;

export function useResponsiveTags(
    tags: UiTagDef[],
    mode: "single-line" | "multi-line",
    deps?: DependencyList,
) {
    const {
        rootRef,
        allContainerRef,
        tagsContainerRef,
        tagsContainerWidth,
        hiddenTagsContainerRef,
        addButtonRef,
        tooltipTagsContainerRef,
        tooltipTagsContainer,
        setTooltipContainer,
    } = useTagsElements();

    const [showedTags, setShowedTags] = useState<UiTagDef[]>(tags);
    const [hiddenTags, setHiddenTags] = useState<UiTagDef[]>([]);
    const [availableWidth, setAvailableWidth] = useState<number | "none">("none");
    const [lastAvailableWidth, setLastAvailableWidth] = useState<number | "none">("none");
    const [tooltipWidth, setTooltipWidth] = useState<number | "none">("none");

    useLayoutEffect(() => {
        const container = allContainerRef.current;
        const hiddenContainer = hiddenTagsContainerRef.current;
        const addButton = addButtonRef.current;

        if (!container) {
            return;
        }

        switch (mode) {
            case "single-line": {
                const { showedTags, hiddenTags, availableWidth, lastAvailableWidth } =
                    recalculateSingleLineTags(
                        tags,
                        container,
                        tagsContainerWidth,
                        hiddenContainer,
                        addButton,
                    );

                setShowedTags(showedTags);
                setHiddenTags(hiddenTags);
                setAvailableWidth(availableWidth);
                setLastAvailableWidth(lastAvailableWidth);
                break;
            }
            case "multi-line": {
                const { showedTags, hiddenTags, availableWidth, lastAvailableWidth } =
                    recalculateMultiLineTags(tags, tagsContainerWidth, addButton);

                setShowedTags(showedTags);
                setHiddenTags(hiddenTags);
                setAvailableWidth(availableWidth);
                setLastAvailableWidth(lastAvailableWidth);
                break;
            }
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [tagsContainerWidth, tags, allContainerRef, hiddenTagsContainerRef, addButtonRef, mode, ...deps]);

    useLayoutEffect(() => {
        const width = tooltipTagsContainer?.offsetWidth ?? 0;
        setTooltipWidth(width > MIN_WIDTH ? width : "none");
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [tooltipTagsContainer?.offsetWidth]);

    return {
        rootRef,
        showedTags,
        hiddenTags,
        allContainerRef,
        tagsContainerRef,
        hiddenTagsContainerRef,
        tooltipTagsContainerRef,
        addButtonRef,
        availableWidth,
        lastAvailableWidth,
        tooltipWidth,
        setTooltipContainer,
    };
}

function recalculateSingleLineTags(
    tags: UiTagDef[],
    container: HTMLDivElement,
    tagsContainerWidth: number,
    hiddenContainer?: HTMLButtonElement,
    addButton?: HTMLDivElement,
) {
    let currentWidth = 0;
    let i = 0;

    // add offset width from elements
    currentWidth += hiddenContainer?.offsetWidth ?? 0;
    currentWidth += addButton?.offsetWidth ?? 0;

    const availableWidth = tagsContainerWidth - currentWidth;

    const count = container.children.length;
    for (; i < count; i++) {
        const child = container.children[i] as HTMLDivElement;
        const tempWidth = currentWidth + child.offsetWidth;
        if (tempWidth > tagsContainerWidth) {
            break;
        }
        // add offset width
        currentWidth += child.offsetWidth;
    }

    let showedTags = tags.slice(0, i);
    let hiddenTags = tags.slice(i);

    if (count > 0 && showedTags.length === 0) {
        showedTags = tags.slice(0, 1);
        hiddenTags = tags.slice(1);
    }

    return {
        showedTags,
        hiddenTags,
        availableWidth,
        lastAvailableWidth: availableWidth,
    };
}

function recalculateMultiLineTags(tags: UiTagDef[], tagsContainerWidth: number, addButton?: HTMLDivElement) {
    const availableWidth = tagsContainerWidth;
    const lastAvailableWidth =
        availableWidth - (addButton?.offsetWidth ? addButton.offsetWidth + PADDING : 0);

    return {
        showedTags: tags,
        hiddenTags: [],
        availableWidth,
        lastAvailableWidth,
    };
}
