// (C) 2019 GoodData Corporation
import * as classNames from "classnames";
import clamp = require("lodash/clamp");
import { string } from "@gooddata/js-utils";
import { IMappingHeader } from "../../../../interfaces/MappingHeader";
import { getMappingHeaderLocalIdentifier } from "../../../../helpers/mappingHeader";

import { getHiddenRowsOffset } from "./row";
import {
    Align,
    IAlignPoint,
    IHeaderTooltipArrowPosition,
    IPositions,
    ITableColumnProperties,
    ITableDimensions,
} from "../../../../interfaces/Table";
import { ALIGN_LEFT } from "../constants/align";
import { ITotalWithData } from "../../../../interfaces/Totals";
import {
    DEFAULT_FOOTER_ROW_HEIGHT,
    DEFAULT_HEADER_HEIGHT,
    DEFAULT_ROW_HEIGHT,
    TOTALS_ADD_ROW_HEIGHT,
} from "../constants/layout";

const HEADER_PADDING: number = 8;
const MOBILE_SORT_TOOLTIP_OFFSET: number = 20;

const isLeftAligned: (align: Align) => boolean = (align: Align) => align === ALIGN_LEFT;

const getPoints: (x: number, y?: number) => { x: number; y: number } = (
    x: number,
    y: number = -HEADER_PADDING,
) => ({ x, y }); // y has always offset

const { simplifyText } = string;

export interface IRef {
    getBoundingClientRect: () => ClientRect;
}

export function calculateArrowPosition(
    columnProperties: ITableColumnProperties,
    tableScrollX: number,
    tableWrapRef: IRef,
): IHeaderTooltipArrowPosition {
    const tableWrapRect: ClientRect = tableWrapRef.getBoundingClientRect();

    // diff between table position and fixed tooltip left offset
    const offsetLeft: number = tableWrapRect.left - MOBILE_SORT_TOOLTIP_OFFSET;

    // prevent arrow to show outside the table
    const min: number = offsetLeft + HEADER_PADDING;
    const max: number = tableWrapRect.right - MOBILE_SORT_TOOLTIP_OFFSET - HEADER_PADDING;

    const left: number =
        columnProperties.width * columnProperties.index -
        tableScrollX +
        (isLeftAligned(columnProperties.align) ? HEADER_PADDING : columnProperties.width - HEADER_PADDING) +
        offsetLeft;

    return { left: `${clamp(left, min, max)}px` };
}

export function getHeaderClassNames(header: IMappingHeader): string {
    return classNames(
        "gd-table-header-ordering",
        `s-id-${simplifyText(getMappingHeaderLocalIdentifier(header))}`,
    );
}

export function getHeaderOffset(hasHiddenRows: boolean): number {
    return DEFAULT_HEADER_HEIGHT + (hasHiddenRows ? 1.5 : 1) * DEFAULT_ROW_HEIGHT;
}

export function isHeaderAtDefaultPosition(stickyHeaderOffset: number, tableTop: number): boolean {
    return tableTop >= stickyHeaderOffset;
}

export function getFooterHeight(
    totals: ITotalWithData[],
    totalsEditAllowed: boolean,
    totalsAreVisible: boolean,
): number {
    return (
        (totalsAreVisible ? totals.length * DEFAULT_FOOTER_ROW_HEIGHT : 0) +
        (totalsEditAllowed ? TOTALS_ADD_ROW_HEIGHT : 0)
    );
}

export function isFooterAtDefaultPosition(
    hasHiddenRows: boolean,
    tableBottom: number,
    windowHeight: number,
): boolean {
    const hiddenRowsOffset: number = getHiddenRowsOffset(hasHiddenRows);

    return tableBottom - hiddenRowsOffset <= windowHeight;
}

export function isFooterAtEdgePosition(
    hasHiddenRows: boolean,
    totals: ITotalWithData[],
    windowHeight: number,
    totalsEditAllowed: boolean,
    totalsAreVisible: boolean,
    tableDimensions: ITableDimensions,
): boolean {
    const { height: tableHeight, bottom: tableBottom } = tableDimensions;

    const footerHeight: number = getFooterHeight(totals, totalsEditAllowed, totalsAreVisible);
    const headerOffset: number = getHeaderOffset(hasHiddenRows);

    const footerHeightTranslate: number = tableHeight - footerHeight;

    return tableBottom + headerOffset >= windowHeight + footerHeightTranslate;
}

