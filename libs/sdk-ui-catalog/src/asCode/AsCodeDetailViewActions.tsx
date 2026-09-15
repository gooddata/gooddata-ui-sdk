// (C) 2026 GoodData Corporation

import { useCallback, useState } from "react";

import { useIntl } from "react-intl";

import { UiButton } from "@gooddata/sdk-ui-kit";

import { ShareButton } from "../catalogDetail/share/ShareButton.js";
import type { ICatalogItem } from "../catalogItem/types.js";

import { AsCodeEditDialog } from "./AsCodeEditDialog.js";
import type { IAsCodeDescriptor } from "./descriptor.js";

/** @internal */
export interface IAsCodeDetailViewActionsProps {
    descriptor: IAsCodeDescriptor;
    item: ICatalogItem;
    /** Sharing is offered when present. */
    onShare?: () => void;
}

/**
 * Header actions for an as-code item this caller may not change — it is locked, its access is
 * inherited, or they hold view rights only. Where an editor gets Edit, a reader gets Open,
 * which shows the same definition in view mode. Nothing else from the editing bar is offered:
 * no delete and no actions menu.
 *
 * @internal
 */
export function AsCodeDetailViewActions({ descriptor, item, onShare }: IAsCodeDetailViewActionsProps) {
    const intl = useIntl();
    const [openedItem, setOpenedItem] = useState<ICatalogItem | undefined>(undefined);
    const closeDialog = useCallback(() => setOpenedItem(undefined), []);

    return (
        <>
            <div className="gd-analytics-catalog-detail__header-actions">
                {onShare ? <ShareButton onClick={onShare} /> : null}
                <UiButton
                    label={intl.formatMessage({ id: "analyticsCatalog.catalogItem.open" })}
                    variant="primary"
                    onClick={() => setOpenedItem(item)}
                />
            </div>
            {openedItem ? (
                <AsCodeEditDialog
                    descriptor={descriptor}
                    item={openedItem}
                    mode="view"
                    onClose={closeDialog}
                />
            ) : null}
        </>
    );
}
