// (C) 2019-2022 GoodData Corporation
import { IDataView } from "@gooddata/sdk-backend-spi";
import { DataValue } from "@gooddata/sdk-model";
import { invariant } from "ts-invariant";
import isArray from "lodash/isArray.js";

/**
 * Methods to access data and totals in a result.
 *
 * @internal
 */
export interface IResultDataMethods {
    /**
     * @returns true if the data is empty
     */
    isEmpty(): boolean;

    /**
     * @returns size for first dimension of the data view
     */
    firstDimSize(): number;

    /**
     * @param index - index within first dimension
     * @returns data at index of the first dimension of the data view; if the data view has single dimension
     *  then returns actual data point; if the data view is two dimensional, then returns array
     */
    dataAt(index: number): DataValue | DataValue[];

    /**
     * @returns all data in the data view; this is array of arrays for two dim views or array of data points
     *  for one dimensional data view
     */
    data(): DataValue[][] | DataValue[];

    /**
     * This is a convenience method that asserts whether data in the data view is one dimensional and if so
     * returns array of data points.
     *
     * @returns array of data points, empty array if there's no data at all
     */
    singleDimData(): DataValue[];

    /**
     * This is a convenience method that determines whether the data in the data view is two dimension; if it
     * is then data is returned as-is. If the data is single dimension, this method will up-cast the data to
     * two dimensions.
     *
     * TODO: this method has serious contract issues and inconsistencies; it even borders outright dumb behavior :)
     *   investigation & clean up is a must
     *
     * @returns two dimensional data; if data is empty, returns array with single empty array in
     */
    twoDimData(): DataValue[][];

    /**
     * @returns grand totals in the data view, undefined if there are no grand totals
     */
    totals(): DataValue[][][] | undefined;

    /**
     * @returns grand totals for row in the data view, undefined if there are no row grand totals
     */
    rowTotals(): DataValue[][] | undefined;

    /**
     * @returns grand totals for column in the data view, undefined if there are no column grand totals
     */
    columnTotals(): DataValue[][] | undefined;

    /**
     * @returns totals of grand totals in the data view, undefined if there are no totals of grand totals
     */
    totalOfTotals(): DataValue[][][] | undefined;

    /**
     * Tests whether the data view included grand totals for row
     *
     * @returns true if row grand totals present, false if not
     */
    hasRowTotals(): boolean;

    /**
     * Tests whether the data view included grand totals for column
     *
     * @returns true if column grand totals present, false if not
     */
    hasColumnTotals(): boolean;

    /**
     * Tests whether the data view included grand totals.
     *
     * @returns true if grand totals present, false if not
     */
    hasTotals(): boolean;
}

class ResultDataMethods implements IResultDataMethods {
    constructor(private readonly dataView: IDataView) {}

    public isEmpty(): boolean {
        return this.dataView.data.length === 0;
    }

    public firstDimSize(): number {
        return this.dataView.totalCount[0];
    }

    public dataAt(index: number): DataValue | DataValue[] {
        return this.dataView.data[index];
    }

    public data(): DataValue[][] | DataValue[] {
        return this.dataView.data;
    }

    public singleDimData(): DataValue[] {
        const d = this.dataView.data;

        if (d === null) {
            return [];
        }

        const e = d[0];

        invariant(
            !isArray(e),
            "trying to work with single-dim data while the underlying data view has two dims",
        );

        return d as DataValue[];
    }

    public twoDimData(): DataValue[][] {
        const d = this.dataView.data;

        if (d === null) {
            return [];
        }

        const e = d[0];

        if (e === null || !e) {
            return [];
        }

        return isArray(e) ? (d as DataValue[][]) : ([d] as DataValue[][]);
    }

    public totals(): DataValue[][][] | undefined {
        return this.dataView.totals;
    }

    public rowTotals(): DataValue[][] | undefined {
        return this.dataView.totals?.[0];
    }

    public columnTotals(): DataValue[][] | undefined {
        return this.dataView.totals?.[1];
    }

    public totalOfTotals(): DataValue[][][] | undefined {
        return this.dataView.totalTotals;
    }

    /**
     *
     * @returns - existance of totals for rows
     */
    public hasRowTotals(): boolean {
        return this.dataView.totals?.[0] !== undefined && this.dataView.totals[0].length > 0;
    }

    /**
     *
     * @returns - existance of totals for columns
     */
    public hasColumnTotals(): boolean {
        return this.dataView.totals?.[1] !== undefined && this.dataView.totals[1].length > 0;
    }

    /**
     *
     * @returns - existance of totals
     */
    public hasTotals(): boolean {
        return this.dataView.totals !== undefined;
    }
}

export function newResultDataMethods(dataView: IDataView): IResultDataMethods {
    return new ResultDataMethods(dataView);
}
