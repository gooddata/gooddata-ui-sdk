// (C) 2025 GoodData Corporation

import { ClientFormatterFacade, ISeparators } from "@gooddata/number-formatter";
import { DateFilterHelpers } from "@gooddata/sdk-ui-filters";

import { KdaDateOptions } from "./internalTypes.js";
import { IKdaDefinition } from "./types.js";
import { DEFAULT_MEASURE_FORMAT } from "../presentation/alerting/DefaultAlertingDialog/constants.js";

//Format value

export function formatValue(definition: IKdaDefinition, value: number, separators?: ISeparators) {
    const val = ClientFormatterFacade.formatValue(
        value,
        definition.metric.measure.format ?? DEFAULT_MEASURE_FORMAT,
        separators,
    );

    return val.formattedValue;
}

//Format title

export function formatTitle(option: KdaDateOptions, splitter: string): string {
    const [from, to] = option.range ?? [null, null];

    // Not defined
    if (!from || !to) {
        return " - ";
    }

    const pattern = from.format?.pattern ?? "yyyy-MM-dd";

    return DateFilterHelpers.formatAbsoluteDateRange(
        new Date(from.date),
        new Date(to.date),
        pattern,
        splitter,
    );
}
