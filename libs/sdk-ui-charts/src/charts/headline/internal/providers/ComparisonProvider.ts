// (C) 2023 GoodData Corporation
import React from "react";

import {
    ArithmeticMeasureOperator,
    bucketMeasure,
    bucketsFind,
    IArithmeticMeasureDefinition,
    IBucket,
    IMeasure,
    isPoPMeasure,
    isPreviousPeriodMeasure,
    newBucket,
    newVirtualArithmeticMeasure,
} from "@gooddata/sdk-model";
import { BucketNames } from "@gooddata/sdk-ui";

import { IHeadlineTransformationProps } from "../../HeadlineProvider.js";
import AbstractProvider from "./AbstractProvider.js";
import ComparisonTransformation from "../transformations/ComparisonTransformation.js";
import { CalculateAs, IComparison } from "../../../../interfaces/index.js";
import { COMPARISON_DEFAULT_OBJECT } from "../interfaces/BaseHeadlines.js";

const ARITHMETIC_BUCKET_IDENTIFIER = "comparison_virtual_arithmetic_bucket";

class ComparisonProvider extends AbstractProvider {
    private readonly comparison: IComparison;

    constructor(comparison: IComparison) {
        super();

        this.comparison = comparison || COMPARISON_DEFAULT_OBJECT;
    }

    public getHeadlineTransformationComponent(): React.ComponentType<IHeadlineTransformationProps> {
        return ComparisonTransformation;
    }

    protected prepareBuckets(originalBuckets: IBucket[]): IBucket[] {
        const arithmeticBucket = this.prepareVirtualArithmeticBucket(originalBuckets);
        return [...originalBuckets, arithmeticBucket];
    }

    private prepareVirtualArithmeticBucket(originalBuckets: IBucket[]): IBucket {
        const primaryBucket = bucketsFind(originalBuckets, BucketNames.MEASURES);
        const primaryMeasure = primaryBucket && bucketMeasure(primaryBucket);

        const secondaryBucket = bucketsFind(originalBuckets, BucketNames.SECONDARY_MEASURES);
        const secondaryMeasures = secondaryBucket && bucketMeasure(secondaryBucket);

        return newBucket(
            ARITHMETIC_BUCKET_IDENTIFIER,
            ...this.createVirtualArithmeticMeasures(primaryMeasure, secondaryMeasures),
        );
    }

    private createVirtualArithmeticMeasures(
        primaryMeasure: IMeasure,
        secondaryMeasure: IMeasure,
    ): IMeasure<IArithmeticMeasureDefinition>[] {
        const createVirtualArithmeticMeasure = (
            operator: ArithmeticMeasureOperator,
            shouldCombineLocalIdAndOperator?: boolean,
        ): IMeasure<IArithmeticMeasureDefinition> => {
            return newVirtualArithmeticMeasure([primaryMeasure, secondaryMeasure], operator, (builder) => {
                if (shouldCombineLocalIdAndOperator) {
                    builder.combineLocalIdWithOperator();
                }

                return builder;
            });
        };

        switch (this.comparison.calculationType) {
            case CalculateAs.DIFFERENCE:
                return [createVirtualArithmeticMeasure("difference")];

            case CalculateAs.RATIO:
                return [createVirtualArithmeticMeasure("ratio")];

            case CalculateAs.CHANGE:
                return [createVirtualArithmeticMeasure("change")];

            case CalculateAs.CHANGE_DIFFERENCE:
                return [
                    createVirtualArithmeticMeasure("change", true),
                    createVirtualArithmeticMeasure("difference", true),
                ];

            default:
                if (isPoPMeasure(secondaryMeasure) || isPreviousPeriodMeasure(secondaryMeasure)) {
                    return [createVirtualArithmeticMeasure("change")];
                }

                return [createVirtualArithmeticMeasure("ratio")];
        }
    }
}

export default ComparisonProvider;
