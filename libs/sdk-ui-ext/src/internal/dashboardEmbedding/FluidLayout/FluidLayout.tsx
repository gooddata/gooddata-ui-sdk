// (C) 2007-2020 GoodData Corporation
import React, { useMemo } from "react";
import { Container, ScreenClassProvider, ScreenClassRender } from "react-grid-system";
import {
    ResponsiveScreenType,
    FluidLayoutFacade,
    IFluidLayoutRow,
    IFluidLayoutColumn,
    IFluidLayout,
    IFluidLayoutFacade,
    IFluidLayoutRowFacade,
    IFluidLayoutColumnFacade,
} from "@gooddata/sdk-backend-spi";
import { FluidLayoutRow } from "./FluidLayoutRow";
import { IFluidLayoutRenderer } from "./interfaces";

/**
 * @alpha
 */
export type IFluidLayoutProps<
    TContent,
    TRow extends IFluidLayoutRow<TContent>,
    TColumn extends IFluidLayoutColumn<TContent>,
    TLayout extends IFluidLayout<TContent>,
    TLayoutFacade extends IFluidLayoutFacade<TContent, TLayout>,
    TRowFacade extends IFluidLayoutRowFacade<TContent, TRow>,
    TColumnFacade extends IFluidLayoutColumnFacade<TContent, TColumn>
> = IFluidLayoutRenderer<TContent, TRow, TColumn, TLayout, TLayoutFacade, TRowFacade, TColumnFacade>;

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
    TRow extends IFluidLayoutRow<TContent>,
    TColumn extends IFluidLayoutColumn<TContent>,
    TLayout extends IFluidLayout<TContent>,
    TLayoutFacade extends IFluidLayoutFacade<TContent, TLayout>,
    TRowFacade extends IFluidLayoutRowFacade<TContent, TRow>,
    TColumnFacade extends IFluidLayoutColumnFacade<TContent, TColumn>
>(
    props: IFluidLayoutRenderer<TContent, TRow, TColumn, TLayout, TLayoutFacade, TRowFacade, TColumnFacade>,
): JSX.Element {
    const {
        layout,
        layoutFacadeConstructor = FluidLayoutFacade.for,
        rowKeyGetter = ({ row }) => row.index(),
        rowRenderer,
        rowHeaderRenderer,
        columnKeyGetter,
        columnRenderer,
        contentRenderer,
        className,
        containerClassName,
        onMouseLeave,
    } = props;

    const layoutFacade = useMemo(() => layoutFacadeConstructor(layout), [layout]);

    return (
        <div className={className} onMouseLeave={onMouseLeave}>
            <ScreenClassProvider useOwnWidth={false}>
                <ScreenClassRender
                    render={(screen: ResponsiveScreenType) =>
                        screen ? (
                            <Container fluid={true} className={containerClassName}>
                                {layoutFacade.rows().map((row: TRowFacade) => {
                                    return (
                                        <FluidLayoutRow
                                            key={rowKeyGetter({
                                                row,
                                                screen,
                                            })}
                                            row={row}
                                            rowRenderer={rowRenderer}
                                            rowHeaderRenderer={rowHeaderRenderer}
                                            columnKeyGetter={columnKeyGetter}
                                            columnRenderer={columnRenderer}
                                            contentRenderer={contentRenderer}
                                            screen={screen}
                                        />
                                    );
                                })}
                            </Container>
                        ) : null
                    }
                />
            </ScreenClassProvider>
        </div>
    );
}
