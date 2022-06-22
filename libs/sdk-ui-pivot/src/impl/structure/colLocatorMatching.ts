// (C) 2021-2022 GoodData Corporation
import isNil from "lodash/isNil";
import {
    DataCol,
    ScopeCol,
    SeriesCol,
    isScopeCol,
    isSeriesCol,
    isRootCol,
    LeafDataCol,
} from "./tableDescriptorTypes";
import {
    ColumnLocator,
    IAttributeColumnLocator,
    isAttributeColumnLocator,
    isMeasureColumnLocator,
} from "../../columnWidths";
import invariant from "ts-invariant";
import { colMeasureLocalId } from "./colAccessors";

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
                return (
                    isAttributeColumnLocator(locator) &&
                    locator.attributeLocatorItem.attributeIdentifier === groupByAttributeLocalId
                );
            });

            if (!matchingLocator) {
                // if there is no matching attribute locator yet code is on scope col, then it
                // means there are less attributes in the table than there are attribute locators. the
                // table has changed yet some sort items hang around. bail out immediately with no match.
                return undefined;
            }

            const elementToMatch = (matchingLocator as IAttributeColumnLocator).attributeLocatorItem.element;
            // while the attribute locator has element optional (for wildcard match), all the remaining code always populates
            // the attribute element.
            // TODO: revise the API, it may be that it really should not be optional in the interface.
            invariant(!isNil(elementToMatch));

            if (col.header.attributeHeaderItem.uri === elementToMatch) {
                if (locators.length === 1) {
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
