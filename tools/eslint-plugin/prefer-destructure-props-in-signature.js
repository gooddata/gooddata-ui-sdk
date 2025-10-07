// eslint-plugin-custom/lib/rules/prefer-destructure-props-in-signature.js
module.exports = {
    meta: {
        type: "suggestion",
        docs: {
            description:
                "Prefer destructuring React props directly in the function signature if props is only used for destructuring",
        },
        fixable: "code",
        schema: [],
        messages: {
            preferDestructure:
                "Destructure props directly in the function signature instead of inside the function body.",
        },
    },
    create(context) {
        return {
            FunctionDeclaration(node) {
                if (
                    !node.params ||
                    node.params.length !== 1 ||
                    node.params[0].type !== "Identifier"
                ) {
                    return;
                }

                const propsName = node.params[0].name;
                const variable = context.getScope().set.get(propsName);
                if (!variable) return;

                // Find how props is used
                const references = variable.references;
                if (references.length === 0) return;

                // Detect a single destructuring assignment: const { ... } = props;
                const destructurings = references.filter(ref => {
                    const parent = ref.identifier.parent;
                    return (
                        parent &&
                        parent.type === "VariableDeclarator" &&
                        parent.init &&
                        parent.init.name === propsName &&
                        parent.id.type === "ObjectPattern"
                    );
                });

                // If there's exactly one destructuring, and no other uses of props
                if (
                    destructurings.length === 1 &&
                    references.length === destructurings.length
                ) {
                    context.report({
                        node: node.params[0],
                        messageId: "preferDestructure",
                        fix(fixer) {
                            const destructuring = destructurings[0].identifier.parent;
                            const sourceCode = context.getSourceCode();

                            const destructuredText = sourceCode.getText(destructuring.id);
                            const typeText = node.params[0].typeAnnotation
                                ? sourceCode.getText(node.params[0].typeAnnotation)
                                : "";

                            return [
                                fixer.replaceText(node.params[0], `${destructuredText}${typeText}`),
                                fixer.remove(destructuring.parent),
                            ];
                        },
                    });
                }
            },
        };
    },
};
