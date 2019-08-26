// (C) 2007-2019 GoodData Corporation
import * as React from "react";
import Measure from "react-measure";
import { IHeaderPredicate } from "../../../interfaces/HeaderPredicate";

import { TableVisualization, ITableVisualizationProps } from "./TableVisualization";

export interface IDimensions {
    height: number;
    width: number;
}

export interface ITableProps extends ITableVisualizationProps {
    containerWidth?: number;
    containerHeight?: number;
    drillablePredicates?: IHeaderPredicate[];
}

export class Table extends React.Component<ITableProps> {
    public render(): JSX.Element {
        const { containerHeight, containerWidth } = this.props;
        return (
            <Measure client={true}>
                {({ measureRef, contentRect }: any) => {
                    const measuredHeight =
                        contentRect.client && contentRect.client.height
                            ? Math.floor(contentRect.client.height)
                            : 0;
                    const usedHeight = containerHeight || measuredHeight;

                    const measuredWidth =
                        contentRect.client && contentRect.client.width
                            ? Math.floor(contentRect.client.width)
                            : 0;
                    const usedWidth = containerWidth || measuredWidth;
                    return (
                        <div
                            className="viz-table-wrap"
                            style={{ height: "100%", width: "100%", position: "relative" }}
                            ref={measureRef}
                        >
                            <TableVisualization
                                {...this.props}
                                containerHeight={usedHeight}
                                containerWidth={usedWidth}
                            />
                        </div>
                    );
                }}
            </Measure>
        );
    }
}
