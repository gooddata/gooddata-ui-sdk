// (C) 2019 GoodData Corporation
import React, { createContext, useCallback, useContext, useState } from "react";
import { IAttribute } from "@gooddata/sdk-model";
import noop from "lodash/noop";
import flatMap from "lodash/flatMap";
import { UnexpectedSdkError } from "../../errors/GoodDataSdkError";
import isArray from "lodash/isArray";
import {
    UndefinedPlaceholderHandling,
    IAttributePlaceholder,
    IAttributeGroupPlaceholder,
    isAttributePlaceholder,
    isAttributeGroupPlaceholder,
} from "./interfaces";

/**
 * @internal
 */
export interface IAttributesContextState {
    undefinedPlaceholderHandling: UndefinedPlaceholderHandling;
    attributePlaceholders: Record<string, IAttributePlaceholder>;
    attributeGroupPlaceholders: Record<string, IAttributeGroupPlaceholder>;
    setAttributePlaceholders: React.Dispatch<React.SetStateAction<Record<string, IAttributePlaceholder>>>;
    setAttributeGroupPlaceholders: React.Dispatch<
        React.SetStateAction<Record<string, IAttributeGroupPlaceholder>>
    >;
}

/**
 * @internal
 */
const AttributesContext = createContext<IAttributesContextState>({
    undefinedPlaceholderHandling: "none",
    attributePlaceholders: {},
    attributeGroupPlaceholders: {},
    setAttributePlaceholders: noop,
    setAttributeGroupPlaceholders: noop,
});
AttributesContext.displayName = "AttributesContext";

/**
 * @public
 */
export interface IAttributesProviderProps {
    undefinedPlaceholderHandling?: UndefinedPlaceholderHandling;
}

/**
 * @internal
 */
function resolveAttributePlaceholderValue(
    placeholder: IAttributePlaceholder,
    currentPlaceholders: Record<string, IAttributePlaceholder>,
    undefinedHandling: UndefinedPlaceholderHandling,
): IAttribute | undefined {
    const attribute = currentPlaceholders[placeholder.id]?.attribute ?? placeholder.attribute;
    if (!attribute) {
        handleUndefinedPlaceholder(placeholder.id, undefinedHandling);
    }

    return attribute;
}

/**
 * @internal
 */
function resolveAttributeGroupPlaceholderValue(
    placeholderGroup: IAttributeGroupPlaceholder,
    currentGroupPlaceholders: Record<string, IAttributeGroupPlaceholder>,
    currentPlaceholders: Record<string, IAttributePlaceholder>,
    undefinedHandling: UndefinedPlaceholderHandling,
): IAttribute[] {
    const attributes =
        currentGroupPlaceholders[placeholderGroup.id]?.attributes ?? placeholderGroup.attributes;
    return flatMap(attributes, (a) => {
        if (isAttributePlaceholder(a)) {
            const attribute = resolveAttributePlaceholderValue(a, currentPlaceholders, undefinedHandling);
            return attribute ?? [];
        }

        return a;
    });
}

/**
 *
 * @public
 */
