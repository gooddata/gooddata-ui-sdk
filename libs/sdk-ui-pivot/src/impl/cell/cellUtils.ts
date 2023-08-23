// (C) 2007-2022 GoodData Corporation
import cx from "classnames";
import { ClientFormatterFacade, IFormattedResult } from "@gooddata/number-formatter";

import { DataValue, ISeparators } from "@gooddata/sdk-model";

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
): ITableCellStyle {
    const { formattedValue, colors } = getFormattedNumber(value, format, separators);
    const color = colors.color;
    const backgroundColor = colors.backgroundColor;

    if (formattedValue === "") {
        return {
            color: "var(--gd-table-nullValueColor, var(--gd-palette-complementary-6, #94a1ad))",
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
