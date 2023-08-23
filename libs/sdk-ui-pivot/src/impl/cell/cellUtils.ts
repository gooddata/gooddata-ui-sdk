// (C) 2007-2023 GoodData Corporation
import cx from "classnames";
import { DataValue, ISeparators } from "@gooddata/sdk-model";
import { CellStyle } from "@ag-grid-community/all-modules";
import { ClientFormatterFacade, IFormattedResult } from "@gooddata/number-formatter";

export interface ITableCellStyle {
    backgroundColor?: string;
    color?: string;
    fontWeight?: React.CSSProperties["fontWeight"];
}

function getFormattedNumber(value: DataValue, format?: string, separators?: ISeparators): IFormattedResult {
    const parsedNumber = ClientFormatterFacade.convertValue(value);
    return ClientFormatterFacade.formatValue(parsedNumber, format, separators);
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
    value: DataValue,
    format: string,
    separators: ISeparators | undefined,
): string {
    const { formattedValue } = getFormattedNumber(value, format, separators);

    return formattedValue === "" ? "–" : formattedValue;
}

export function getMeasureCellStyle(
    value: DataValue,
    format: string,
    separators: ISeparators | undefined,
    applyColor: boolean,
): CellStyle {
    const { formattedValue, colors } = getFormattedNumber(value, format, separators);
    const color = colors.color;
    const backgroundColor = colors.backgroundColor;

    const measureCellDefault = {
        textAlign: "right",
    };

    if (formattedValue === "") {
        return {
            ...measureCellDefault,
            color: "var(--gd-table-nullValueColor, var(--gd-palette-complementary-6, #94a1ad))",
            fontWeight: "bold",
        };
    }

    if (!applyColor) {
        return {
            ...measureCellDefault,
        };
    }

    return {
        ...measureCellDefault,
        ...(color && { color }),
        ...(backgroundColor && { backgroundColor }),
    };
}
