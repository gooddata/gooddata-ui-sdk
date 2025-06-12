// (C) 2021-2022 GoodData Corporation

import {
    IInsight,
    insightCreated,
    insightCreatedBy,
    insightTitle,
    insightUpdated,
    insightUpdatedBy,
} from "./index.js";
import { stringComparatorFactory } from "../base/comparators.js";

/**
 * @beta
 */
export const insightTitleComparator = stringComparatorFactory(insightTitle);

/**
 * @beta
 */
export const insightCreatedByComparator = stringComparatorFactory<IInsight>(
    (i) => insightCreatedBy(i)?.fullName,
);

/**
 * @beta
 */
export const insightUpdatedByComparator = stringComparatorFactory<IInsight>(
    (i) => insightUpdatedBy(i)?.fullName,
);

/**
 * @beta
 */
export const insightCreatedComparator = stringComparatorFactory(insightCreated);

/**
 * @beta
 */
export const insightUpdatedComparator = stringComparatorFactory(insightUpdated);
