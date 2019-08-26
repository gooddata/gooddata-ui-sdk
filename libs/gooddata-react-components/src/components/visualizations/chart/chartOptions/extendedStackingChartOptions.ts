// (C) 2007-2019 GoodData Corporation
import get = require("lodash/get");
import { Execution } from "@gooddata/typings";
import { IUnwrappedAttributeHeadersWithItems } from "../chartOptionsBuilder";

/**
 * Transform
 *      viewByParentAttribute: [P1, P1, P2, P2, P3],
 *      viewByAttribute: [C1, C2, C1, C2, C2]
 * to
 *      [{
 *          name: P1,
 *          categories: [C1, C2]
 *       }, {
 *          name: P2,
 *          categories: [C1, C2]
 *       }, {
 *          name: P3,
 *          categories: [C2]
 *       }]
 * @param viewByTwoAttributes
 */
export function getCategoriesForTwoAttributes(
    viewByAttribute: IUnwrappedAttributeHeadersWithItems,
    viewByParentAttribute: IUnwrappedAttributeHeadersWithItems,
): Array<{
    name: string;
    categories: string[];
}> {
    const keys: string[] = [];
    const { items: children } = viewByAttribute;
    const { items: parent } = viewByParentAttribute;

    const combinedResult = parent.reduce(
        (
            result: { [property: string]: string[] },
            parentAttr: Execution.IResultAttributeHeaderItem,
            index: number,
        ) => {
            const uri: string = get(parentAttr, "attributeHeaderItem.uri", "");
            const name: string = get(parentAttr, "attributeHeaderItem.name", "");
            const value: string = get(children[index], "attributeHeaderItem.name", "");

            const childCategories: string[] = get(result, `${uri}.categories`, []);

            if (!childCategories.length) {
                keys.push(uri);
            }

            return {
                ...result,
                [uri]: {
                    name,
                    categories: [...childCategories, value], // append value
                },
            };
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
