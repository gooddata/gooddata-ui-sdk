// (C) 2026 GoodData Corporation

import { memo } from "react";

import { CatalogItemPickerBody } from "./CatalogItemPickerBody.js";
import { type ICatalogItemPickerProps } from "./types.js";
import { useCatalogItemPicker } from "./useCatalogItemPicker.js";

/**
 * The catalog item picker content without its header — just the search + grouped list (+ footer in
 * multi-select mode). Reuses the exact same list as {@link CatalogItemPicker}; intended for embedding
 * under an external anchor button (e.g. the ranking filter measure dropdown).
 *
 * @internal
 */
export const CatalogItemPickerContent = memo<ICatalogItemPickerProps>(
    function CatalogItemPickerContentInner(props) {
        const controller = useCatalogItemPicker(props);
        return (
            <CatalogItemPickerBody
                controller={controller}
                maxListHeight={props.maxListHeight}
                onClose={props.onClose}
            />
        );
    },
);
