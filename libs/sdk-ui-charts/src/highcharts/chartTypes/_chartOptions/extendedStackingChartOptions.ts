// (C) 2007-2022 GoodData Corporation
import { IUnwrappedAttributeHeadersWithItems } from "../../typings/mess";
import { IResultAttributeHeader } from "@gooddata/sdk-model";

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
            const uri = parentAttr?.attributeHeaderItem?.uri ?? "";
            const name = parentAttr?.attributeHeaderItem?.name ?? "";
            const value = children[index]?.attributeHeaderItem?.name ?? "";

            const existingEntry = result[uri];
            const childCategories = existingEntry?.categories ?? [];

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
