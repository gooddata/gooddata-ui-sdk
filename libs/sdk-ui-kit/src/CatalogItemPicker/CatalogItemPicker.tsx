// (C) 2026 GoodData Corporation

import { type ReactElement, memo } from "react";

import { CatalogItemPickerBody } from "./CatalogItemPickerBody.js";
import { CatalogItemPickerHeader } from "./CatalogItemPickerParts.js";
import { type ICatalogItemPickerProps } from "./types.js";
import { useCatalogItemPicker } from "./useCatalogItemPicker.js";

function CatalogItemPickerInner<TAttributePayload = unknown, TMetricPayload = unknown>(
    props: ICatalogItemPickerProps<TAttributePayload, TMetricPayload>,
) {
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
}

/**
 * @internal
 */
export const CatalogItemPicker: <TAttributePayload = unknown, TMetricPayload = unknown>(
    props: ICatalogItemPickerProps<TAttributePayload, TMetricPayload>,
) => ReactElement = memo(CatalogItemPickerInner) as typeof CatalogItemPickerInner;
