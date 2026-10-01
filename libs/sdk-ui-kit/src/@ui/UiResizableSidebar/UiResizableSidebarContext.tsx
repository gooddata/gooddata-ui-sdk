// (C) 2026 GoodData Corporation

import { type ReactNode, createContext, useContext, useState } from "react";

import { type IUiResizableSidebarState } from "./types.js";

const UiResizableSidebarContext = createContext<IUiResizableSidebarState | undefined>(undefined);
UiResizableSidebarContext.displayName = "UiResizableSidebarContext";

function isUsable(button: HTMLButtonElement | null): button is HTMLButtonElement {
    return (
        !!button &&
        button.isConnected &&
        !button.disabled &&
        !button.closest("[inert]") &&
        (button.checkVisibility?.() ?? true)
    );
}

/**
 * Collapse toggles under one provider register here, so the control whose activation made it unusable can
 * hand keyboard focus to another one, even one that mounts later.
 *
 * @internal
 */
export interface IUiResizableSidebarFocusRegistry {
    /**
     * Registers a mounted toggle and returns the function that unregisters it. A toggle that mounts while
     * a hand-off is waiting takes focus right away.
     */
    register: (button: HTMLButtonElement) => () => void;
    /**
     * Called by the control whose activation changed the collapse state. The control keeps focus while it
     * stays usable; otherwise another usable toggle takes it, or the next toggle to mount does.
     */
    handOff: (activated: HTMLButtonElement | null) => void;
}

function createFocusRegistry(): IUiResizableSidebarFocusRegistry {
    const toggles = new Set<HTMLButtonElement>();
    let pending = false;

    return {
        register: (button) => {
            toggles.add(button);

            if (pending) {
                pending = false;
                button.focus();
            }

            return () => {
                toggles.delete(button);
            };
        },
        handOff: (activated) => {
            if (isUsable(activated)) {
                return;
            }

            const receiver = [...toggles].find((toggle) => toggle !== activated && isUsable(toggle));

            if (receiver) {
                receiver.focus();
            } else {
                pending = true;
            }
        },
    };
}

const FocusRegistryContext = createContext<IUiResizableSidebarFocusRegistry | undefined>(undefined);
FocusRegistryContext.displayName = "UiResizableSidebarFocusRegistryContext";

/**
 * @internal
 */
export interface IUiResizableSidebarProviderProps {
    value: IUiResizableSidebarState;
    children: ReactNode;
}

/**
 * Shares one sidebar state between the sidebar and controls rendered outside it.
 *
 * @internal
 */
export function UiResizableSidebarProvider({ value, children }: IUiResizableSidebarProviderProps) {
    const [focusRegistry] = useState(createFocusRegistry);

    return (
        <UiResizableSidebarContext.Provider value={value}>
            <FocusRegistryContext.Provider value={focusRegistry}>{children}</FocusRegistryContext.Provider>
        </UiResizableSidebarContext.Provider>
    );
}

export function useUiResizableSidebarFocusRegistry(): IUiResizableSidebarFocusRegistry | undefined {
    return useContext(FocusRegistryContext);
}

/**
 * Returns the sidebar state shared by the nearest {@link UiResizableSidebarProvider}, or undefined outside one.
 */
export function useOptionalUiResizableSidebar(): IUiResizableSidebarState | undefined {
    return useContext(UiResizableSidebarContext);
}

/**
 * Returns the sidebar state shared by the nearest {@link UiResizableSidebarProvider}.
 *
 * @param fallback - State to use when rendered outside a provider, e.g. a fixed sidebar that cannot be
 * resized. Without a fallback, rendering outside a provider throws.
 *
 * @internal
 */
export function useUiResizableSidebar(fallback?: IUiResizableSidebarState): IUiResizableSidebarState {
    const state = useContext(UiResizableSidebarContext) ?? fallback;

    if (!state) {
        throw new Error(
            "`useUiResizableSidebar` must be used within `UiResizableSidebarProvider` or be given a fallback",
        );
    }

    return state;
}
