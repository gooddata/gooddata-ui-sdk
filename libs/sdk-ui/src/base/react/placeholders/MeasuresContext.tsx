// (C) 2019 GoodData Corporation
import React, { createContext, useCallback, useContext, useState } from "react";
import { IAttributeOrMeasure } from "@gooddata/sdk-model";
import noop from "lodash/noop";
import flatMap from "lodash/flatMap";
import { UnexpectedSdkError } from "../../errors/GoodDataSdkError";
import isArray from "lodash/isArray";
import {
    UndefinedPlaceholderHandling,
    IMeasurePlaceholder,
    IMeasureGroupPlaceholder,
    isMeasurePlaceholder,
    isMeasureGroupPlaceholder,
} from "./interfaces";

/**
 * @internal
 */
export interface IMeasuresContextState {
    undefinedPlaceholderHandling: UndefinedPlaceholderHandling;
    measurePlaceholders: Record<string, IMeasurePlaceholder>;
    measureGroupPlaceholders: Record<string, IMeasureGroupPlaceholder>;
    setMeasurePlaceholders: React.Dispatch<React.SetStateAction<Record<string, IMeasurePlaceholder>>>;
    setMeasureGroupPlaceholders: React.Dispatch<
        React.SetStateAction<Record<string, IMeasureGroupPlaceholder>>
    >;
}

/**
 * @internal
 */
const MeasuresContext = createContext<IMeasuresContextState>({
    undefinedPlaceholderHandling: "none",
    measurePlaceholders: {},
    measureGroupPlaceholders: {},
    setMeasurePlaceholders: noop,
    setMeasureGroupPlaceholders: noop,
});
MeasuresContext.displayName = "MeasuresContext";

/**
 * @public
 */
export interface IMeasuresProviderProps {
    undefinedPlaceholderHandling?: UndefinedPlaceholderHandling;
}

/**
 * @internal
 */
function resolveMeasurePlaceholderValue(
    placeholder: IMeasurePlaceholder,
    currentPlaceholders: Record<string, IMeasurePlaceholder>,
    undefinedMeasureHandling: UndefinedPlaceholderHandling,
): IAttributeOrMeasure | undefined {
    const measure = currentPlaceholders[placeholder.id]?.measure ?? placeholder.measure;
    if (!measure) {
        handleUndefinedPlaceholder(placeholder.id, undefinedMeasureHandling);
    }

    return measure;
}

/**
 * @internal
 */
function resolveMeasureGroupPlaceholderValue(
    placeholderGroup: IMeasureGroupPlaceholder,
    currentGroupPlaceholders: Record<string, IMeasureGroupPlaceholder>,
    currentPlaceholders: Record<string, IMeasurePlaceholder>,
    undefinedMeasureHandling: UndefinedPlaceholderHandling,
): Array<IAttributeOrMeasure> {
    const measures = currentGroupPlaceholders[placeholderGroup.id]?.measures ?? placeholderGroup.measures;
    return flatMap(measures, (m) => {
        if (isMeasurePlaceholder(m)) {
            const measure = resolveMeasurePlaceholderValue(m, currentPlaceholders, undefinedMeasureHandling);
            return measure ?? [];
        }

        return m;
    });
}

/**
 * @public
 */
