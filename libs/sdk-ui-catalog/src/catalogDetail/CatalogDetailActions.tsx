// (C) 2026 GoodData Corporation

import { type MouseEvent } from "react";

import { useIntl } from "react-intl";

import { useWorkspaceStrict } from "@gooddata/sdk-ui";
import { UiButton } from "@gooddata/sdk-ui-kit";

import { AsCodeDetailActions } from "../asCode/AsCodeDetailActions.js";
import { getAsCodeDescriptor, useIsAsCodeTypeEditable } from "../asCodeRegistry.js";
import type { ICatalogItem, ICatalogItemRef } from "../catalogItem/types.js";

import { useCatalogItemShareActions } from "./share/CatalogItemShareProvider.js";
import { ShareButton } from "./share/ShareButton.js";
import type { OpenHandlerEvent } from "./types.js";

/**
 * @internal
 */
export interface ICatalogDetailActionsProps {
    item: ICatalogItem;
    canEdit: boolean;
    onOpen?: (event: MouseEvent, openEvent: OpenHandlerEvent) => void;
    onCatalogItemCreate?: (item: ICatalogItem) => void;
    onCatalogItemUpdate?: (item: ICatalogItem) => void;
    onCatalogItemDelete?: (ref: ICatalogItemRef) => void;
}

/**
 * Detail-panel actions for a catalog item. An as-code-editable type — whose in-catalog editor is
 * enabled and which the user may edit — gets the full inline edit/duplicate/delete via
 * {@link AsCodeDetailActions}; every other type gets the Open (+ Share) fallback.
 * @internal
 */
export function CatalogDetailActions({
    item,
    canEdit,
    onOpen,
    onCatalogItemCreate,
    onCatalogItemUpdate,
    onCatalogItemDelete,
}: ICatalogDetailActionsProps) {
    const intl = useIntl();
    const workspaceId = useWorkspaceStrict();
    // The Share button reads the share context directly (actions only), so it never
    // re-renders as access is edited and is shown only when sharing is available.
    const share = useCatalogItemShareActions();
    const descriptor = getAsCodeDescriptor(item.type);
    const isTypeEditable = useIsAsCodeTypeEditable(descriptor);

    if (descriptor && canEdit && isTypeEditable) {
        return (
            // Keyed by type so the descriptor a mount uses never changes under it (its hooks must stay
            // stable); switching to a different as-code type remounts with the correct descriptor.
            <AsCodeDetailActions
                key={descriptor.objectType}
                descriptor={descriptor}
                item={item}
                onOpen={onOpen}
                canShare={share.active}
                onShare={share.open}
                onCatalogItemCreate={onCatalogItemCreate}
                onCatalogItemUpdate={onCatalogItemUpdate}
                onCatalogItemDelete={onCatalogItemDelete}
            />
        );
    }

    // Not inline-editable here. The Open button opens the item in its native editor/view, offered only
    // for a type that has one: any non-as-code type, or an as-code type that declares an open action
    // (a metric, not a parameter).
    const canOpen = !descriptor || descriptor.openAction !== undefined;
    if (!canOpen) {
        return null;
    }

    return (
        <div className="gd-analytics-catalog-detail__header-actions">
            {share.active ? <ShareButton onClick={share.open} /> : null}
            <UiButton
                label={intl.formatMessage({ id: "analyticsCatalog.catalogItem.open" })}
                variant="primary"
                accessibilityConfig={{ role: "link" }}
                onClick={(event) => {
                    onOpen?.(event, {
                        item,
                        workspaceId,
                        newTab: event.metaKey || event.ctrlKey,
                        preventDefault: event.preventDefault.bind(event),
                    });
                }}
            />
        </div>
    );
}
