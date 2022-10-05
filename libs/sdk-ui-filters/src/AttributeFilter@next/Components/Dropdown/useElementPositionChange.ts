// (C) 2022 GoodData Corporation
import { useLayoutEffect, useState, useRef, useCallback } from "react";
import debounce from "lodash/debounce";
// TODO remove this when IE11 support is dropped
// eslint-disable-next-line import/no-unassigned-import
import "intersection-observer";

/**
 * @internal
 */
interface IUseElementPositionChangeResult {
    ref: (node: HTMLElement | null) => void;
    rect: DOMRect | null;
    viewport: IViewPortResult;
}

/**
 * @internal
 */
interface IViewPortResult {
    vw: number;
    vh: number;
}

const getViewPortDimensions = (): IViewPortResult => {
    return {
        vw: Math.max(document.documentElement.clientWidth || 0, window.innerWidth || 0),
        vh: Math.max(document.documentElement.clientHeight || 0, window.innerHeight || 0),
    };
};

/**
 * @internal
 */
export const useElementPositionChange = (): IUseElementPositionChangeResult => {
    const nodeRef = useRef<HTMLElement>(null);
    const [nodeRect, setNodeRect] = useState<DOMRect>(null);
    const [viewport, setViewport] = useState<IViewPortResult>(getViewPortDimensions());

    const ref = useCallback((node: HTMLElement | null) => {
        if (node) {
            nodeRef.current = node;
        }
    }, []);

    useLayoutEffect(() => {
        const currentNode = nodeRef.current;

        const handleResize = debounce(() => {
            setViewport(getViewPortDimensions());
            setNodeRect(currentNode?.getBoundingClientRect());
        }, 100);

        window.addEventListener("resize", handleResize);

        const observer = new IntersectionObserver(() => {
            setNodeRect(currentNode?.getBoundingClientRect());
        });

        if (currentNode) {
            observer.observe(currentNode);
        }

        return () => {
            observer.unobserve(currentNode);
            window.removeEventListener("resize", handleResize);
        };
    }, [nodeRef]);

    return {
        ref,
        rect: nodeRect,
        viewport,
    };
};
