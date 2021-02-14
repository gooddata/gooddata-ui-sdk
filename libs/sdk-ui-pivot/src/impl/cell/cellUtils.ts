// (C) 2007-2021 GoodData Corporation
import cx from "classnames";
import { colors2Object, ISeparators, numberFormat } from "@gooddata/numberjs";

import { ITableCellStyle, MeasureCell } from "../../types";

function getFormattedNumber(
    cellContent: MeasureCell,
    format: string,
    separators: ISeparators | undefined,
): string {
    const parsedNumber: string | number =
        cellContent === null ? "" : typeof cellContent === "string" ? parseFloat(cellContent) : cellContent;

    return numberFormat(parsedNumber, format, undefined, separators);
}

// TODO: move to cell class; refactor tests
export function getCellClassNames(rowIndex: number, columnIndex: number, isDrillable: boolean): string {
    return cx(
        {
            "gd-cell-drillable": isDrillable,
        },
        "gd-cell",
        `s-cell-${rowIndex}-${columnIndex}`,
        "s-table-cell",
    );
}

export function getMeasureCellFormattedValue(
    cellContent: MeasureCell,
    format: string,
    separators: ISeparators | undefined,
): string {
    const formattedNumber = getFormattedNumber(cellContent, format, separators);
    const { label } = colors2Object(formattedNumber);

    return label === "" ? "–" : label;
}

export function getMeasureCellStyle(
    cellContent: MeasureCell,
    format: string,
    separators: ISeparators | undefined,
    applyColor: boolean,
): ITableCellStyle {
    const formattedNumber = getFormattedNumber(cellContent, format, separators);
    const { backgroundColor, color, label } = colors2Object(formattedNumber);

    if (label === "") {
        return {
            color: "#94a1ad",
            fontWeight: "bold",
        };
    }

    if (!applyColor) {
        return {};
    }

    return {
        ...(color && { color }),
        ...(backgroundColor && { backgroundColor }),
    };
}
