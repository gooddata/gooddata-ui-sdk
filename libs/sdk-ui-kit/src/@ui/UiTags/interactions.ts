// (C) 2025-2026 GoodData Corporation

import { type MutableRefObject, useCallback, useLayoutEffect, useRef, useState } from "react";

import { programaticFocusManagement } from "../UiFocusManager/utils.js";

import { type IUiTagDef, type IUiTagsProps } from "./types.js";

const TAG_SELECTOR = ".gd-ui-kit-tags__tag";

type InteractionState = {
    moreOpen: boolean;
    addOpen: boolean;
    add: HTMLButtonElement | null;
    close: HTMLButtonElement | null;
    save: HTMLButtonElement | null;
    input: HTMLInputElement | null;
};

type PendingTagFocus = {
    area: "root" | "dialog";
    deletedIndex: number;
};

function getTagElements(container: HTMLElement | null): HTMLElement[] {
    if (!container) {
        return [];
    }

    return Array.from(container.querySelectorAll<HTMLElement>(TAG_SELECTOR));
}

function findTagIndex(container: HTMLElement | null, tagId: string): number {
    return getTagElements(container).findIndex((element) => element.dataset["tagId"] === tagId);
}

export function useTagsInteractions(
    tagsContainerRef: MutableRefObject<HTMLDivElement | null>,
    tooltipTagsContainerRef: MutableRefObject<HTMLDivElement | null>,
    showedTags: IUiTagDef[],
    hiddenTags: IUiTagDef[],
    onTagAdd: IUiTagsProps["onTagAdd"],
    onTagRemove: IUiTagsProps["onTagRemove"],
    onTagClick: IUiTagsProps["onTagClick"],
) {
    const [tag, setTag] = useState<string>("");
    const pendingTagFocus = useRef<PendingTagFocus | null>(null);

    const interactionState = useRef<InteractionState>({
        moreOpen: false,
        addOpen: false,
        add: null,
        close: null,
        save: null,
        input: null,
    });

    const focusTagByIndex = (tagElements: HTMLElement[], index: number): boolean => {
        if (tagElements.length === 0) {
            interactionState.current.add?.focus();
            return false;
        }

        const focusIndex = Math.min(Math.max(index, 0), tagElements.length - 1);
        const tagWrapper = tagElements[focusIndex];
        if (!tagWrapper) {
            return false;
        }

        const innerTag = tagWrapper.querySelector<HTMLElement>(".gd-ui-kit-tag");
        programaticFocusManagement(innerTag ?? tagWrapper);
        return true;
    };

    const onMoreOpen = useCallback(() => {
        interactionState.current.moreOpen = true;
    }, []);

    const onMoreClose = useCallback(() => {
        interactionState.current.moreOpen = false;
    }, []);

    const onAddOpen = useCallback(() => {
        interactionState.current.addOpen = true;
    }, []);

    const onAddClose = useCallback(() => {
        interactionState.current.addOpen = false;
    }, []);

    const onTagAddHandler = useCallback(() => {
        if (!tag) {
            return;
        }
        onTagAdd?.({ id: tag, label: tag });
        setTag("");
    }, [tag, onTagAdd]);

    const onTagRemoveHandler = useCallback(
        (removedTag: IUiTagDef) => {
            let area: "root" | "dialog" = "root";
            let deletedIndex = findTagIndex(tooltipTagsContainerRef.current, removedTag.id);

            if (deletedIndex === -1) {
                deletedIndex = findTagIndex(tagsContainerRef.current, removedTag.id);
            } else {
                area = "dialog";
            }

            if (deletedIndex !== -1) {
                pendingTagFocus.current = { area, deletedIndex };
            }

            onTagRemove?.(removedTag);
        },
        [onTagRemove, tagsContainerRef, tooltipTagsContainerRef],
    );

    const onTagClickHandler = useCallback(
        (clickedTag: IUiTagDef) => {
            onTagClick?.(clickedTag);
        },
        [onTagClick],
    );

    useLayoutEffect(() => {
        if (!pendingTagFocus.current) {
            return;
        }

        const { area, deletedIndex } = pendingTagFocus.current;
        pendingTagFocus.current = null;

        const primaryContainer =
            area === "dialog" ? tooltipTagsContainerRef.current : tagsContainerRef.current;
        const primaryTagElements = getTagElements(primaryContainer);
        if (focusTagByIndex(primaryTagElements, deletedIndex)) {
            return;
        }

        const showedTagElements = getTagElements(tagsContainerRef.current);
        focusTagByIndex(showedTagElements, showedTagElements.length - 1);
    }, [showedTags, hiddenTags, tagsContainerRef, tooltipTagsContainerRef]);

    return {
        tag,
        setTag,
        onAddOpen,
        onAddClose,
        onMoreOpen,
        onMoreClose,
        onTagAddHandler,
        onTagRemoveHandler,
        onTagClickHandler,
        interactionState,
    };
}
