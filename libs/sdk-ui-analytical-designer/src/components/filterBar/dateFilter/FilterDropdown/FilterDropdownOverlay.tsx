// (C) 2022-2026 GoodData Corporation

import { type MutableRefObject, type ReactNode } from "react";

import classNames from "classnames";

import { Overlay, OverlayAlignOnParentScrollProvider } from "@gooddata/sdk-ui-kit";

import { DROPDOWN_ALIGNMENTS } from "../../../../utils/dropdown.js";

export interface IFilterDropdownOverlayProps {
    alignTo: MutableRefObject<HTMLElement>;
    onClose: () => void;
    children: ReactNode;
}

export function FilterDropdownOverlay({ alignTo, onClose, children }: IFilterDropdownOverlayProps) {
    const dropdownClassNames = classNames([
        "overlay",
        "gd-dialog",
        "gd-dropdown",
        "adi-filter-picker",
        "s-filter-picker",
        "adi-date-filter-picker",
        "adi-date-filter-picker-wide",
    ]);
    return (
        <Overlay
            alignTo={alignTo.current}
            alignPoints={DROPDOWN_ALIGNMENTS}
            closeOnOutsideClick
            closeOnParentScroll
            closeOnMouseDrag
            onClose={onClose}
            ignoreClicksOnByClass={[
                ".adi-additional-date-granularities-dropdown",
                ".adi-additional-date-attribute-dropdown",
                ".adi-empty-values-filter-dropdown",
                ".gd-extended-date-filter-body",
            ]}
        >
            {/* the dialog body scrolls, so the dropdowns opened from it must follow their buttons
                and close once their button is scrolled out of view */}
            <OverlayAlignOnParentScrollProvider closeOnAnchorHidden>
                <div className={dropdownClassNames}>{children}</div>
            </OverlayAlignOnParentScrollProvider>
        </Overlay>
    );
}
