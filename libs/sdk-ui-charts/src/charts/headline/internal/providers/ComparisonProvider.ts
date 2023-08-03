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
    newArithmeticMeasure,
    newBucket,
} from "@gooddata/sdk-model";

import { IHeadlineTransformationProps } from "../../HeadlineProvider.js";
import AbstractProvider from "./AbstractProvider.js";
import ComparisonTransformation from "../transformations/ComparisonTransformation.js";
import { CalculationType, IComparison } from "../../../../interfaces/index.js";
import { BucketNames } from "@gooddata/sdk-ui";

const ARITHMETIC_BUCKET_IDENTIFIER = "comparison_arithmetic_bucket";

class ComparisonProvider extends AbstractProvider {
    private readonly comparison: IComparison;

    constructor(comparison: IComparison) {
        super();

        this.comparison = comparison;
    }

    public getHeadlineTransformationComponent(): React.ComponentType<IHeadlineTransformationProps> {
        return ComparisonTransformation;
    }

    protected prepareBuckets(originalBuckets: IBucket[]): IBucket[] {
        const arithmeticBucket = this.prepareArithmeticBucket(originalBuckets);
        return [...originalBuckets, arithmeticBucket];
    }

    private prepareArithmeticBucket(originalBuckets: IBucket[]): IBucket {
        const primaryBucket = bucketsFind(originalBuckets, BucketNames.MEASURES);
        const primaryMeasure = primaryBucket && bucketMeasure(primaryBucket);

        const secondaryBucket = bucketsFind(originalBuckets, BucketNames.SECONDARY_MEASURES);
        const secondaryMeasures = secondaryBucket && bucketMeasure(secondaryBucket);

        return newBucket(
            ARITHMETIC_BUCKET_IDENTIFIER,
            ...this.createArithmeticMeasures(primaryMeasure, secondaryMeasures),
        );
    }

    private createArithmeticMeasures(
        primaryMeasure: IMeasure,
        secondaryMeasure: IMeasure,
    ): IMeasure<IArithmeticMeasureDefinition>[] {
        const createArithmeticMeasure = (
            operator: ArithmeticMeasureOperator,
        ): IMeasure<IArithmeticMeasureDefinition> => {
            return newArithmeticMeasure([primaryMeasure, secondaryMeasure], operator);
        };

        switch (this.comparison.calculationType) {
            case CalculationType.DIFFERENCE:
                return [createArithmeticMeasure("difference")];

            case CalculationType.RATIO:
                return [createArithmeticMeasure("ratio")];

            case CalculationType.CHANGE:
                return [createArithmeticMeasure("change")];

            default:
                if (isPoPMeasure(secondaryMeasure) || isPreviousPeriodMeasure(secondaryMeasure)) {
                    return [createArithmeticMeasure("change")];
                }

                return [createArithmeticMeasure("ratio")];
        }
    }
}

export default ComparisonProvider;
