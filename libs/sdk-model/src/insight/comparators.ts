// (C) 2021 GoodData Corporation

import {
    IInsight,
    insightCreated,
    insightCreatedBy,
    insightTitle,
    insightUpdated,
    insightUpdatedBy,
} from "./index";
import { stringComparatorFactory } from "../base/comparators";

/**
 * @alpha
 */
export const insightTitleComparator = stringComparatorFactory(insightTitle);

/**
 * @alpha
 */
export const insightCreatedByComparator = stringComparatorFactory<IInsight>(
    (i) => insightCreatedBy(i)?.fullName,
);

/**
 * @alpha
 */
export const insightUpdatedByComparator = stringComparatorFactory<IInsight>(
    (i) => insightUpdatedBy(i)?.fullName,
);

/**
 * @alpha
 */
export const insightCreatedComparator = stringComparatorFactory(insightCreated);

/**
 * @alpha
 */
export const insightUpdatedComparator = stringComparatorFactory(insightUpdated);
