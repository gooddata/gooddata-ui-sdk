// (C) 2022 GoodData Corporation
import { API as CodeShiftApi } from "jscodeshift";

/**
 * Transform that renames identifiers.
 *
 * @param api - the jscodeshift API to use for the transformations
 * @param spec - specification of the renames in the shape of \{ oldName: newName \}
 */
export const identifierTransform =
    (api: CodeShiftApi, spec: Record<string, string>) =>
    (source: string): string => {
        const { j } = api;
        const supportedNames = new Set(Object.keys(spec));

        return j(source)
            .find(j.Identifier)
            .filter((path) => supportedNames.has(path.value.name))
            .replaceWith((path) => j.identifier(spec[path.value.name]))
            .toSource();
    };
