// (C) 2025-2026 GoodData Corporation

import { type MouseEvent, useCallback, useEffect, useRef, useState } from "react";

import { areObjRefsEqual } from "@gooddata/sdk-model";

import type { OpenHandlerEvent } from "../../catalogDetail/types.js";
import { isCatalogItemLoaded } from "../../catalogItem/guards.js";
import type { ICatalogItem, ICatalogItemRef } from "../../catalogItem/types.js";

export function useCatalogItemOpen(
    onCatalogItemOpenClick?: (e: MouseEvent, item: OpenHandlerEvent) => void,
    onCatalogDetailOpened?: (ref: ICatalogItemRef) => void,
    onCatalogDetailClosed?: () => void,
    openCatalogItemRef?: ICatalogItemRef,
) {
    const [openedItem, setItemOpened] = useState<ICatalogItemRef | ICatalogItem | null>(null);
    const [open, setOpen] = useState<boolean>(false);
    const lastOpenCatalogItemRef = useRef<ICatalogItemRef | undefined>(undefined);

    useEffect(() => {
        if (openCatalogItemRef) {
            const externalRefChanged = !areObjRefsEqual(openCatalogItemRef, lastOpenCatalogItemRef.current);
            const shouldSyncExternalRef = !(
                isCatalogItemLoaded(openedItem) && areObjRefsEqual(openCatalogItemRef, openedItem)
            );
            if (externalRefChanged && shouldSyncExternalRef) {
                setOpen(true);
                setItemOpened(openCatalogItemRef);
            }
        }
        lastOpenCatalogItemRef.current = openCatalogItemRef;
    }, [openCatalogItemRef, openedItem]);

    const onOpenDetail = useCallback(
        (item: ICatalogItem) => {
            setOpen(true);
            setItemOpened(item);
            onCatalogDetailOpened?.({ identifier: item.identifier, type: item.type });
        },
        [onCatalogDetailOpened],
    );

    const onCloseDetail = useCallback(() => {
        setOpen(false);
        onCatalogDetailClosed?.();
    }, [onCatalogDetailClosed]);

    const onOpenClick = useCallback(
        (e: MouseEvent, item: OpenHandlerEvent) => {
            setOpen(false);
            onCatalogItemOpenClick?.(e, item);
        },
        [onCatalogItemOpenClick],
    );

    return {
        onOpenDetail,
        onCloseDetail,
        onOpenClick,
        open,
        openedItem,
        setItemOpened,
    };
}
