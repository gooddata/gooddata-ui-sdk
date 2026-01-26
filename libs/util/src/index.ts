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

import * as arrayUtils from "./arrayUtils.js";
import * as objectUtils from "./objectUtils.js";
import * as stringUtils from "./stringUtils.js";
import * as translationUtils from "./translationUtils.js";
import * as typesUtils from "./typesUtils.js";

export {
    type MatcherFunction,
    type ConsoleFunction,
    type Matcher,
    type SpecificMatcherFunction,
    type ConsoleType,
    delay,
    suppressConsole,
} from "./testUtils.js";
export { stringUtils, translationUtils, arrayUtils, objectUtils, typesUtils };
export type { EmptyObject } from "./typesUtils.js";
