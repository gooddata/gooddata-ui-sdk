// (C) 2026 GoodData Corporation

import { type ReactNode } from "react";

import classNames from "classnames";

import { DropdownWrapper } from "../../shared/DropdownWrapper.js";
import { useDropdownHeight } from "../../shared/DropdownWrapperHook.js";

// the picker's header, search and footer, taken off the dialog height for its list
const DROPDOWN_HEADER_AND_FOOTER_HEIGHT = 140;
const DROPDOWN_MIN_HEIGHT = 160;
const DROPDOWN_MAX_HEIGHT = 410;
const DROPDOWN_OFFSET_FROM_BUTTON = 5;
const WINDOW_PADDING = 10;

export interface IAddFilterDropdownShellProps {
    buttonNode: HTMLElement;
    onClose: () => void;
    /** the s- test class naming this dropdown */
    testClassName: string;
    contextWindow?: Window;
    /** the current view, given the height a picker's list may take */
    children: (maxListHeight: number) => ReactNode;
}

/**
 * The "Add filter" dropdown: sized to the room around its button and anchored to it. The filter
 * bar's and the metric's dropdowns share it and differ only in the views they put inside.
 */
export function AddFilterDropdownShell({
    buttonNode,
    onClose,
    testClassName,
    contextWindow = window,
    children,
}: IAddFilterDropdownShellProps) {
    const dialogHeight = useDropdownHeight(
        buttonNode,
        DROPDOWN_MIN_HEIGHT,
        DROPDOWN_MAX_HEIGHT,
        DROPDOWN_OFFSET_FROM_BUTTON,
        WINDOW_PADDING,
        contextWindow,
    );
    const maxListHeight = Math.max(DROPDOWN_MIN_HEIGHT, dialogHeight - DROPDOWN_HEADER_AND_FOOTER_HEIGHT);

    return (
        <DropdownWrapper buttonNode={buttonNode} onClose={onClose} dialogHeight={dialogHeight}>
            <div
                className={classNames("adi-add-filter-dropdown gd-dialog gd-dropdown overlay", testClassName)}
            >
                {children(maxListHeight)}
            </div>
        </DropdownWrapper>
    );
}
