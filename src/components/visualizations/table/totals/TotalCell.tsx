// (C) 2007-2019 GoodData Corporation
import * as React from "react";
import * as classNames from "classnames";
import noop = require("lodash/noop");
import uniqueId = require("lodash/uniqueId");
import { Cell } from "fixed-data-table-2";
import { injectIntl, InjectedIntlProps } from "react-intl";
import { ISeparators } from "@gooddata/numberjs";
import { VisualizationObject } from "@gooddata/typings";
import { isMappingHeaderMeasureItem, IMappingHeader } from "../../../../interfaces/MappingHeader";

import { getCellStyleAndFormattedValue } from "../../../../helpers/tableCell";
import {
    getTotalsDataSource,
    hasTableColumnTotalEnabled,
    shouldShowAddTotalButton,
    AVAILABLE_TOTALS,
} from "./utils";
import { AddTotal } from "./AddTotal";
import { ITotalWithData, IIndexedTotalItem } from "../../../../interfaces/Totals";
import { DEFAULT_FOOTER_ROW_HEIGHT, TOTALS_ADD_ROW_HEIGHT } from "../constants/layout";

export interface ITotalCellProps {
    totalsWithData: ITotalWithData[];
    columnIndex: number;
    header: IMappingHeader;
    headersCount: number;
    firstMeasureIndex: number;
    editAllowed?: boolean;
    separators?: ISeparators;
    onCellMouseOver?: (rowIndex: number, columnIndex: number) => void;
    onCellMouseLeave?: (rowIndex: number, columnIndex: number) => void;
    onEnableColumn?: (columnIndex: number, totalType: VisualizationObject.TotalType) => void;
    onDisableColumn?: (columnIndex: number, totalType: VisualizationObject.TotalType) => void;
    onAddDropdownOpenStateChanged?: (columnIndex: number, isOpened: boolean) => void;
    onAddWrapperHover?: (columnIndex: number, isHighlighted: boolean) => void;
    onAddButtonHover?: (columnIndex: number, isHovering: boolean) => void;
    onRowAdd?: (columnIndex: number, totalType: VisualizationObject.TotalType) => void;
}

export class TotalCellPure extends React.Component<ITotalCellProps & InjectedIntlProps> {
    public static defaultProps: Partial<ITotalCellProps> = {
        editAllowed: false,
        onCellMouseOver: noop,
        onCellMouseLeave: noop,
        onEnableColumn: noop,
        onDisableColumn: noop,
        onAddDropdownOpenStateChanged: noop,
        onAddWrapperHover: noop,
        onAddButtonHover: noop,
        onRowAdd: noop,
    };

    public render() {
        const {
            columnIndex,
            header,
            totalsWithData,
            editAllowed,
            headersCount,
            firstMeasureIndex,
            separators,
            onCellMouseOver,
            onCellMouseLeave,
        } = this.props;

        const isFirstColumn = columnIndex === 0;
        const measureColumnIndex = columnIndex - firstMeasureIndex;
        const isMeasureColumn = measureColumnIndex >= 0;

        const cellContent = totalsWithData.map((total, rowIndex) => {
            const classes = classNames(
                "indigo-table-footer-cell",
                `col-${columnIndex}`,
                `s-total-${total.type}-${columnIndex}`,
            );
            const style = { height: DEFAULT_FOOTER_ROW_HEIGHT };

            const events = editAllowed
                ? {
                      onMouseOver: () => {
                          onCellMouseOver(rowIndex, columnIndex);
                      },
                      onMouseLeave: () => {
                          onCellMouseLeave(rowIndex, columnIndex);
                      },
                  }
                : {};

            return (
                <div {...events} key={uniqueId("footer-cell-")} className={classes} style={style}>
                    {this.renderCellContent(
                        isFirstColumn,
                        isMeasureColumn,
                        columnIndex,
                        measureColumnIndex,
                        total,
                        header,
                        separators,
                    )}
                </div>
            );
        });

        return (
            <Cell>
                {cellContent}
                {this.renderEditCell(header, columnIndex, headersCount)}
            </Cell>
        );
    }

