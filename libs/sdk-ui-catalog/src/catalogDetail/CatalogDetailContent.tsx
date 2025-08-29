// (C) 2025 GoodData Corporation

import React from "react";

/**
 * @internal
 */
export interface CatalogDetailContentProps {
    /**
     * An object id of the catalog item.
     */
    objectId: string | undefined | null;
}

/**
 * @internal
 */
export function CatalogDetailContent(
    props: CatalogDetailContentProps & {
        focusRef?: React.RefObject<HTMLElement>;
    },
) {
    return (
        <div tabIndex={0} ref={props.focusRef as React.RefObject<HTMLDivElement>}>
            This is the content of the catalog item
        </div>
    );
}
