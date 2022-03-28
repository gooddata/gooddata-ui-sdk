// (C) 2021-2022 GoodData Corporation

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
