// (C) 2007-2019 GoodData Corporation
import get = require("lodash/get");
import { IUnwrappedAttributeHeadersWithItems } from "../../utils/types";
import { IResultAttributeHeader } from "@gooddata/sdk-backend-spi";

type NameAndCategories = {
    name: string;
    categories: string[];
};

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
 */
export function getCategoriesForTwoAttributes(
    viewByAttribute: IUnwrappedAttributeHeadersWithItems,
    viewByParentAttribute: IUnwrappedAttributeHeadersWithItems,
): NameAndCategories[] {
    const keys: string[] = [];
    const { items: children } = viewByAttribute;
    const { items: parent } = viewByParentAttribute;

    const combinedResult = parent.reduce(
        (
            result: { [property: string]: NameAndCategories },
            parentAttr: IResultAttributeHeader,
            index: number,
        ) => {
            const uri: string = get(parentAttr, "attributeHeaderItem.uri", "");
            const name: string = get(parentAttr, "attributeHeaderItem.name", "");
            const value: string = get(children[index], "attributeHeaderItem.name", "");

            const existingEntry = result[uri];
            const childCategories = existingEntry && existingEntry.categories ? existingEntry.categories : [];

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
