// (C) 2022 GoodData Corporation
import { API as CodeShiftApi, Identifier } from "jscodeshift";

/**
 * Transform that renames object property names.
 *
 * @param api - the jscodeshift API to use for the transformations
 * @param spec - specification of the renames in the shape of \{ oldName: newName \}
 */
export const objectPropertyTransform =
    (api: CodeShiftApi, spec: Record<string, string>) =>
    (source: string): string => {
        const { j } = api;
        const supportedNames = new Set(Object.keys(spec));

        return j(source)
            .find(j.ObjectProperty)
            .filter((path) => path.value.key.type === "Identifier" && supportedNames.has(path.value.key.name))
            .replaceWith((path) =>
                j.objectProperty(
                    { type: "Identifier", name: spec[(path.value.key as Identifier).name] },
                    path.value.value,
                ),
            )
            .toSource();
    };
