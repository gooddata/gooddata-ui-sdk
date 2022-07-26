// (C) 2022 GoodData Corporation
import { API as CodeShiftApi, Transform } from "jscodeshift";
import flow from "lodash/flow";
import { builderChainMemberTransform } from "../common/builderChainMemberTransform";
import { functionTransform } from "../common/functionTransform";
import { objectPropertyTransform } from "../common/objectPropertyTransform";
import { typeTransform } from "../common/typeTransform";
import { visPropNameTransform } from "../common/visPropNameTransform";

const measureTransform = (api: CodeShiftApi) =>
    flow(
        builderChainMemberTransform(api, {
            masterMeasure: "masterMetric",
            measureItem: "metricItem",
        }),

        functionTransform(api, "@gooddata/sdk-model", {
            // factories
            newMeasure: "newMetric",
            newPreviousPeriodMeasure: "newPreviousPeriodMetric",
            newPopMeasure: "newPopMetric",
            newArithmeticMeasure: "newArithmeticMetric",
            newMeasureValueFilter: "newMetricValueFilter",
            // manipulators
            modifyMeasure: "modifyMetric",
            modifySimpleMeasure: "modifySimpleMetric",
            modifyPopMeasure: "modifyPopMetric",
            modifyPreviousPeriodMeasure: "modifyPreviousPeriodMetric",
            // getters
            measureLocalId: "metricLocalId",
            measureUri: "metricUri",
            measureIdentifier: "metricIdentifier",
            measureItem: "metricItem",
            measureDoesComputeRatio: "metricDoesComputeRatio",
            measureMasterIdentifier: "metricMasterIdentifier",
            measureArithmeticOperands: "metricArithmeticOperands",
            measureArithmeticOperator: "metricArithmeticOperator",
            measureAlias: "metricAlias",
            measureTitle: "metricTitle",
            measureFormat: "metricFormat",
            isMeasureFormatInPercent: "isMetricFormatInPercent",
            measureAggregation: "metricAggregation",
            measureFilters: "metricFilters",
            measurePopAttribute: "metricPopAttribute",
            measurePreviousPeriodDateDataSets: "metricPreviousPeriodDateDataSets",
            measureValueFilterMeasure: "metricValueFilterMetric",
            measureValueFilterCondition: "metricValueFilterCondition",
            measureValueFilterOperator: "metricValueFilterOperator",
            // typeguards
            isMeasure: "isMetric",
            isSimpleMeasure: "isSimpleMetric",
            isAdhocMeasure: "isAdhocMetric",
            isPoPMeasure: "isPoPMetric",
            isPreviousPeriodMeasure: "isPreviousPeriodMetric",
            isArithmeticMeasure: "isArithmeticMetric",
            isMeasureDefinition: "isMetricDefinition",
            isPoPMeasureDefinition: "isPoPMetricDefinition",
            isPreviousPeriodMeasureDefinition: "isPreviousPeriodMetricDefinition",
            isArithmeticMeasureDefinition: "isArithmeticMetricDefinition",
            isMeasureValueFilter: "isMetricValueFilter",
        }),

        visPropNameTransform(api, {
            measure: "metric",
            measures: "metrics",
            primaryMeasure: "primaryMetric",
            secondaryMeasure: "secondaryMetric",
            targetMeasure: "targetMetric",
            comparativeMeasure: "comparativeMetric",
            xAxisMeasure: "xAxisMetric",
            yAxisMeasure: "yAxisMetric",
        }),

        objectPropertyTransform(api, {
            stackMeasures: "stackMetrics",
            stackMeasuresToPercent: "stackMetricsToPercent",
        }),

        typeTransform(api, "@gooddata/sdk-model", {
            IMeasure: "IMetric",
            IPoPMeasureDefinition: "IPoPMetricDefinition",
            IPreviousPeriodMeasureDefinition: "IPreviousPeriodMetricDefinition",
            IArithmeticMeasureDefinition: "IArithmeticMetricDefinition",
            IMeasureDefinition: "IMetricDefinition",
            IMeasureValueFilter: "IMetricValueFilter",
            IMeasureValueFilterBody: "IMetricValueFilterBody",
            MeasureValueFilterCondition: "MetricValueFilterCondition",
        }),
    );

const MeasureToMetric: Transform = (file, api, _options): string => {
    return measureTransform(api)(file.source);
};

// the jscodeshift expects the transform to be the default export and the parser type to be exported as named export called "parser"
export default MeasureToMetric;
export const parser = "tsx";