export const MeasuresProvider: React.FC<IMeasuresProviderProps> = (props) => {
    const { undefinedPlaceholderHandling = "none", children } = props;
    const [{ measurePlaceholders, measureGroupPlaceholders }, setMeasuresContext] = useState<
        Omit<
            IMeasuresContextState,
            | "setMeasuresContext"
            | "setMeasurePlaceholders"
            | "setMeasureGroupPlaceholders"
            | "undefinedPlaceholderHandling"
        >
    >({
        measurePlaceholders: {},
        measureGroupPlaceholders: {},
    });

    const setMeasurePlaceholders = useCallback(
        (
            valueOrUpdateCallback:
                | Record<string, IMeasurePlaceholder>
                | ((
                      placeholders: Record<string, IMeasurePlaceholder>,
                  ) => Record<string, IMeasurePlaceholder>),
        ) => {
            setMeasuresContext((context) => {
                const updatedPlaceholders =
                    typeof valueOrUpdateCallback === "function"
                        ? valueOrUpdateCallback(context.measurePlaceholders)
                        : valueOrUpdateCallback;

                return {
                    ...context,
                    measurePlaceholders: updatedPlaceholders,
                };
            });
        },
        [],
    );

    const setMeasureGroupPlaceholders = useCallback(
        (
            valueOrUpdateCallback:
                | Record<string, IMeasureGroupPlaceholder>
                | ((
                      placeholders: Record<string, IMeasureGroupPlaceholder>,
                  ) => Record<string, IMeasureGroupPlaceholder>),
        ) => {
            setMeasuresContext((context) => {
                const updatedGroupPlaceholders =
                    typeof valueOrUpdateCallback === "function"
                        ? valueOrUpdateCallback(context.measureGroupPlaceholders)
                        : valueOrUpdateCallback;

                return {
                    ...context,
                    measureGroupPlaceholders: updatedGroupPlaceholders,
                };
            });
        },
        [],
    );

    return (
        <MeasuresContext.Provider
            value={{
                measurePlaceholders,
                undefinedPlaceholderHandling,
                setMeasurePlaceholders,
                measureGroupPlaceholders,
                setMeasureGroupPlaceholders,
            }}
        >
            {children}
        </MeasuresContext.Provider>
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
export function useResolveMeasurePlaceholders(values: undefined): undefined;
/**
 * @public
 */
export function useResolveMeasurePlaceholders(values: IAttributeOrMeasure): IAttributeOrMeasure;
/**
 * @public
 */
export function useResolveMeasurePlaceholders(values: IMeasurePlaceholder): IAttributeOrMeasure | undefined;
/**
 * @public
 */
export function useResolveMeasurePlaceholders(
    values: IAttributeOrMeasure | IMeasurePlaceholder,
): IAttributeOrMeasure | undefined;
/**
 * @public
 */
export function useResolveMeasurePlaceholders(
    values:
        | IMeasureGroupPlaceholder
        | Array<IAttributeOrMeasure | IMeasurePlaceholder | IMeasureGroupPlaceholder>,
): Array<IAttributeOrMeasure>;
/**
 * @public
 */
export function useResolveMeasurePlaceholders(
    values:
        | undefined
        | IAttributeOrMeasure
        | IMeasurePlaceholder
        | IMeasureGroupPlaceholder
        | Array<IAttributeOrMeasure | IMeasurePlaceholder | IMeasureGroupPlaceholder>,
): Array<IAttributeOrMeasure> | IAttributeOrMeasure | undefined {
    const { measurePlaceholders, measureGroupPlaceholders, undefinedPlaceholderHandling } = useContext(
        MeasuresContext,
    );

    if (isArray(values)) {
        return flatMap(values, (v) => {
            if (isMeasurePlaceholder(v)) {
                const measure = resolveMeasurePlaceholderValue(
                    v,
                    measurePlaceholders,
                    undefinedPlaceholderHandling,
                );
                return measure ?? [];
            } else if (isMeasureGroupPlaceholder(v)) {
                const measures = resolveMeasureGroupPlaceholderValue(
                    v,
                    measureGroupPlaceholders,
                    measurePlaceholders,
                    undefinedPlaceholderHandling,
                );
                return measures;
            }
            return v ?? [];
        });
    } else if (isMeasurePlaceholder(values)) {
        const measure = resolveMeasurePlaceholderValue(
            values,
            measurePlaceholders,
            undefinedPlaceholderHandling,
        );
        return measure;
    } else if (isMeasureGroupPlaceholder(values)) {
        const measures = resolveMeasureGroupPlaceholderValue(
            values,
            measureGroupPlaceholders,
            measurePlaceholders,
            undefinedPlaceholderHandling,
        );
        return measures;
    }

    return values;
}

/**
 *
 * @public
 */
export function useMeasurePlaceholder(
    placeholder: IMeasurePlaceholder,
): [
    measure: IAttributeOrMeasure | undefined,
    setMeasurePlaceholder: (
        valueOrUpdateCallback:
            | IAttributeOrMeasure
            | ((attrOrMeasure: IAttributeOrMeasure | undefined) => IAttributeOrMeasure | undefined)
            | undefined,
    ) => void,
] {
    const { measurePlaceholders, setMeasurePlaceholders, undefinedPlaceholderHandling } = useContext(
        MeasuresContext,
    );
    const measure = resolveMeasurePlaceholderValue(
        placeholder,
        measurePlaceholders,
        undefinedPlaceholderHandling,
    );

    const setMeasurePlaceholder = useCallback(
        (
            valueOrUpdateCallback:
                | IAttributeOrMeasure
                | ((attrOrMeasure: IAttributeOrMeasure | undefined) => IAttributeOrMeasure | undefined)
                | undefined,
        ) => {
            setMeasurePlaceholders((mp) => {
                const measure = resolveMeasurePlaceholderValue(placeholder, mp, undefinedPlaceholderHandling);
                const updatedMeasure =
                    typeof valueOrUpdateCallback === "function"
                        ? valueOrUpdateCallback(measure)
                        : valueOrUpdateCallback;

                if (!updatedMeasure) {
                    handleUndefinedPlaceholder(placeholder.id, undefinedPlaceholderHandling);
                }

                return {
                    ...mp,
                    [placeholder.id]: {
                        ...placeholder,
                        measure: updatedMeasure,
                    },
                };
            });
        },
        [],
    );

    return [measure, setMeasurePlaceholder];
}

/**
 *
 * @public
 */
export function useMeasurePlaceholderGroup(
    placeholderGroup: IMeasureGroupPlaceholder,
): [
    measures: IAttributeOrMeasure[],
    setMeasurePlaceholderGroup: (
        valueOrUpdateCallback:
            | Array<IAttributeOrMeasure | IMeasurePlaceholder>
            | ((
                  attrOrMeasure: Array<IAttributeOrMeasure | IMeasurePlaceholder>,
              ) => Array<IAttributeOrMeasure | IMeasurePlaceholder>),
    ) => void,
] {
    const {
        measureGroupPlaceholders,
        setMeasureGroupPlaceholders,
        measurePlaceholders,
        undefinedPlaceholderHandling,
    } = useContext(MeasuresContext);
    const measures = resolveMeasureGroupPlaceholderValue(
        placeholderGroup,
        measureGroupPlaceholders,
        measurePlaceholders,
        undefinedPlaceholderHandling,
    );

    const setMeasurePlaceholderGroup = useCallback(
        (
            valueOrUpdateCallback:
                | Array<IAttributeOrMeasure | IMeasurePlaceholder>
                | ((
                      attrOrMeasure: Array<IAttributeOrMeasure | IMeasurePlaceholder>,
                  ) => Array<IAttributeOrMeasure | IMeasurePlaceholder>),
        ) => {
            setMeasureGroupPlaceholders((mpg) => {
                const measures = mpg[placeholderGroup.id]?.measures ?? placeholderGroup.measures;
                const updatedMeasures =
                    typeof valueOrUpdateCallback === "function"
                        ? valueOrUpdateCallback(measures)
                        : valueOrUpdateCallback;

                return {
                    ...mpg,
                    [placeholderGroup.id]: {
                        ...placeholderGroup,
                        measures: updatedMeasures,
                    },
                };
            });
        },
        [],
    );

    return [measures, setMeasurePlaceholderGroup];
}