    private renderAddTotalButton(header: IMappingHeader, columnIndex: number, headersCount: number) {
        if (!shouldShowAddTotalButton(header, columnIndex === 0, true)) {
            return null;
        }
        const {
            totalsWithData,
            intl,
            onAddDropdownOpenStateChanged,
            onAddWrapperHover,
            onAddButtonHover,
            onRowAdd,
        } = this.props;

        const dataSource = getTotalsDataSource(totalsWithData, intl);

        return (
            <AddTotal
                dataSource={dataSource}
                header={header}
                columnIndex={columnIndex}
                headersCount={headersCount}
                onDropdownOpenStateChanged={onAddDropdownOpenStateChanged}
                onWrapperHover={onAddWrapperHover}
                onButtonHover={onAddButtonHover}
                onAddTotalsRow={onRowAdd}
                addingMoreTotalsEnabled={totalsWithData.length < AVAILABLE_TOTALS.length}
            />
        );
    }

    private renderEditCell(header: IMappingHeader, columnIndex: number, headersCount: number) {
        if (!this.props.editAllowed) {
            return null;
        }

        const style = { height: TOTALS_ADD_ROW_HEIGHT };

        const className = classNames(
            "indigo-table-footer-cell",
            `col-${columnIndex}`,
            "indigo-totals-add-cell",
            `s-total-add-cell-${columnIndex}`,
        );

        return (
            <div className={className} style={style}>
                {this.renderAddTotalButton(header, columnIndex, headersCount)}
            </div>
        );
    }

    private renderHeaderCellContent(total: IIndexedTotalItem) {
        const { intl } = this.props;
        const content =
            total.alias || intl.formatMessage({ id: `visualizations.totals.row.title.${total.type}` });
        return <span className={classNames(`s-total-header-${total.type}`)}>{content}</span>;
    }

    private renderMeasureCellContent(
        formattedValue: string,
        style: React.CSSProperties,
        total: IIndexedTotalItem,
        header: IMappingHeader,
        columnIndex: number,
    ) {
        const { firstMeasureIndex, editAllowed } = this.props;

        if (!isMappingHeaderMeasureItem(header)) {
            return null;
        }

        const columnHasTotal = hasTableColumnTotalEnabled(
            total.outputMeasureIndexes,
            columnIndex,
            firstMeasureIndex,
        );

        const labelElement = (
            <span className={classNames("s-total-value")} title={formattedValue} style={style}>
                {formattedValue}
            </span>
        );

        if (editAllowed) {
            if (columnHasTotal) {
                const onClick = () => this.props.onDisableColumn(columnIndex, total.type);
                return (
                    <span>
                        <span
                            className={classNames(
                                "gd-button-link",
                                "gd-button-icon-only",
                                "icon-circle-cross",
                                "indigo-totals-disable-column-button",
                                "s-disable-total-column",
                            )}
                            onClick={onClick}
                        />
                        {labelElement}
                    </span>
                );
            }

            const onClick = () => this.props.onEnableColumn(columnIndex, total.type);
            return (
                <span
                    className={classNames(
                        "gd-button-link",
                        "gd-button-icon-only",
                        "icon-circle-plus",
                        "indigo-totals-enable-column-button",
                        "s-enable-total-column",
                    )}
                    onClick={onClick}
                />
            );
        }

        if (!editAllowed && columnHasTotal) {
            return labelElement;
        }

        return null;
    }

    private renderCellContent(
        isFirstColumn: boolean,
        isMeasureColumn: boolean,
        columnIndex: number,
        measureColumnIndex: number,
        total: ITotalWithData,
        header: IMappingHeader,
        separators: ISeparators,
    ) {
        if (isFirstColumn) {
            return this.renderHeaderCellContent(total);
        }

        if (isMeasureColumn) {
            const value =
                total.values[measureColumnIndex] !== null
                    ? total.values[measureColumnIndex].toString()
                    : null;

            const { formattedValue, style } = getCellStyleAndFormattedValue(header, value, false, separators);
            return this.renderMeasureCellContent(formattedValue, style, total, header, columnIndex);
        }

        return "";
    }
}

export const TotalCell = injectIntl(TotalCellPure);
