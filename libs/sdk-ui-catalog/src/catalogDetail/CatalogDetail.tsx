// (C) 2025 GoodData Corporation

import { useRef } from "react";

import { useIntl } from "react-intl";

import { UiDrawer } from "@gooddata/sdk-ui-kit";

import { CatalogDetailContent, type CatalogDetailContentProps } from "./CatalogDetailContent.js";

/**
 * @internal
 */
export interface CatalogDetailProps extends CatalogDetailContentProps {
    /**
     * Whether the overlay is open or not.
     */
    open: boolean;
    /**
     * Node to which the overlay should be attached.
     */
    node?: HTMLElement;
    /**
     * Callback to be called when the overlay should be closed.
     */
    onClose: () => void;

    /**
     * Data test id for the overlay.
     */
    dataTestId?: string;
    /**
     * Z-index of the overlay.
     */
    zIndex?: number;
}

/**
 * @internal
 */
export function CatalogDetail({ open, onClose, dataTestId, zIndex, node, ...restProps }: CatalogDetailProps) {
    const intl = useIntl();
    const focusRef = useRef<HTMLButtonElement>(null);

    return (
        <UiDrawer
            open={open}
            node={node}
            initialFocus={focusRef}
            closeLabel={intl.formatMessage({ id: "analyticsCatalog.catalogItem.closeButtonLabel" })}
            accessibilityConfig={{
                ariaLabel: intl.formatMessage({ id: "analyticsCatalog.catalogItem.overlayLabel" }),
            }}
            anchor="right"
            zIndex={zIndex}
            dataTestId={dataTestId}
            showCloseButton
            onClickClose={onClose}
            onEscapeKey={onClose}
            onClickOutside={onClose}
        >
            <CatalogDetailContent {...restProps} focusRef={focusRef} />
        </UiDrawer>
    );
}
