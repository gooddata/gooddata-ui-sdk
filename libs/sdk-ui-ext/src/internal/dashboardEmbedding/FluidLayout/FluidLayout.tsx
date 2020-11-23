// (C) 2007-2020 GoodData Corporation
import React from "react";
import { Container, ScreenClassProvider, ScreenClassRender } from "react-grid-system";
import {
    IFluidLayout,
    IFluidLayoutColumn,
    IFluidLayoutRow,
    ResponsiveScreenType,
} from "@gooddata/sdk-backend-spi";
import { FluidLayoutRow } from "./FluidLayoutRow";
import {
    IFluidLayoutColumnKeyGetter,
    IFluidLayoutColumnRenderer,
    IFluidLayoutContentRenderer,
    IFluidLayoutRowKeyGetter,
    IFluidLayoutRowRenderer,
} from "./interfaces";

export interface IFluidLayoutComponentProps<
    TContent,
    TColumn extends IFluidLayoutColumn<TContent>,
    TRow extends IFluidLayoutRow<TContent, TColumn>
> {
    layout: IFluidLayout<TContent, TColumn, TRow>;
    rowKeyGetter?: IFluidLayoutRowKeyGetter<TContent, TColumn, TRow>;
    rowRenderer?: IFluidLayoutRowRenderer<TContent, TColumn, TRow>;
    columnKeyGetter?: IFluidLayoutColumnKeyGetter<TContent, TColumn, TRow>;
    columnRenderer?: IFluidLayoutColumnRenderer<TContent, TColumn, TRow>;
    contentRenderer: IFluidLayoutContentRenderer<TContent, TColumn, TRow>;
    className?: string;
    containerClassName?: string;
    onMouseLeave?: (e: React.MouseEvent<HTMLDivElement>) => void;
}

/**
 * FluidLayout component takes fluid layout with any content,
 * and renders it on top of react-grid-system.
 * You can modify/extend rendering for any part of the layout (row/column/content)
 * by passing custom renderers.
 *
 * @alpha
 */
export function FluidLayout<
    TContent,
    TColumn extends IFluidLayoutColumn<TContent>,
    TRow extends IFluidLayoutRow<TContent, TColumn>
>(props: IFluidLayoutComponentProps<TContent, TColumn, TRow>): React.ReactElement {
    const {
        layout,
        rowKeyGetter = ({ rowIndex }) => rowIndex,
        rowRenderer,
        columnKeyGetter,
        columnRenderer,
        contentRenderer,
        className,
        containerClassName,
        onMouseLeave,
    } = props;

    return (
        <div className={className} onMouseLeave={onMouseLeave}>
            <ScreenClassProvider useOwnWidth={false}>
                <ScreenClassRender
                    render={(screen: ResponsiveScreenType) =>
                        screen ? (
                            <Container fluid={true} className={containerClassName}>
                                {layout.rows.map((row, rowIndex) => (
                                    <FluidLayoutRow
                                        key={rowKeyGetter({ row, rowIndex, screen })}
                                        row={row}
                                        rowIndex={rowIndex}
                                        rowRenderer={rowRenderer}
                                        columnKeyGetter={columnKeyGetter}
                                        columnRenderer={columnRenderer}
                                        contentRenderer={contentRenderer}
                                        screen={screen}
                                    />
                                ))}
                            </Container>
                        ) : null
                    }
                />
            </ScreenClassProvider>
        </div>
    );
}
