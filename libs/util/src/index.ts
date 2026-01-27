// (C) 2019-2026 GoodData Corporation

/* eslint-disable no-barrel-files/no-barrel-files */

/**
 * This package contains utility functions used in production or test code of multiple different GoodData.UI packages.
 *
 * @remarks
 * The functions exported from here are not part of the GoodData.UI public API.
 *
 * @packageDocumentation
 */

export { shiftArrayRight } from "./arrayUtils.js";
export { shallowEqualObjects } from "./objectUtils.js";
export {
    type IShortenTextOptions,
    hashCodeString,
    randomString,
    shortenText,
    escapeRegExp,
    simplifyText,
    parseStringToArray,
} from "./stringUtils.js";
export { removeMetadata, sanitizeLocaleForMoment } from "./translationUtils.js";
export { type GuardType, type EmptyObject, combineGuards } from "./typesUtils.js";
export {
    type MatcherFunction,
    type ConsoleFunction,
    type Matcher,
    type SpecificMatcherFunction,
    type ConsoleType,
    delay,
    suppressConsole,
} from "./testUtils.js";
