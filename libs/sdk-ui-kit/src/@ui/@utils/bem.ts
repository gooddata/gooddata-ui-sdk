// (C) 2024 GoodData Corporation
import cx from "classnames";

/**
 * Properties for BEM modifiers.
 *
 * @internal
 */
export type StyleProps = Record<string, string | boolean>;

/**
 * Converts block or element and its property name and value into a BEM modifier class name.
 *
 * @internal
 */
function bemModifier(blockOrElement: string, propName: string, value: string | boolean) {
    if (typeof value === "string") {
        return `${blockOrElement}--${propName}-${value}`;
    }

    return value ? `${blockOrElement}--${propName}` : "";
}

/**
 * Converts block or element and its properties into a list of BEM class names.
 *
 * @internal
 */
function bemModifiers(blockOrElement: string, props: StyleProps) {
    return Object.entries(props).map(([propName, value]) => bemModifier(blockOrElement, propName, value));
}

/**
 * Converts block or element and its properties into a BEM class names string.
 *
 * @internal
 */
function bemClassNames(blockOrElement: string, props: StyleProps) {
    const modifiers = bemModifiers(blockOrElement, props);
    return cx(blockOrElement, ...modifiers);
}

/**
 * Converts block and element into a BEM element class name.
 *
 * @internal
 */
function bemElementClassName(block: string, element: string) {
    return `${block}__${element}`;
}

/**
 * Utility function for creating BEM class names.
 *
 * - b(props) - creates a class names for BEM block
 * - e(element, props) - creates a class name for BEM element
 *
 * Example usage:
 *
 * const \{ b, e \} = bem("gd-ui-button");
 *
 * b(\{ size: "large" \}) === "gd-ui-button gd-ui-button--size-large"
 *
 * b(\{ isSelected: true \}) === "gd-ui-button gd-ui-button--isSelected"
 *
 * e("icon", \{ size: "large" \}) === "gd-ui-button__icon gd-ui-button__icon--size-large"
 *
 * e("icon", \{ isDisabled: true \}) === "gd-ui-button__icon gd-ui-button__icon--isDisabled"
 *
 * @internal
 */
export function bemFactory<TPrefix extends string>(block: `${TPrefix}-${string}`) {
    return {
        /**
         * Creates a class names for BEM block.
         *
         * Example usage:
         *
         * const \{ b, e \} = bem("gd-ui-button");
         *
         * b(\{ size: "large" \}) === "gd-ui-button gd-ui-button--size-large"
         *
         * b(\{ isSelected: true \}) === "gd-ui-button gd-ui-button--isSelected"
         */
        b: (props: StyleProps = {}) => bemClassNames(block, props),

        /**
         * Creates a class name for BEM element.
         *
         * Example usage:
         *
         * const \{ b, e \} = bem("gd-ui-button");
         *
         * e("icon", \{ size: "large" \}) === "gd-ui-button__icon gd-ui-button__icon--size-large"
         *
         * e("icon", \{ isDisabled: true \}) === "gd-ui-button__icon gd-ui-button__icon--isDisabled"
         */
        e: (element: string, props: StyleProps = {}) => {
            const elementClassName = bemElementClassName(block, element);
            return bemClassNames(elementClassName, props);
        },
    };
}

/**
 * Utility function for creating BEM class names in \@gooddata/sdk-ui-kit.
 * If you need to use BEM in other libraries, see this function implementation.
 *
 * - b(props) - creates a class names for BEM block
 * - e(element, props) - creates a class name for BEM element
 *
 * Example usage:
 *
 * const \{ b, e \} = bem("gd-ui-button");
 *
 * b(\{ size: "large" \}) === "gd-ui-button gd-ui-button--size-large"
 *
 * b(\{ isSelected: true \}) === "gd-ui-button gd-ui-button--isSelected"
 *
 * e("icon", \{ size: "large" \}) === "gd-ui-button__icon gd-ui-button__icon--size-large"
 *
 * e("icon", \{ isDisabled: true \}) === "gd-ui-button__icon gd-ui-button__icon--isDisabled"
 *
 * @internal
 */
export const bem = (block: `gd-ui-kit-${string}`) => bemFactory<"gd-ui-kit">(block);
