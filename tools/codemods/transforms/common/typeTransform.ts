// (C) 2022 GoodData Corporation
import { API as CodeShiftApi } from "jscodeshift";
import { identifierTransform } from "./identifierTransform";
import { importAwareTransform } from "./importAwareTransform";

/**
 * Transform that renames a type: its import and uses.
 *
 * @param api - the jscodeshift API to use for the transformations
 * @param pkg - name of the package to transform: this is to prevent touching imports from other packages with supported names
 * @param spec - specification of the renames in the shape of \{ oldName: newName \}
 */
export const typeTransform = (
    api: CodeShiftApi,
    pkg: string,
    spec: Record<string, string>,
): ((source: string) => string) => importAwareTransform(api, pkg, spec, identifierTransform);
