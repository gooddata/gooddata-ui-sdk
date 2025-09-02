// (C) 2025 GoodData Corporation
import { type MouseEvent, useCallback, useEffect, useState } from "react";

import { type IdentifierRef, areObjRefsEqual } from "@gooddata/sdk-model";

import type { OpenHandlerEvent } from "../../catalogDetail/CatalogDetailContent.js";
import type { ICatalogItem } from "../../catalogItem/types.js";

export function useCatalogItemOpen(
    onCatalogItemOpenClick?: ((e: MouseEvent, item: OpenHandlerEvent) => void) | undefined,
    onCatalogDetailOpened?: (ref: IdentifierRef) => void,
    onCatalogDetailClosed?: () => void,
    openCatalogItemRef?: IdentifierRef,
) {
    const [openedItem, setItemOpened] = useState<Partial<ICatalogItem> | null>(null);
    const [open, setOpen] = useState<boolean>(false);
    useEffect(() => {
        if (
            openCatalogItemRef &&
            !areObjRefsEqual(openCatalogItemRef, openedItem as IdentifierRef) &&
            !open
        ) {
            setOpen(true);
            setItemOpened(openCatalogItemRef);
        }
    }, [open, openCatalogItemRef, openedItem]);

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
    };
}
