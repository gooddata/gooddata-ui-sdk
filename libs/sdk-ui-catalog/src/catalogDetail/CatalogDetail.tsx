// (C) 2025-2026 GoodData Corporation

import { useIntl } from "react-intl";

import { UiDrawer } from "@gooddata/sdk-ui-kit";

import { CatalogDetailContent, type ICatalogDetailContentProps } from "./CatalogDetailContent.js";

/**
 * @internal
 */
export interface ICatalogDetailProps extends ICatalogDetailContentProps {
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
export function CatalogDetail({
    open,
    onClose,
    dataTestId,
    zIndex,
    node,
    ...restProps
}: ICatalogDetailProps) {
    const intl = useIntl();
    return (
        <UiDrawer
            open={open}
            node={node}
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
            <CatalogDetailContent {...restProps} />
        </UiDrawer>
    );
}
