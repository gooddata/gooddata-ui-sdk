// (C) 2026 GoodData Corporation

import { type PropsWithChildren, createContext, useContext, useMemo, useRef } from "react";

import type { ObjectType } from "../objectType/types.js";

type RefetchHandler = (type: ObjectType) => Promise<void>;

type CatalogFeedActions = {
    refetchObjectType: RefetchHandler;
    registerRefetchHandler: (handler: RefetchHandler | null) => void;
};

const CatalogFeedActionsContext = createContext<CatalogFeedActions | null>(null);

export function CatalogFeedProvider({ children }: PropsWithChildren) {
    const handlerRef = useRef<RefetchHandler | null>(null);

    const actions = useMemo<CatalogFeedActions>(
        () => ({
            async refetchObjectType(type: ObjectType) {
                await handlerRef.current?.(type);
            },
            registerRefetchHandler(handler) {
                handlerRef.current = handler;
            },
        }),
        [],
    );

    return (
        <CatalogFeedActionsContext.Provider value={actions}>{children}</CatalogFeedActionsContext.Provider>
    );
}

export function useCatalogFeedActions(): CatalogFeedActions {
    const actions = useContext(CatalogFeedActionsContext);
    if (!actions) {
        throw new Error("useCatalogFeedActions must be used within CatalogFeedProvider");
    }
    return actions;
}
