// (C) 2021-2022 GoodData Corporation
import { useCallback, MutableRefObject } from "react";
import { ContentRect } from "react-measure";

export type CalculatedRows = {
    expandedHeight: number;
    collapsedHeight: number;
    rows: number[];
};

export const CalculatedRowsDefault = { expandedHeight: 0, collapsedHeight: 0, rows: [] };

export function useRowsCalculator(
    element: MutableRefObject<Element | null>,
): (dimensions: ContentRect) => CalculatedRows {
    return useCallback(
        (dimensions) => {
            const current = element.current;
            //no data yet
            if (!current || !dimensions.bounds) {
                return CalculatedRowsDefault;
            }

            const { height } = dimensions.bounds;
            const determinedRows = determineRows(current);
            const rows = createRows(determinedRows);

            return { expandedHeight: height, collapsedHeight: rows[0], rows };
        },
        [element],
    );
}

function determineRows(element: Element) {
    const children = Array.prototype.slice.call(element.childNodes);
    let last = Number.MIN_SAFE_INTEGER;

    return children.reduce(
        (rows, item) => {
            const hasWidth = Boolean(item.offsetWidth);
            //NOTE: If element has no width, it can not basically affect row break
            // so we can skip it here
            if (hasWidth) {
                const lastRow = rows[rows.length - 1];
                if (item.offsetLeft <= last) {
                    rows.push([item]);
                } else {
                    lastRow.push(item);
                }
                last = item.offsetLeft;
            }
            return rows;
        },
        [[]] as HTMLElement[][],
    );
}

function createRows(determinedRows: HTMLElement[][]) {
    return determinedRows.map((row) => {
        const itemsHeight = row.map((item) => item.offsetHeight ?? 0);
        return Math.max(...itemsHeight);
    });
}
