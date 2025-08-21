// (C) 2025 GoodData Corporation
import React from "react";

import { useAutoupdateRef, useCombineRefs } from "@gooddata/sdk-ui";

import { IUiFocusHelperConnectors } from "./types.js";
import { IUiAutofocusOptions, useUiAutofocusConnectors } from "./UiAutofocus.js";
import { useUiFocusTrapConnectors } from "./UiFocusTrap.js";
import {
    IUiReturnFocusOnUnmountOptions,
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
    tabOutHandler?: (event: React.KeyboardEvent) => void;
    focusCheckFn?: (element: HTMLElement) => boolean; // TODO INE make it optional
    children: React.ReactNode;
};

/**
 * @internal
 */
export function UiFocusManager({ children, ...args }: IUiFocusManagerProps) {
    const connectors = useUiFocusManagerConnectors<HTMLDivElement>(args);

    return (
        <div style={{ display: "contents" }} {...connectors}>
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
    const autofocusOptions = typeof enableAutofocus === "object" ? enableAutofocus : {};
    const returnFocusOnUnmountOptions =
        typeof enableReturnFocusOnUnmount === "object" ? enableReturnFocusOnUnmount : {};

    const focusTrapConnectors = useUiFocusTrapConnectors(focusCheckFn);
    const tabOutConnectors = useUiTabOutHandlerConnectors(tabOutHandler);
    const autofocusConnectors = useUiAutofocusConnectors(autofocusOptions);
    const returnFocusConnectors = useUiReturnFocusOnUnmountConnectors(returnFocusOnUnmountOptions);

    const enabledConnectors = React.useMemo(
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

    const combinedKeyDown = React.useCallback<React.KeyboardEventHandler>(
        (event) => {
            enabledConnectorsRef.current.forEach((connector) => {
                connector.onKeyDown?.(event);
            });
        },
        [enabledConnectorsRef],
    );

    return React.useMemo(
        () => ({ ref: combinedRefs, onKeyDown: combinedKeyDown }),
        [combinedKeyDown, combinedRefs],
    );
};
