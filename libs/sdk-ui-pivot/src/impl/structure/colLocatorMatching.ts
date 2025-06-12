// (C) 2021-2022 GoodData Corporation
import {
    DataCol,
    ScopeCol,
    SeriesCol,
    isScopeCol,
    isSeriesCol,
    isRootCol,
    LeafDataCol,
    TransposedMeasureDataCol,
} from "./tableDescriptorTypes.js";
import {
    ColumnLocator,
    isTotalColumnLocator,
    isAttributeColumnLocator,
    isMeasureColumnLocator,
} from "../../columnWidths.js";
import { colMeasureLocalId } from "./colAccessors.js";
import isEmpty from "lodash/isEmpty.js";
import { isResultTotalHeader } from "@gooddata/sdk-model";

/**
 * Given data sheet columns, this function will traverse them in order to attempt to match the provided
 * column locators. This function works recursively, if the cols are composite (root col or scope col) then
 * after successfully matching locator, the code proceed further to search through the children.
 *
 * @param cols - columns to search
 * @param locators - column locators to match
 */
export function searchForLocatorMatch(
    cols: DataCol[],
    locators: ColumnLocator[],
): SeriesCol | ScopeCol | undefined {
    let found: LeafDataCol | undefined = undefined;

    for (const col of cols) {
        if (isRootCol(col)) {
            // root group is there for better presentation. can be safely skipped during search.
            found = searchForLocatorMatch(col.children, locators);
        } else if (isScopeCol(col)) {
            /*
             * Find attribute locator which matches current scope col's attribute - to compare apples with apples.
             *
             * Once code has that, it can compare the URI of attribute element for which this group was created with
             * the excepted attribute element in the locator.
             */
            const groupByAttributeLocalId = col.attributeDescriptor.attributeHeader.localIdentifier;
            const matchingLocator = locators.find((locator) => {
                if (isAttributeColumnLocator(locator)) {
                    return locator.attributeLocatorItem.attributeIdentifier === groupByAttributeLocalId;
                } else if (isTotalColumnLocator(locator)) {
                    return locator.totalLocatorItem.attributeIdentifier === groupByAttributeLocalId;
                }

                return undefined;
            });

            if (isEmpty(matchingLocator)) {
                // if there is no matching attribute/total locator yet code is on scope col, then it
                // means there are less attributes in the table than there are attribute locators. the
                // table has changed yet some sort items hang around. bail out immediately with no match.
                return undefined;
            }

            const matchingAttr =
                isAttributeColumnLocator(matchingLocator) &&
                matchingLocator.attributeLocatorItem.element === col.header?.attributeHeaderItem?.uri;
            const matchingTot =
                isTotalColumnLocator(matchingLocator) &&
                isResultTotalHeader(col.header) &&
                matchingLocator.totalLocatorItem.totalFunction === col.header?.totalHeaderItem?.name;

            if (matchingAttr || matchingTot) {
                // When table is transposed (metrics in rows). Need to check that existing measures descriptors on data view
                // matches the exsting ones on the resized scope column.
                if (col.measureDescriptors) {
                    const measureLocators = locators.filter(isMeasureColumnLocator);

                    if (
                        col.measureDescriptors?.length !== measureLocators.length ||
                        !isMeasureColumnLocator(measureLocators[0])
                    ) {
                        return undefined;
                    } else {
                        found = col;
                    }
                } else if (locators.length === 1) {
                    // elements match; see if all locators exhausted. if so, it means the width item does
                    // not contain any measure locator; it's OK to match the DataColGroup though, so mark it
                    // as found and bail out
                    found = col;
                } else {
                    // otherwise dive deeper to inspect the children. make sure not to send the already-matched locator.
                    const remainingLocators: ColumnLocator[] = locators.filter(
                        (locator) => locator !== matchingLocator,
                    );

                    found = searchForLocatorMatch(col.children, remainingLocators);
                }
            }
        } else if (isSeriesCol(col)) {
            if (locators.length > 1 || !isMeasureColumnLocator(locators[0])) {
                // code has reached the leaves. at this point there must be just one locator left and it must
                // be the measure column locator. if this is not the case, then there are too many locators -
                // the table has likely changed and old locators were left around. bail out immediately.

                return undefined;
            }

            if (colMeasureLocalId(col) === locators[0].measureLocatorItem.measureIdentifier) {
                found = col;
            }
        }

        if (found) {
            return found;
        }
    }

    return undefined;
}

/**
 *
 * @param cols - columns to search
 * @param locators - column locators to match
 */
export function searchForTransposedLocatorMatch(
    cols: TransposedMeasureDataCol[],
    locators: ColumnLocator[],
): TransposedMeasureDataCol | undefined {
    let found: TransposedMeasureDataCol | undefined = undefined;

    for (const col of cols) {
        if (col.seriesDescriptor?.length !== locators.length || !isMeasureColumnLocator(locators[0])) {
            return undefined;
        }

        if (colMeasureLocalId(col) === locators[0].measureLocatorItem.measureIdentifier) {
            found = col;
        }

        if (found) {
            return found;
        }
    }

    return undefined;
}
