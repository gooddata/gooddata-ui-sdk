// (C) 2024 GoodData Corporation

import React from "react";
import { WrappedComponentProps, injectIntl } from "react-intl";
import noop from "lodash/noop.js";
import { IChartConfig } from "../../../interfaces/index.js";
import { ExplicitDrill, IDrillEventCallback } from "@gooddata/sdk-ui";
import { IDataView } from "@gooddata/sdk-backend-spi";
import { RepeaterChart } from "./RepeaterChart.js";
import { DataValue, isMeasure, resultHeaderName } from "@gooddata/sdk-model";

export interface IRepeaterTransformationProps {
    dataView: IDataView;
    drillableItems?: ExplicitDrill[];
    config?: IChartConfig;

    onDrill?: IDrillEventCallback;
    onAfterRender?: () => void;
}

class RepeaterTransformation extends React.Component<IRepeaterTransformationProps & WrappedComponentProps> {
    public static defaultProps: Pick<
        IRepeaterTransformationProps,
        "config" | "drillableItems" | "onDrill" | "onAfterRender"
    > = {
        config: {},
        drillableItems: [],
        onDrill: () => true,
        onAfterRender: noop,
    };

    public render() {
        const transformedDataView = this.transformDataView(this.props.dataView);

        return <RepeaterChart data={transformedDataView as any} headers={[]} />;
    }

    private transformDataView(dataView: IDataView) {
        const { headerItems, data, count, definition } = dataView;
        const totalNumberOfTableRows = count[0];
        const rowAttributeItemHeaders = headerItems[0];
        const numberOfMeasures = definition.buckets[1]?.items?.filter(isMeasure)?.length ?? 0;
        const numberOfAttributesHeadersToUse = rowAttributeItemHeaders.length - numberOfMeasures;

        const transformedData: DataValue[][] = [];
        for (let rowIndex = 0; rowIndex < totalNumberOfTableRows; rowIndex++) {
            const row: DataValue[] = [];

            // row names
            for (
                let attributeHeaderIndex = 1; // we skip the first one - main row attribute
                attributeHeaderIndex < numberOfAttributesHeadersToUse;
                attributeHeaderIndex++
            ) {
                row.push(resultHeaderName(rowAttributeItemHeaders[attributeHeaderIndex][rowIndex]));
            }

            // data values
            if (data.length > 0) {
                row.push((data as any)[rowIndex]);
            }

            transformedData.push(row);
        }

        return transformedData;
    }
}

export default injectIntl(RepeaterTransformation);
