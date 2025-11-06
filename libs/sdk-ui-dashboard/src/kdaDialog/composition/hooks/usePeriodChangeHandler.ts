// (C) 2025 GoodData Corporation

import { useCallback, useMemo } from "react";

import { DateAttributeGranularity, ICatalogDateAttribute } from "@gooddata/sdk-model";

import { useDateAttribute } from "../../hooks/useDateAttribute.js";
import { KdaDateOptions } from "../../internalTypes.js";
import { useKdaState } from "../../providers/KdaState.js";
import { IKdaDefinition, KdaPeriodType } from "../../types.js";
import { clearSummaryValue } from "../../utils.js";

export function usePeriodChangeHandler() {
    const dateAttributeFinder = useDateAttribute();

    const { state, setState } = useKdaState();
    const def = state.definition;

    const dateAttribute = useMemo(() => {
        return dateAttributeFinder(def?.dateAttribute);
    }, [dateAttributeFinder, def?.dateAttribute]);

    const options = useMemo((): KdaDateOptions => {
        return {
            dateAttribute,
            period: def?.type ?? "previous_period",
            range: def?.range,
        };
    }, [dateAttribute, def?.type, def?.range]);

    const onPeriodChange = useCallback(
        (type: KdaPeriodType) => {
            const def = state.definition;

            if (!def || !dateAttribute) {
                return;
            }

            const definition = updateDefinitionPeriod(def, dateAttribute, type);
            setState({
                ...clearSummaryValue(definition),
            });
        },
        [dateAttribute, setState, state.definition],
    );

    const isAvailable = useMemo(() => {
        return isPeriodChangeAvailable(dateAttribute);
    }, [dateAttribute]);

    return {
        options,
        isAvailable,
        onPeriodChange,
    };
}

function updateDefinitionPeriod(
    definition: IKdaDefinition,
    dateAttribute: ICatalogDateAttribute,
    type: KdaPeriodType,
): IKdaDefinition {
    const [from, to] = definition.range;
    const granularity = dateAttribute.granularity;

    switch (type) {
        case "previous_period": {
            const currentDate = updateDateBy(to.date, granularity);
            return {
                ...definition,
                type: "previous_period",
                range: [
                    {
                        ...from,
                        date: currentDate.toISOString(),
                    },
                    to,
                ],
            };
        }
        case "same_period_previous_year": {
            const currentDate = new Date(to.date);
            currentDate.setFullYear(currentDate.getFullYear() - 1);
            return {
                ...definition,
                type: "same_period_previous_year",
                range: [
                    {
                        ...from,
                        date: currentDate.toISOString(),
                    },
                    to,
                ],
            };
        }
    }
}

function updateDateBy(date: string, granularity: DateAttributeGranularity) {
    switch (granularity) {
        case "GDC.time.year": {
            const current = new Date(date);
            current.setFullYear(current.getFullYear() - 1);
            return current;
        }
        case "GDC.time.week_us":
        case "GDC.time.week": {
            const current = new Date(date);
            current.setDate(current.getDate() - 7);
            return current;
        }
        case "GDC.time.quarter": {
            const current = new Date(date);
            current.setMonth(current.getMonth() - 3);
            return current;
        }
        case "GDC.time.month": {
            const current = new Date(date);
            current.setMonth(current.getMonth() - 1);
            return current;
        }
        case "GDC.time.date": {
            const current = new Date(date);
            current.setDate(current.getDate() - 1);
            return current;
        }
        case "GDC.time.hour": {
            const current = new Date(date);
            current.setHours(current.getHours() - 1);
            return current;
        }
        case "GDC.time.minute": {
            const current = new Date(date);
            current.setMinutes(current.getMinutes() - 1);
            return current;
        }
        default:
            return new Date(date);
    }
}

function isPeriodChangeAvailable(dateAttribute: ICatalogDateAttribute | null) {
    const granularity = dateAttribute?.granularity;
    return granularity !== "GDC.time.year";
}
