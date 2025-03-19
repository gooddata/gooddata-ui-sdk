// (C) 2020-2024 GoodData Corporation
// import { PointsChartColorStrategy } from "../_chartColoring/pointsChart.js";
import { IColorDescriptor, IColorPalette, IColor } from "@gooddata/sdk-model";
import { IColorMapping } from "../../../interfaces/index.js";
import { IColorAssignment, DataViewFacade } from "@gooddata/sdk-ui";
import {
    ICreateColorAssignmentReturnValue,
    getAttributeColorAssignment,
    getColorFromMapping,
    isValidMappedColor,
} from "@gooddata/sdk-ui-vis-commons";
import { MeasureColorStrategy } from "../_chartColoring/measure.js";
import uniq from "lodash/uniq.js";

export class ScatterPlotColorStrategy extends MeasureColorStrategy {
    protected createColorAssignment(
        colorPalette: IColorPalette,
        colorMapping: IColorMapping[],
        // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
        viewByAttribute: any,
        // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
        stackByAttribute: any,
        dv: DataViewFacade,
        clusterTitle?: string,
    ): ICreateColorAssignmentReturnValue {
        const isClustering = dv?.dataView?.clusteringConfig?.numberOfClusters > 0;
        const isClusteringError = isClustering && dv?.dataView?.clusteringResult?.clusters?.length === 0;
        const isClusteringLoaded = isClustering && !!dv?.dataView?.clusteringResult && !isClusteringError;

        let colorAssignment: IColorAssignment[];
        if (isClustering && isClusteringLoaded) {
            const uniqueClusters = uniq(dv.dataView.clusteringResult.clusters).sort();
            colorAssignment = uniqueClusters.map(
                (clusterIndex, currentColorPaletteIndex): IColorAssignment => {
                    const clusterHeaderItem: IColorDescriptor = {
                        colorHeaderItem: {
                            id: `${clusterIndex}`,
                            name: `${clusterTitle} ${clusterIndex}`,
                        },
                    };

                    const mappedColor = getColorFromMapping(clusterHeaderItem, colorMapping, dv);

                    const color: IColor =
                        mappedColor && isValidMappedColor(mappedColor, colorPalette)
                            ? mappedColor
                            : {
                                  type: "guid",
                                  value: colorPalette[currentColorPaletteIndex % colorPalette.length].guid,
                              };

                    return {
                        color,
                        headerItem: clusterHeaderItem,
                    };
                },
            );
        } else if (stackByAttribute) {
            colorAssignment = getAttributeColorAssignment(stackByAttribute, colorPalette, colorMapping, dv);
        } else {
            const result = super.createColorAssignment(
                colorPalette,
                colorMapping,
                viewByAttribute,
                stackByAttribute,
                dv,
            );
            colorAssignment = result.outputColorAssignment.slice(0, 1);
        }

        return {
            fullColorAssignment: colorAssignment,
            outputColorAssignment: colorAssignment,
        };
    }
}
