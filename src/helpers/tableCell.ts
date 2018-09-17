// (C) 2007-2018 GoodData Corporation
import * as classNames from 'classnames';
import { colors2Object, ISeparators, numberFormat } from '@gooddata/numberjs';

import { styleVariables } from '../components/visualizations/styles/variables';

import {
    IMeasureTableHeader,
    isAttributeCell,
    ITableCellStyle,
    ITableCellStyleAndFormattedValue,
    MeasureCell,
    TableCell,
    TableHeader
} from '../interfaces/Table';

function getFormattedNumber(cellContent: MeasureCell, format: string, separators: ISeparators): string {
    const parsedNumber: string | number = cellContent === null
        ? ''
        : parseFloat(cellContent);

    return numberFormat(parsedNumber, format, undefined, separators);
}

export function getCellClassNames(rowIndex: number, columnIndex: number, isDrillable: boolean): string {
    return classNames(
        {
            'gd-cell-drillable': isDrillable
        },
        `s-cell-${rowIndex}-${columnIndex}`,
        's-table-cell'
    );
}

export function getMeasureCellFormattedValue(
    cellContent: MeasureCell,
    format: string,
    separators: ISeparators
): string {
    const formattedNumber = getFormattedNumber(cellContent, format, separators);
    const { label } = colors2Object(formattedNumber);

    return label === ''
        ? '–'
        : label;
}

export function getMeasureCellStyle(
    cellContent: MeasureCell,
    format: string,
    separators: ISeparators,
    applyColor: boolean
): ITableCellStyle {
    const formattedNumber = getFormattedNumber(cellContent, format, separators);
    const { color, label } = colors2Object(formattedNumber);

    if (label === '') {
        return {
            color: styleVariables.gdColorStateBlank,
            fontWeight: 'bold'
        };
    }

    return (applyColor && color)
        ? { color }
        : {};
}

export function getCellStyleAndFormattedValue(
    header: TableHeader,
    cellContent: TableCell,
    applyColor: boolean = true,
    separators?: ISeparators
): ITableCellStyleAndFormattedValue {
    if (isAttributeCell(cellContent)) {
        return {
            style: {},
            formattedValue: cellContent.name
        };
    }

    const measureFormat = (header as IMeasureTableHeader).format;

    return {
        style: getMeasureCellStyle(cellContent, measureFormat, separators, applyColor),
        formattedValue: getMeasureCellFormattedValue(cellContent, measureFormat, separators)
    };
}
