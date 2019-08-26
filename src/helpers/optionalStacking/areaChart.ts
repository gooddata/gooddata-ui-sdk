// (C) 2007-2018 GoodData Corporation
import isNil = require("lodash/isNil");
import { VisualizationObject } from "@gooddata/typings";
import { IAreaChartProps } from "../../components/AreaChart";
import { IChartConfig } from "../..";
import BucketItem = VisualizationObject.BucketItem;
import IVisualizationAttribute = VisualizationObject.IVisualizationAttribute;
import { getViewByTwoAttributes } from "./common";

function getStackConfiguration(config: IChartConfig = {}): IChartConfig {
    const { stackMeasures, stackMeasuresToPercent } = config;
    if (isNil(stackMeasures) && isNil(stackMeasuresToPercent)) {
        return config;
    }
    return {
        ...config,
        stacking: Boolean(stackMeasuresToPercent) || Boolean(stackMeasures),
    };
}

export function getBucketsProps(
    props: IAreaChartProps,
): {
    measures: BucketItem[];
    viewBy: IVisualizationAttribute[];
    stackBy: IVisualizationAttribute[];
} {
    const { measures, stackBy } = props;
    const viewBy = getViewByTwoAttributes(props.viewBy);

    if (viewBy.length <= 1) {
        return {
            measures: measures || [],
            viewBy,
            stackBy: stackBy ? [stackBy] : [],
        };
    }

    // for case viewBy 2 attributes
    const [firstMeasure] = measures; // only take first measure
    const [firstAttribute, secondAttribute] = viewBy; // only take first two attributes

    return {
        measures: [firstMeasure],
        viewBy: [firstAttribute], // one attribute for viewBy which slices measure vertically
        stackBy: [secondAttribute], // one attribute for stackBy which slices measure horizontally
    };
}

export function getConfigProps(props: IAreaChartProps): IChartConfig {
    const viewBy = getViewByTwoAttributes(props.viewBy);
    if (viewBy.length <= 1) {
        return getStackConfiguration(props.config);
    }

    return {
        stacking: false, // area sections are always overlapped with two attributes
        stackMeasures: false,
        stackMeasuresToPercent: false,
    };
}

/**
 * Show warning to SDK user in console log
 * @param props
 */
export function verifyBuckets(props: IAreaChartProps): void {
    const viewBy = getViewByTwoAttributes(props.viewBy);
    if (viewBy.length <= 1) {
        return;
    }

    const { measures = [], stackBy } = props;
    if (measures.length > 1 || stackBy) {
        // tslint:disable-next-line:no-console max-line-length
        console.warn(
            "When there are two attributes in viewBy, only first measure is taken and attribute in stackBy is ignored",
        );
    }
}
