// (C) 2026 GoodData Corporation

import { memo } from "react";

import { CatalogItemPickerBody } from "./CatalogItemPickerBody.js";
import { CatalogItemPickerHeader } from "./CatalogItemPickerParts.js";
import { type ICatalogItemPickerProps } from "./types.js";
import { useCatalogItemPicker } from "./useCatalogItemPicker.js";

/**
 * @internal
 */
export const CatalogItemPicker = memo<ICatalogItemPickerProps>(function CatalogItemPickerInner(props) {
    const { maxListHeight, onBack, onClose } = props;
    const controller = useCatalogItemPicker(props);
    const { labels } = controller;

    return (
        <CatalogItemPickerBody
            controller={controller}
            maxListHeight={maxListHeight}
            onClose={onClose}
            header={
                <CatalogItemPickerHeader
                    title={labels.title}
                    onBack={onBack}
                    onClose={onClose}
                    backAriaLabel={labels.backAriaLabel}
                    closeAriaLabel={labels.closeAriaLabel}
                />
            }
        />
    );
});
