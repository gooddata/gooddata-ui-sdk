// (C) 2020 GoodData Corporation
import { IMeasureValueFilter } from "@gooddata/sdk-model";
import { ISeparators } from "@gooddata/sdk-ui";

/**
 * @beta
 */
export interface IMeasureValueFilterCommonProps {
    filter: IMeasureValueFilter;
    measureIdentifier: string;
    onApply: (filter: IMeasureValueFilter) => void;
    usePercentage?: boolean;
    warningMessage?: string;
    locale?: string;
    separators?: ISeparators;
    displayTreatNullAsZeroOption?: boolean;
    treatNullAsZeroDefaultValue?: boolean;
}
