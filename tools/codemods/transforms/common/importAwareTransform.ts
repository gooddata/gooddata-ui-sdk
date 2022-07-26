// (C) 2022 GoodData Corporation
import { API as CodeShiftApi, ASTPath, ImportSpecifier } from "jscodeshift";
import filter from "lodash/fp/filter";
import flow from "lodash/flow";
import fromPairs from "lodash/fromPairs";
import toPairs from "lodash/toPairs";

const importedName = (path: ASTPath<ImportSpecifier>): string => path.value.imported.name;

/**
 * Transform factory that handles imports and runs additional transform for items that are actually imported in the given file.
 *
 * @param api - the jscodeshift API to use for the transformations
 * @param pkg - name of the package to transform: this is to prevent touching imports from other packages with supported names
 * @param spec - specification of the renames in the shape of \{ oldName: newName \}
 * @param ifImportedTransform - additional transformation that should be performed only for imported items
 */
export const importAwareTransform =
    (
        api: CodeShiftApi,
        pkg: string,
        spec: Record<string, string>,
        ifImportedTransform: (api: CodeShiftApi, spec: Record<string, string>) => (source: string) => string,
    ) =>
    (source: string): string => {
        const { j } = api;

        const supportedNames = new Set(Object.keys(spec));

        const importedNames = new Set<string>();
        const importsWithAliases = new Set<string>();

        const withImportHandled = j(source)
            .find(j.ImportSpecifier)
            .filter((path) => {
                const isFromCorrectPackage = path.parent.node.source.value === pkg;
                const isSupportedName = supportedNames.has(importedName(path));
                return isFromCorrectPackage && isSupportedName;
            })
            .forEach((path) => {
                // detect which supported names are actually used and which have import aliases
                importedNames.add(importedName(path));
                if (path.value.local?.name !== importedName(path)) {
                    importsWithAliases.add(importedName(path));
                }
            })
            .replaceWith((path) =>
                j.importSpecifier(
                    { type: "Identifier", name: spec[importedName(path)] },
                    /**
                     * Only pass the local part if the given import has an alias in order to actually rename
                     * imports without aliases. If we always passed the local part, imports like this
                     *
                     * ```
                     * import { A } from "pkg"
                     * ```
                     *
                     * would get transformed to
                     *
                     * ```
                     * import { B: A } from "pkg"
                     * ```
                     * which is valid, but we also want to rename the uses to keep the naming consistent.
                     */
                    importsWithAliases.has(importedName(path)) ? path.value.local : null,
                ),
            )
            .toSource();

        /**
         * Filter out the spec to only include actually used items that do NOT have alias.
         * Items with alias do not need their uses updated: they use the alias which we do not touch.
         * Items that are not used must be filtered out too, otherwise items imported from non-GoodData
         * packages that happen to have the same name would get replaced as well.
         */
        return ifImportedTransform(
            api,
            flow(
                toPairs,
                filter(([key]) => !importsWithAliases.has(key) && importedNames.has(key)),
                fromPairs,
            )(spec),
        )(withImportHandled);
    };
