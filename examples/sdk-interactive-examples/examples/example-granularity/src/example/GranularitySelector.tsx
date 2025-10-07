// (C) 2021-2025 GoodData Corporation

import { IAttribute } from "@gooddata/sdk-model";

import * as Catalog from "../catalog.js";

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
                    setGranularity(Catalog.DateDatasets.CustomerCreatedDate.CustomerCreatedDateYear.Default)
                }
                checked={
                    granularity === Catalog.DateDatasets.CustomerCreatedDate.CustomerCreatedDateYear.Default
                }
            />
            <label htmlFor="yearly">Yearly</label>{" "}
            <input
                type="radio"
                id="quarterly"
                name="quarterly"
                onChange={() =>
                    setGranularity(
                        Catalog.DateDatasets.CustomerCreatedDate.CustomerCreatedDateQuarterYear.Default,
                    )
                }
                checked={
                    granularity ===
                    Catalog.DateDatasets.CustomerCreatedDate.CustomerCreatedDateQuarterYear.Default
                }
            />
            <label htmlFor="quarterly">Quarterly</label>{" "}
            <input
                type="radio"
                id="monthly"
                name="monthly"
                onChange={() =>
                    setGranularity(
                        Catalog.DateDatasets.CustomerCreatedDate.CustomerCreatedDateMonthYear.Default,
                    )
                }
                checked={
                    granularity ===
                    Catalog.DateDatasets.CustomerCreatedDate.CustomerCreatedDateMonthYear.Default
                }
            />
            <label htmlFor="monthly">Monthly</label>{" "}
        </>
    );
}