export const AttributesProvider: React.FC<IAttributesProviderProps> = (props) => {
    const { undefinedPlaceholderHandling = "none", children } = props;
    const [{ attributePlaceholders, attributeGroupPlaceholders }, setAttributesContext] = useState<
        Omit<
            IAttributesContextState,
            | "setAttributesContext"
            | "setAttributePlaceholders"
            | "setAttributeGroupPlaceholders"
            | "undefinedPlaceholderHandling"
        >
    >({
        attributePlaceholders: {},
        attributeGroupPlaceholders: {},
    });

    const setAttributePlaceholders = useCallback(
        (
            valueOrUpdateCallback:
                | Record<string, IAttributePlaceholder>
                | ((
                      placeholders: Record<string, IAttributePlaceholder>,
                  ) => Record<string, IAttributePlaceholder>),
        ) => {
            setAttributesContext((context) => {
                const updatedPlaceholders =
                    typeof valueOrUpdateCallback === "function"
                        ? valueOrUpdateCallback(context.attributePlaceholders)
                        : valueOrUpdateCallback;

                return {
                    ...context,
                    attributePlaceholders: updatedPlaceholders,
                };
            });
        },
        [],
    );

    const setAttributeGroupPlaceholders = useCallback(
        (
            valueOrUpdateCallback:
                | Record<string, IAttributeGroupPlaceholder>
                | ((
                      placeholders: Record<string, IAttributeGroupPlaceholder>,
                  ) => Record<string, IAttributeGroupPlaceholder>),
        ) => {
            setAttributesContext((context) => {
                const updatedGroupPlaceholders =
                    typeof valueOrUpdateCallback === "function"
                        ? valueOrUpdateCallback(context.attributeGroupPlaceholders)
                        : valueOrUpdateCallback;

                return {
                    ...context,
                    attributeGroupPlaceholders: updatedGroupPlaceholders,
                };
            });
        },
        [],
    );

    return (
        <AttributesContext.Provider
            value={{
                attributePlaceholders,
                setAttributePlaceholders,
                attributeGroupPlaceholders,
                setAttributeGroupPlaceholders,
                undefinedPlaceholderHandling,
            }}
        >
            {children}
        </AttributesContext.Provider>
    );
};

/**
 * @internal
 */
function handleUndefinedPlaceholder(
    placeholderId: string,
    undefinedPlaceholderHandling: UndefinedPlaceholderHandling,
) {
    if (undefinedPlaceholderHandling !== "none") {
        const message = `Trying to obtain undefined placeholder: ${placeholderId}`;
        if (undefinedPlaceholderHandling === "error") {
            throw new UnexpectedSdkError(message);
        } else if (undefinedPlaceholderHandling === "warning") {
            console.warn(message);
        }
    }
}

/**
 * @public
 */
export function useResolveAttributePlaceholders(values: undefined): undefined;
/**
 * @public
 */
export function useResolveAttributePlaceholders(values: IAttribute): IAttribute;
/**
 * @public
 */
export function useResolveAttributePlaceholders(values: IAttributePlaceholder): IAttribute | undefined;
/**
 * @public
 */
export function useResolveAttributePlaceholders(
    values: IAttribute | IAttributePlaceholder,
): IAttribute | undefined;
/**
 * @public
 */
export function useResolveAttributePlaceholders(values: IAttributeGroupPlaceholder): Array<IAttribute>;
/**
 * @public
 */
export function useResolveAttributePlaceholders(
    values:
        | IAttributeGroupPlaceholder
        | Array<IAttribute | IAttributePlaceholder | IAttributeGroupPlaceholder>,
): Array<IAttribute>;
/**
 * @public
 */
export function useResolveAttributePlaceholders(
    values: Array<IAttribute | IAttributePlaceholder | IAttributeGroupPlaceholder>,
): Array<IAttribute>;
/**
 * @public
 */
export function useResolveAttributePlaceholders(
    values:
        | undefined
        | IAttribute
        | IAttributePlaceholder
        | IAttributeGroupPlaceholder
        | Array<IAttribute | IAttributePlaceholder | IAttributeGroupPlaceholder>,
): Array<IAttribute> | IAttribute | undefined;
/**
 * @public
 */
export function useResolveAttributePlaceholders(
    values:
        | undefined
        | IAttribute
        | IAttributePlaceholder
        | IAttributeGroupPlaceholder
        | Array<IAttribute | IAttributePlaceholder | IAttributeGroupPlaceholder>,
): Array<IAttribute> | IAttribute | undefined {
    const { attributePlaceholders, attributeGroupPlaceholders, undefinedPlaceholderHandling } = useContext(
        AttributesContext,
    );

    if (isArray(values)) {
        return flatMap(values, (v) => {
            if (isAttributePlaceholder(v)) {
                const attribute = resolveAttributePlaceholderValue(
                    v,
                    attributePlaceholders,
                    undefinedPlaceholderHandling,
                );
                return attribute ?? [];
            } else if (isAttributeGroupPlaceholder(v)) {
                const attributes = resolveAttributeGroupPlaceholderValue(
                    v,
                    attributeGroupPlaceholders,
                    attributePlaceholders,
                    undefinedPlaceholderHandling,
                );
                return attributes;
            }
            return v ?? [];
        });
    } else if (isAttributePlaceholder(values)) {
        const attribute = resolveAttributePlaceholderValue(
            values,
            attributePlaceholders,
            undefinedPlaceholderHandling,
        );
        return attribute;
    } else if (isAttributeGroupPlaceholder(values)) {
        const attributes = resolveAttributeGroupPlaceholderValue(
            values,
            attributeGroupPlaceholders,
            attributePlaceholders,
            undefinedPlaceholderHandling,
        );
        return attributes;
    }

    return values;
}

