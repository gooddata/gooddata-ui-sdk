// (C) 2019-2025 GoodData Corporation
import { IDataView } from "@gooddata/sdk-backend-spi";
import { isMeasureGroupDescriptor, IMeasureGroupDescriptor } from "@gooddata/sdk-model";

/**
 * @internal
 */
export type IMeasureDimensionInfo =
    | {
          hasMeasures: true;
          measureDimension: "columns" | "rows";
          measureGroupDescriptor: IMeasureGroupDescriptor;
      }
    | {
          hasMeasures: false;
          measureDimension: undefined;
          measureGroupDescriptor: undefined;
      };

/**
 * @internal
 */
export function collectMeasureDimensionInfo(dataView: IDataView): IMeasureDimensionInfo {
    const dimensions = dataView.result.dimensions;

    const [firstDim, secondDim] = dimensions;

    const secondDimMeasureGroupDescriptor = secondDim?.headers.find(isMeasureGroupDescriptor);
    if (secondDimMeasureGroupDescriptor) {
        return {
            hasMeasures: true,
            measureDimension: "columns",
            measureGroupDescriptor: secondDimMeasureGroupDescriptor,
        };
    }

    const firstDimMeasureGroupDescriptor = firstDim?.headers.find(isMeasureGroupDescriptor);
    if (firstDimMeasureGroupDescriptor) {
        return {
            hasMeasures: true,
            measureDimension: "rows",
            measureGroupDescriptor: firstDimMeasureGroupDescriptor,
        };
    }

    return {
        hasMeasures: false,
        measureDimension: undefined,
        measureGroupDescriptor: undefined,
    };
}
