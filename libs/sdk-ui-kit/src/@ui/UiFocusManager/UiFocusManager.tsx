// (C) 2025-2026 GoodData Corporation

import {
    type KeyboardEvent,
    type KeyboardEventHandler,
    type ReactNode,
    useCallback,
    useLayoutEffect,
    useMemo,
    useRef,
} from "react";

import { useAutoupdateRef, useCombineRefs } from "@gooddata/sdk-ui";

import { type IUiFocusHelperConnectors } from "./types.js";
import { type IUiAutofocusOptions, useUiAutofocusConnectors } from "./UiAutofocus.js";
import { useUiFocusTrapConnectors } from "./UiFocusTrap.js";
import {
    type IUiReturnFocusOnUnmountOptions,
    useUiReturnFocusOnUnmountConnectors,
} from "./UiReturnFocusOnUnmount.js";
import { useUiTabOutHandlerConnectors } from "./UiTabOutHandler.js";

/**
 * @internal
 */
export type IUiFocusManagerProps = {
    enableAutofocus?: boolean | IUiAutofocusOptions;
    enableFocusTrap?: boolean;
    enableReturnFocusOnUnmount?: boolean | IUiReturnFocusOnUnmountOptions;
    tabOutHandler?: (event: KeyboardEvent) => void;
    focusCheckFn?: (element: HTMLElement) => boolean;
    children: ReactNode;
};

/**
 * @internal
 */
export function UiFocusManager({ children, ...args }: IUiFocusManagerProps) {
    const connectors = useUiFocusManagerConnectors<HTMLDivElement>(args);

    return (
        <div className="gd-focus-manager" style={{ display: "contents" }} {...connectors}>
            {children}
        </div>
    );
}

/**
 * @internal
 */
export const useUiFocusManagerConnectors = <T extends HTMLElement = HTMLElement>({
    enableFocusTrap,
    enableAutofocus,
    enableReturnFocusOnUnmount,
    tabOutHandler,
    focusCheckFn,
}: Omit<IUiFocusManagerProps, "children">): IUiFocusHelperConnectors<T> => {
    const element = useRef<HTMLElement>(null);

    const autofocusOptions = typeof enableAutofocus === "object" ? enableAutofocus : {};
    const returnFocusOnUnmountOptions =
        typeof enableReturnFocusOnUnmount === "object" ? enableReturnFocusOnUnmount : {};

    const focusTrapConnectors = useUiFocusTrapConnectors(focusCheckFn ?? (() => true));
    const tabOutConnectors = useUiTabOutHandlerConnectors(tabOutHandler);
    const autofocusConnectors = useUiAutofocusConnectors(autofocusOptions);
    const returnFocusConnectors = useUiReturnFocusOnUnmountConnectors(returnFocusOnUnmountOptions);

    const enabledConnectors = useMemo(
        () =>
            [
                !!tabOutHandler && tabOutConnectors,
                !!enableReturnFocusOnUnmount && returnFocusConnectors,
                !!enableAutofocus && autofocusConnectors,
                !!enableFocusTrap && focusTrapConnectors,
            ].filter(Boolean) as IUiFocusHelperConnectors<T>[],
        [
            autofocusConnectors,
            enableAutofocus,
            enableFocusTrap,
            enableReturnFocusOnUnmount,
            focusTrapConnectors,
            returnFocusConnectors,
            tabOutConnectors,
            tabOutHandler,
        ],
    );
    const enabledConnectorsRef = useAutoupdateRef(enabledConnectors);

    const combinedRefs = useCombineRefs(...enabledConnectors.map((connector) => connector.ref));

    // The combined ref callback is stable, so React does not call it again when a helper gets enabled
    // after mount (e.g. a dialog switching from non-modal to modal). Hand the already mounted element
    // to the newly enabled helpers, otherwise e.g. the focus trap would swallow the first Tab.
    useLayoutEffect(() => {
        if (element.current) {
            combinedRefs(element.current as T);
        }
    }, [enabledConnectors, combinedRefs]);

    const combinedRefCallback = useCallback(
        (el: HTMLElement | null) => {
            element.current = el;
            combinedRefs(el as T);
        },
        [combinedRefs],
    );
    const combinedKeyDown = useCallback<KeyboardEventHandler>(
        (event) => {
            combinedRefs(element.current as T);
            enabledConnectorsRef.current.forEach((connector) => {
                connector.onKeyDown?.(event);
            });
        },
        [enabledConnectorsRef, combinedRefs],
    );

    return useMemo(
        () => ({ ref: combinedRefCallback, onKeyDown: combinedKeyDown }),
        [combinedKeyDown, combinedRefCallback],
    );
};