/**
 * @public
 */
export function useAttributePlaceholder(
    placeholder: IAttributePlaceholder,
): [
    attribute: IAttribute | undefined,
    setAttributePlaceholder: (
        valueOrUpdateCallback:
            | IAttribute
            | ((attrOrMeasure: IAttribute | undefined) => IAttribute | undefined)
            | undefined,
    ) => void,
] {
    const { attributePlaceholders, setAttributePlaceholders, undefinedPlaceholderHandling } = useContext(
        AttributesContext,
    );
    const attribute = resolveAttributePlaceholderValue(
        placeholder,
        attributePlaceholders,
        undefinedPlaceholderHandling,
    );

    const setAttributePlaceholder = useCallback(
        (
            valueOrUpdateCallback:
                | IAttribute
                | ((attrOrMeasure: IAttribute | undefined) => IAttribute | undefined)
                | undefined,
        ) => {
            setAttributePlaceholders((placeholders) => {
                const attribute = resolveAttributePlaceholderValue(
                    placeholder,
                    placeholders,
                    undefinedPlaceholderHandling,
                );
                const updatedAttribute =
                    typeof valueOrUpdateCallback === "function"
                        ? valueOrUpdateCallback(attribute)
                        : valueOrUpdateCallback;

                if (!updatedAttribute) {
                    handleUndefinedPlaceholder(placeholder.id, undefinedPlaceholderHandling);
                }

                return {
                    ...placeholders,
                    [placeholder.id]: {
                        ...placeholder,
                        attribute: updatedAttribute,
                    },
                };
            });
        },
        [],
    );

    return [attribute, setAttributePlaceholder];
}

/**
 * @public
 */
export function useAttributeGroupPlaceholder(
    groupPlaceholder: IAttributeGroupPlaceholder,
): [
    attributes: IAttribute[],
    setAttributePlaceholderGroup: (
        valueOrUpdateCallback:
            | Array<IAttribute | IAttributePlaceholder>
            | ((
                  attributes: Array<IAttribute | IAttributePlaceholder>,
              ) => Array<IAttribute | IAttributePlaceholder>),
    ) => void,
] {
    const {
        attributeGroupPlaceholders,
        setAttributeGroupPlaceholders,
        attributePlaceholders,
        undefinedPlaceholderHandling,
    } = useContext(AttributesContext);

    const attributes = resolveAttributeGroupPlaceholderValue(
        groupPlaceholder,
        attributeGroupPlaceholders,
        attributePlaceholders,
        undefinedPlaceholderHandling,
    );

    const setAttributePlaceholderGroup = useCallback(
        (
            valueOrUpdateCallback:
                | Array<IAttribute | IAttributePlaceholder>
                | ((
                      attributes: Array<IAttribute | IAttributePlaceholder>,
                  ) => Array<IAttribute | IAttributePlaceholder>),
        ) => {
            setAttributeGroupPlaceholders((placeholderGroups) => {
                const attributes =
                    placeholderGroups[groupPlaceholder.id]?.attributes ?? groupPlaceholder.attributes;
                const updatedAttributes =
                    typeof valueOrUpdateCallback === "function"
                        ? valueOrUpdateCallback(attributes)
                        : valueOrUpdateCallback;

                return {
                    ...placeholderGroups,
                    [groupPlaceholder.id]: {
                        ...groupPlaceholder,
                        attributes: updatedAttributes,
                    },
                };
            });
        },
        [],
    );

    return [attributes, setAttributePlaceholderGroup];
}
