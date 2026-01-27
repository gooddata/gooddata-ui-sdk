// (C) 2021-2026 GoodData Corporation

import { type IAttribute } from "@gooddata/sdk-model";

import { DateDatasets } from "../catalog.js";

export interface IGranularitySelectorProps {
    granularity: IAttribute;
    setGranularity: (granularity: IAttribute) => void;
}

export function GranularitySelector({ granularity, setGranularity }: IGranularitySelectorProps) {
    return (
        <>
            <input
                type="radio"
                id="yearly"
                name="yearly"
                onChange={() =>
                    setGranularity(DateDatasets.CustomerCreatedDate.CustomerCreatedDateYear.Default)
                }
                checked={granularity === DateDatasets.CustomerCreatedDate.CustomerCreatedDateYear.Default}
            />
            <label htmlFor="yearly">Yearly</label>{" "}
            <input
                type="radio"
                id="quarterly"
                name="quarterly"
                onChange={() =>
                    setGranularity(DateDatasets.CustomerCreatedDate.CustomerCreatedDateQuarterYear.Default)
                }
                checked={
                    granularity === DateDatasets.CustomerCreatedDate.CustomerCreatedDateQuarterYear.Default
                }
            />
            <label htmlFor="quarterly">Quarterly</label>{" "}
            <input
                type="radio"
                id="monthly"
                name="monthly"
                onChange={() =>
                    setGranularity(DateDatasets.CustomerCreatedDate.CustomerCreatedDateMonthYear.Default)
                }
                checked={
                    granularity === DateDatasets.CustomerCreatedDate.CustomerCreatedDateMonthYear.Default
                }
            />
            <label htmlFor="monthly">Monthly</label>{" "}
        </>
    );
}
