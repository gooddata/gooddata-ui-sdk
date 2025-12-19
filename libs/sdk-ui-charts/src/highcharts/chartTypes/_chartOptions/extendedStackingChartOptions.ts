// (C) 2007-2025 GoodData Corporation

import { type IResultAttributeHeader } from "@gooddata/sdk-model";
import { getMappingHeaderFormattedName } from "@gooddata/sdk-ui";
import { valueWithEmptyHandling } from "@gooddata/sdk-ui-vis-commons";

import { type IUnwrappedAttributeHeadersWithItems } from "../../typings/mess.js";

type NameAndCategories = {
    name: string;
    categories: string[];
};

/**
 * Transform
 *      viewByParentAttribute: [P1, P1, P2, P2, P3],
 *      viewByAttribute: [C1, C2, C1, C2, C2]
 * to
 * ```
 *     [{
 *         name: P1,
 *         categories: [C1, C2]
 *      }, {
 *         name: P2,
 *         categories: [C1, C2]
 *      }, {
 *         name: P3,
 *         categories: [C2]
 *      }]
 * ```
 */
export function getCategoriesForTwoAttributes(
    viewByAttribute: IUnwrappedAttributeHeadersWithItems | undefined | null,
    viewByParentAttribute: IUnwrappedAttributeHeadersWithItems | undefined | null,
    emptyHeaderTitle: string,
): NameAndCategories[] {
    const keys: string[] = [];
    const children = viewByAttribute?.items ?? [];
    const parent = viewByParentAttribute?.items ?? [];

    const combinedResult = parent.reduce(
        (result: Record<string, NameAndCategories>, parentAttr: IResultAttributeHeader, index: number) => {
            const uri = parentAttr?.attributeHeaderItem?.uri ?? "";
            const name = valueWithEmptyHandling(getMappingHeaderFormattedName(parentAttr), emptyHeaderTitle);
            const value = valueWithEmptyHandling(
                getMappingHeaderFormattedName(children[index]),
                emptyHeaderTitle,
            );

            const existingEntry = result[uri];
            const childCategories = existingEntry?.categories ?? [];

            if (!childCategories.length) {
                keys.push(uri);
            }

            result[uri] = {
                name,
                categories: [...childCategories, value], // append value
            };

            return result;
        },
        {},
    );

    return keys.map((key: string) => {
        const { name, categories } = combinedResult[key];

        return {
            name,
            categories,
        };
    });
}
