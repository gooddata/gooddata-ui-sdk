// (C) 2026 GoodData Corporation

import { type ObjRefInScope, localIdRef } from "@gooddata/sdk-model";
import { type IRankingMeasureDropdownBodyRenderProps } from "@gooddata/sdk-ui-filters";
import { Overlay } from "@gooddata/sdk-ui-kit";

import { ConnectedCatalogItemPicker } from "../filterBarDropdown/ConnectedCatalogItemPicker.js";
import { type IAddFilterItem } from "../filterBarDropdown/filterBarDropdownUtils.js";

// Keep the same alignment as the legacy measure dropdown body so the list opens under the button.
const ALIGN_POINTS = [{ align: "bl tl" }, { align: "tl bl" }];
const MAX_LIST_HEIGHT = 300;
// Match the measure dropdown button width (ranking dropdown width 250px minus its 20px padding), so
// the list aligns with the button instead of overhanging it.
const DROPDOWN_STYLE = { width: 230 };

/**
 * Custom body for the ranking filter measure dropdown. Replaces the legacy flat measure list with the
 * grouped, searchable catalog item picker (the same list used in the add filter flow), so a ranking
 * filter can rank by a bucket measure or any catalog metric. A picked bucket measure is referenced by
 * its local identifier; a catalog metric by its ObjRef.
 */
export function RankingMeasureDropdownBody({ onSelect, onClose }: IRankingMeasureDropdownBodyRenderProps) {
    const handleAdd = (items: IAddFilterItem[]) => {
        // The picker is single-select, so at most one metric is picked.
        const [item] = items;
        if (!item) {
            return;
        }
        const ref: ObjRefInScope = item.bucketItemLocalIdentifier
            ? localIdRef(item.bucketItemLocalIdentifier)
            : item.ref;
        onSelect(ref);
    };

    return (
        <Overlay
            closeOnOutsideClick
            alignTo=".gd-rf-measure-dropdown-button"
            alignPoints={ALIGN_POINTS}
            onClose={onClose}
        >
            <div
                className="gd-dropdown overlay gd-rf-inner-overlay-dropdown s-rf-measure-dropdown-body"
                style={DROPDOWN_STYLE}
            >
                <ConnectedCatalogItemPicker
                    itemTypes={["metric"]}
                    selectionMode="single"
                    withHeader={false}
                    ignoreMeasureValueFilters
                    isOpen
                    maxListHeight={MAX_LIST_HEIGHT}
                    onBack={onClose}
                    onClose={onClose}
                    onAdd={handleAdd}
                />
            </div>
        </Overlay>
    );
}
