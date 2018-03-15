// (C) 2007-2018 GoodData Corporation
import * as React from 'react';
import * as Measure from 'react-measure';

import { TableVisualization, ITableVisualizationProps } from './TableVisualization';

export interface IDimensions {
    height: number;
    width: number;
}

export interface ITableProps extends ITableVisualizationProps {
    containerWidth?: number;
    containerHeight?: number;
}

export class Table extends React.Component<ITableProps> {
    public render(): JSX.Element {
        const { containerHeight, containerWidth } = this.props;
        return (
            <Measure>
                {(dimensions: IDimensions) => (
                    <div className="viz-table-wrap" style={{ height: '100%', width: '100%', position: 'relative' }}>
                        <TableVisualization
                            {...this.props}
                            containerHeight={containerHeight || dimensions.height}
                            containerWidth={containerWidth || dimensions.width}
                        />
                    </div>
                )}
            </Measure>
        );
    }
}