export function getFooterPositions(
    hasHiddenRows: boolean,
    totals: ITotalWithData[],
    windowHeight: number,
    totalsEditAllowed: boolean,
    totalsAreVisible: boolean,
    tableDimensions: ITableDimensions,
): IPositions {
    const { height: tableHeight, bottom: tableBottom } = tableDimensions;

    const footerHeight = getFooterHeight(totals, totalsEditAllowed, totalsAreVisible);
    const hiddenRowsOffset = getHiddenRowsOffset(hasHiddenRows);
    const headerOffset = getHeaderOffset(hasHiddenRows);

    const footerHeightTranslate = tableHeight - footerHeight;

    return {
        defaultTop: -hiddenRowsOffset,
        edgeTop: headerOffset - footerHeightTranslate,
        fixedTop: windowHeight - footerHeightTranslate - footerHeight,
        absoluteTop: windowHeight - tableBottom,
    };
}

export function isHeaderAtEdgePosition(
    stickyHeaderOffset: number,
    hasHiddenRows: boolean,
    totals: ITotalWithData[],
    tableBottom: number,
    totalsEditAllowed: boolean,
    totalsAreVisible: boolean,
): boolean {
    const footerHeight: number = getFooterHeight(totals, totalsEditAllowed, totalsAreVisible);
    const hiddenRowsOffset: number = getHiddenRowsOffset(hasHiddenRows);
    const headerOffset: number = getHeaderOffset(hasHiddenRows);

    return (
        tableBottom >= stickyHeaderOffset &&
        tableBottom < stickyHeaderOffset + headerOffset + footerHeight + hiddenRowsOffset
    );
}

export function getHeaderPositions(
    stickyHeaderOffset: number,
    hasHiddenRows: boolean,
    totals: ITotalWithData[],
    totalsEditAllowed: boolean,
    totalsAreVisible: boolean,
    tableDimensions: ITableDimensions,
): IPositions {
    const { height: tableHeight, top: tableTop } = tableDimensions;

    const footerHeight: number = getFooterHeight(totals, totalsEditAllowed, totalsAreVisible);
    const hiddenRowsOffset: number = getHiddenRowsOffset(hasHiddenRows);
    const headerOffset: number = getHeaderOffset(hasHiddenRows);

    return {
        defaultTop: 0,
        edgeTop: tableHeight - headerOffset - footerHeight - hiddenRowsOffset,
        fixedTop: stickyHeaderOffset,
        absoluteTop: stickyHeaderOffset - tableTop,
    };
}

export const getTooltipAlignPoints: (columnAlign: Align) => IAlignPoint[] = (columnAlign: Align) => {
    return isLeftAligned(columnAlign)
        ? [
              { align: "bl tl", offset: getPoints(HEADER_PADDING, 0) },
              { align: "bl tc", offset: getPoints(HEADER_PADDING, 0) },
              { align: "bl tr", offset: getPoints(HEADER_PADDING, 0) },
          ]
        : [
              { align: "br tr", offset: getPoints(-HEADER_PADDING, 0) },
              { align: "br tc", offset: getPoints(-HEADER_PADDING, 0) },
              { align: "br tl", offset: getPoints(-HEADER_PADDING, 0) },
          ];
};

export function getTooltipSortAlignPoints(columnAlign: Align): IAlignPoint[] {
    // Known issue - wrong tooltip alignment when
    // distance between table left side and window is more than cca 20px,
    // header cell is not fully visible (is scrolled)

    // last align point is used when header cell is not fully visible (scroll)
    return isLeftAligned(columnAlign)
        ? [
              { align: "bl tl", offset: getPoints(HEADER_PADDING) },
              { align: "bl tc", offset: getPoints(HEADER_PADDING) },
              { align: "bl tr", offset: getPoints(HEADER_PADDING) },
              { align: "br tl", offset: getPoints(-HEADER_PADDING) },
              { align: "tl bl", offset: getPoints(HEADER_PADDING, HEADER_PADDING) },
              { align: "tl bc", offset: getPoints(HEADER_PADDING, HEADER_PADDING) },
              { align: "tl br", offset: getPoints(HEADER_PADDING, HEADER_PADDING) },
              { align: "tr bl", offset: getPoints(-HEADER_PADDING, HEADER_PADDING) },
          ]
        : [
              { align: "br tr", offset: getPoints(-HEADER_PADDING) },
              { align: "br tc", offset: getPoints(-HEADER_PADDING) },
              { align: "br tl", offset: getPoints(-HEADER_PADDING) },
              { align: "bl tr", offset: getPoints(HEADER_PADDING) },
              { align: "tr br", offset: getPoints(-HEADER_PADDING, HEADER_PADDING) },
              { align: "tr bc", offset: getPoints(-HEADER_PADDING, HEADER_PADDING) },
              { align: "tr bl", offset: getPoints(-HEADER_PADDING, HEADER_PADDING) },
              { align: "tl br", offset: getPoints(HEADER_PADDING, HEADER_PADDING) },
          ];
}
