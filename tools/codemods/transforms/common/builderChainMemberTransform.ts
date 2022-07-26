// (C) 2022 GoodData Corporation
import { API as CodeShiftApi, Identifier, MemberExpression } from "jscodeshift";

/**
 * Transform that renames builder chain members.
 *
 * @remarks
 * By builder chain members we mean things like
 *
 * ```ts
 * const modifiedSimpleMeasure = modifySimpleMeasure(measure, (m) => m.measureItem(idRef("other")));
 *                                                                     ^--THIS---^
 * ```
 *
 * @param api - the jscodeshift API to use for the transformations
 * @param spec - specification of the renames in the shape of \{ oldName: newName \}
 */
export const builderChainMemberTransform =
    (api: CodeShiftApi, spec: Record<string, string>) =>
    (source: string): string => {
        const { j } = api;
        const supportedNames = new Set(Object.keys(spec));

        return j(source)
            .find(j.CallExpression)
            .filter(
                (path) =>
                    path.value.callee.type === "MemberExpression" &&
                    path.value.callee.property.type === "Identifier" &&
                    supportedNames.has(path.value.callee.property.name),
            )
            .replaceWith((path) =>
                j.callExpression(
                    {
                        type: "MemberExpression",
                        property: {
                            type: "Identifier",
                            name: spec[((path.value.callee as MemberExpression).property as Identifier).name],
                        },
                        object: (path.value.callee as MemberExpression).object,
                    },
                    path.value.arguments,
                ),
            )
            .toSource();
    };
