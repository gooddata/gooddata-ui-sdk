// (C) 2019-2025 GoodData Corporation

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

export * from "./testUtils.js";
export { stringUtils, translationUtils, arrayUtils, objectUtils, typesUtils };
export type { EmptyObject } from "./typesUtils.js";
