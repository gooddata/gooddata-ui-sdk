// (C) 2025 GoodData Corporation

import { ReactNode, RefObject, createContext, useCallback, useContext, useRef } from "react";

type CloseMenuFn = () => void;

interface IHeaderMenuContext {
    /**
     * Ref to store the currently open menu's close function.
     * Set this when a menu opens, it will be called by closeActiveMenu.
     */
    activeMenuCloseRef: RefObject<CloseMenuFn | null>;
    /**
     * Close the currently active menu (if any).
     */
    closeActiveMenu: () => void;
}

const HeaderMenuContext = createContext<IHeaderMenuContext | undefined>(undefined);

/**
 * @internal
 * Provider for managing header menu state across the pivot table.
 * Allows closing the active menu when clicking elsewhere in the table.
 */
export function HeaderMenuProvider({ children }: { children: ReactNode }) {
    const activeMenuCloseRef = useRef<CloseMenuFn | null>(null);

    const closeActiveMenu = useCallback(() => {
        activeMenuCloseRef.current?.();
        activeMenuCloseRef.current = null;
    }, []);

    return (
        <HeaderMenuContext.Provider value={{ activeMenuCloseRef, closeActiveMenu }}>
            {children}
        </HeaderMenuContext.Provider>
    );
}

/**
 * @internal
 */
export function useHeaderMenuContext(): IHeaderMenuContext {
    const context = useContext(HeaderMenuContext);
    if (context === undefined) {
        throw new Error("useHeaderMenuContext must be used within a HeaderMenuProvider");
    }
    return context;
}
