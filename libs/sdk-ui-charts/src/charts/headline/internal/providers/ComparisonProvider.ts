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
import { CalculationType, IComparison } from "../../../../interfaces/index.js";

const ARITHMETIC_BUCKET_IDENTIFIER = "comparison_virtual_arithmetic_bucket";

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
        ): IMeasure<IArithmeticMeasureDefinition> => {
            return newVirtualArithmeticMeasure([primaryMeasure, secondaryMeasure], operator);
        };

        switch (this.comparison.calculationType) {
            case CalculationType.DIFFERENCE:
                return [createVirtualArithmeticMeasure("difference")];

            case CalculationType.RATIO:
                return [createVirtualArithmeticMeasure("ratio")];

            case CalculationType.CHANGE:
                return [createVirtualArithmeticMeasure("change")];

            default:
                if (isPoPMeasure(secondaryMeasure) || isPreviousPeriodMeasure(secondaryMeasure)) {
                    return [createVirtualArithmeticMeasure("change")];
                }

                return [createVirtualArithmeticMeasure("ratio")];
        }
    }
}

export default ComparisonProvider;
