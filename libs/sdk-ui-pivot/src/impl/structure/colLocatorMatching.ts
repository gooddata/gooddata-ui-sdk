// (C) 2021 GoodData Corporation
import {
    DataCol,
    DataColGroup,
    DataColLeaf,
    isDataColGroup,
    isDataColLeaf,
    isDataColRootGroup,
} from "./tableDescriptorTypes";
import {
    ColumnLocator,
    IAttributeColumnLocator,
    isAttributeColumnLocator,
    isMeasureColumnLocator,
} from "../../columnWidths";
import invariant from "ts-invariant";

export function searchForLocatorMatch(
    cols: DataCol[],
    locators: ColumnLocator[],
): DataColLeaf | DataColGroup | undefined {
    let found: DataColLeaf | DataColGroup | undefined = undefined;

    for (const col of cols) {
        if (isDataColRootGroup(col)) {
            // root group is there for better presentation. can be safely skipped during search.
            found = searchForLocatorMatch(col.children, locators);
        } else if (isDataColGroup(col)) {
            /*
             * Find attribute locator which matches current col group's attribute - to compare apples with apples.
             *
             * Once code has that, it can compare the URI of attribute element for which this group was created with
             * the excepted attribute element in the locator.
             */
            const groupByAttributeLocalId = col.descriptor.attributeHeader.localIdentifier;
            const matchingLocator = locators.find((locator) => {
                return (
                    isAttributeColumnLocator(locator) &&
                    locator.attributeLocatorItem.attributeIdentifier === groupByAttributeLocalId
                );
            });

            // if this blows, then there is error in the column width sanitization logic which should clean all column
            // width items that reference missing attributes or measures.
            invariant(matchingLocator);

            const elementToMatch = (matchingLocator as IAttributeColumnLocator).attributeLocatorItem.element;
            // while the attribute locator has element optional (for wildcard match), all the remaining code always populates
            // the attribute element.
            // TODO: revise the API, it may be that it really should not be optional in the interface.
            invariant(elementToMatch);

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
        } else if (isDataColLeaf(col)) {
            // code has reached the leaves. at this point there must be just one locator left and it must
            // be the measure column locator. if this bombs then locator creation or sanitization of invalid column width
            // items is hosed (or was not called).
            invariant(locators.length === 1);
            invariant(isMeasureColumnLocator(locators[0]));

            if (
                col.seriesDescriptor.measureDescriptor.measureHeaderItem.localIdentifier ===
                locators[0].measureLocatorItem.measureIdentifier
            ) {
                found = col;
            }
        }

        if (found) {
            return found;
        }
    }

    return undefined;
}
