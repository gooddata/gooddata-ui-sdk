// (C) 2007-2025 GoodData Corporation
import { useCallback, useEffect, useRef, useState } from "react";

import { useIdPrefixed } from "@gooddata/sdk-ui-kit";

import { type IVisibilityContext } from "./context.js";

/**
 * Options for configuring the visibility detection behavior
 * @internal
 */
export interface IUseVisibilityDetectionOptions {
    /**
     * Threshold for intersection observer (0-1)
     * @defaultValue 0.1
     */
    threshold?: number;
    /**
     * Root margin for intersection observer
     * @defaultValue "0px"
     */
    rootMargin?: string;
}

/**
 * Hook for setting up visibility detection using IntersectionObserver
 * Tracks which items are visible within a container
 * @internal
 */
export const useVisibilityDetection = (options: IUseVisibilityDetectionOptions = {}) => {
    const { threshold = 0.1, rootMargin = "0px" } = options;
    const [visibleItems, setVisibleItems] = useState<Set<number>>(new Set());
    const [viewportElement, setViewportElement] = useState<HTMLDivElement | null>(null);
    const observerRef = useRef<IntersectionObserver | null>(null);
    const registrationQueueRef = useRef<Array<{ index: number; element: HTMLElement | null }>>([]);

    // Generate a unique prefix for this observer instance to avoid conflicts
    const instanceId = useIdPrefixed("legend-visibility-detection");

    // Ref callback for viewport element
    const viewportRefCallback = useCallback((element: HTMLDivElement | null) => {
        setViewportElement(element);
    }, []);

    const handleItem = useCallback(
        (index: number, element: HTMLElement | null, observer: IntersectionObserver | null) => {
            if (!observer) {
                registrationQueueRef.current.push({ index, element });
                return;
            }
            const dataAttribute = `data-${instanceId}-index`;
            if (element) {
                element.setAttribute(dataAttribute, index.toString());
                observer.observe(element);
            } else {
                const existingElement = document.querySelector(`[${dataAttribute}="${index}"]`);
                if (existingElement) {
                    observer.unobserve(existingElement);
                }
            }
        },
        [instanceId],
    );

    // Create observer when viewport element is available
    useEffect(() => {
        // Clean up previous observer if it exists and options or element change
        if (observerRef.current) {
            observerRef.current.disconnect();
            observerRef.current = null;
        }
        if (!viewportElement) {
            return;
        }

        observerRef.current = new IntersectionObserver(
            (entries) => {
                setVisibleItems((prev) => {
                    const newVisible = new Set(prev);
                    entries.forEach((entry) => {
                        const dataAttribute = `data-${instanceId}-index`;
                        const index = parseInt(entry.target.getAttribute(dataAttribute) || "0");
                        if (entry.isIntersecting) {
                            newVisible.add(index);
                        } else {
                            newVisible.delete(index);
                        }
                    });
                    return newVisible;
                });
            },
            {
                root: viewportElement,
                rootMargin,
                threshold,
            },
        );

        // Process any queued registrations now that observer is ready
        if (registrationQueueRef.current.length > 0) {
            registrationQueueRef.current.forEach(({ index, element }) => {
                handleItem(index, element, observerRef.current);
            });
            registrationQueueRef.current = [];
        }
    }, [viewportElement, threshold, rootMargin, handleItem, instanceId]); // Re-create observer if options or element change

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            observerRef.current?.disconnect();
        };
    }, []);

    const registerItem = useCallback(
        (index: number, element: HTMLElement | null) => {
            handleItem(index, element, observerRef.current);
        },
        [handleItem],
    );

    const contextValue: IVisibilityContext = {
        registerItem,
        isVisible: (index: number) => visibleItems.has(index),
        visibleItems,
    };

    return {
        viewportRefCallback,
        contextValue,
    };
};
