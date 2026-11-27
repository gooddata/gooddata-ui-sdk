// (C) 2026 GoodData Corporation

import { type ReactNode, createContext, useContext, useId, useLayoutEffect } from "react";

import { useIntl } from "react-intl";

import { messages } from "../../../locales.js";

const DrillableCellHintIdContext = createContext<string | undefined>(undefined);

/**
 * Renders the drill hint once per table and provides its id to the cells.
 *
 * The hint is not part of any cell's content (so cell text, copy and paste, and exports
 * stay unchanged); drillable cells reference it with aria-describedby instead, so screen
 * readers announce it together with the cell value when keyboard focus lands on the cell.
 *
 * @internal
 */
export function DrillableCellHintProvider({ children }: { children: ReactNode }) {
    const intl = useIntl();
    const hintId = useId();

    return (
        <DrillableCellHintIdContext.Provider value={hintId}>
            {children}
            {/* Hidden, so it is not read on its own; aria-describedby still uses its text. */}
            <span id={hintId} hidden>
                {intl.formatMessage(messages["drillableCellHint"])}
            </span>
        </DrillableCellHintIdContext.Provider>
    );
}

/**
 * Describes the grid cell with the drill hint while the cell is drillable.
 *
 * @internal
 */
export function DrillableCellDescription({
    eGridCell,
    isDrillable,
}: {
    eGridCell: HTMLElement | undefined;
    isDrillable: boolean;
}) {
    const hintId = useContext(DrillableCellHintIdContext);

    useLayoutEffect(() => {
        if (!eGridCell || !hintId || !isDrillable) {
            return undefined;
        }

        eGridCell.setAttribute("aria-describedby", hintId);
        return () => eGridCell.removeAttribute("aria-describedby");
    }, [eGridCell, hintId, isDrillable]);

    return null;
}
