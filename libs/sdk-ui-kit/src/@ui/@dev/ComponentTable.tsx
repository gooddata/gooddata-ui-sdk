// (C) 2020-2025 GoodData Corporation
import React from "react";
import { CodeSnippet } from "./CodeSnippet.js";
/**
 * @internal
 */
export function propCombinationsFor<TProps extends object>(baseProps: TProps) {
    return function <TProp extends keyof TProps>(
        prop: TProp,
        values: TProps[TProp][],
        additionalProps?: Partial<TProps>,
    ): IPropCombination<TProps, TProp> {
        return {
            baseProps: {
                ...baseProps,
                ...additionalProps,
            },
            prop,
            values,
        };
    };
}

/**
 * @internal
 */
export interface IPropCombination<TProps extends object, TProp extends keyof TProps> {
    prop: TProp;
    values: TProps[TProp][];
    baseProps?: Partial<TProps>;
}

/**
 * @internal
 */
export interface IComponentTableProps<TProps extends object, TProp extends keyof TProps> {
    columnsBy?: IPropCombination<TProps, TProp> | undefined;
    rowsBy: IPropCombination<TProps, TProp>[];
    baseProps?: Partial<TProps>;
    Component: React.ComponentType<TProps>;
    codeSnippet?: string;
    debug?: boolean;
    cellWidth?: number;
    cellHeight?: number;
    align?: "center" | "flex-start";
}

interface IComponentTableRowProps<TProps extends object, TProp extends keyof TProps> {
    columnsBy?: IPropCombination<TProps, TProp> | undefined;
    row: IPropCombination<TProps, TProp>;
    baseProps?: Partial<TProps>;
    Component: React.ComponentType<TProps>;
    codeSnippet?: string;
    debug?: boolean;
    cellWidth?: number;
    cellHeight?: number;
    align?: "center" | "flex-start";
}

interface IComponentTableCellProps<TProps extends object> {
    Component: React.ComponentType<TProps>;
    codeSnippet?: string;
    props: TProps;
    cellWidth?: number;
    cellHeight?: number;
    debug?: boolean;
    align?: "center" | "flex-start";
}

const GAP = 10;
const PADDING = 5;

/**
 * @internal
 */
export function ComponentTable<TProps extends object, TProp extends keyof TProps>({
    Component,
    columnsBy,
    rowsBy,
    baseProps,
    debug = false,
    codeSnippet,
    cellWidth,
    cellHeight,
    align = "flex-start",
}: IComponentTableProps<TProps, TProp>) {
    return (
        <div
            style={{
                display: "flex",
                flexDirection: "column",
                gap: GAP,
            }}
        >
            {rowsBy.map((row) => {
                return (
                    <ComponentTableRow
                        key={JSON.stringify(row)}
                        row={row}
                        columnsBy={columnsBy}
                        baseProps={baseProps}
                        Component={Component}
                        debug={debug}
                        codeSnippet={codeSnippet}
                        cellWidth={cellWidth}
                        cellHeight={cellHeight}
                        align={align}
                    />
                );
            })}
        </div>
    );
}

/**
 * @internal
 */
export function ComponentTableRow<TProps extends object, TProp extends keyof TProps>({
    Component,
    columnsBy,
    row,
    baseProps,
    codeSnippet,
    debug,
    cellWidth,
    cellHeight,
    align,
}: IComponentTableRowProps<TProps, TProp>) {
    return (
        <div
            style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "stretch",
                justifyContent: "stretch",
                gap: GAP,
                padding: PADDING,
                border: debug ? "1px solid black" : "none",
            }}
        >
            {row.values.map((rowValue) => {
                return (
                    <div
                        key={JSON.stringify({ row, rowValue })}
                        style={{
                            border: debug ? "1px solid red" : "none",
                            display: "flex",
                            flexDirection: "row",
                            alignItems: "space-around",
                            justifyContent: "space-around",
                            gap: GAP,
                            padding: PADDING,
                        }}
                    >
                        {(columnsBy?.values ?? [undefined]).map((columnValue) => {
                            const props = {
                                ...baseProps,
                                ...(columnsBy?.baseProps ?? {}),
                                ...(row.baseProps ?? {}),
                                [row.prop]: rowValue,
                                ...(columnsBy ? { [columnsBy.prop]: columnValue } : {}),
                            } as TProps;

                            return (
                                <ComponentTableCell
                                    key={JSON.stringify(props)}
                                    Component={Component}
                                    codeSnippet={codeSnippet}
                                    props={props}
                                    cellWidth={cellWidth}
                                    cellHeight={cellHeight}
                                    debug={debug}
                                    align={align}
                                />
                            );
                        })}
                    </div>
                );
            })}
        </div>
    );
}

/**
 * @internal
 */
export function ComponentTableCell<TProps extends object>({
    Component,
    codeSnippet,
    props,
    cellWidth,
    cellHeight,
    debug,
    align,
}: IComponentTableCellProps<TProps>) {
    return (
        <div
            style={{
                display: "flex",
                flexDirection: "column",
                alignItems: align,
                justifyContent: align,
                gap: GAP,
                padding: PADDING,
                border: debug ? "1px solid green" : "none",
                width: cellWidth,
                height: cellHeight,
            }}
        >
            <div>
                <Component {...props} />
            </div>
            {codeSnippet ? (
                <div
                    style={{
                        width: "100%",
                    }}
                >
                    <CodeSnippet componentName={codeSnippet} componentProps={props} />
                </div>
            ) : null}
        </div>
    );
}
