// (C) 2007-2026 GoodData Corporation

import { type ChangeEvent } from "react";

import { type ITranslatedAggregationFunction } from "../../models/aggregation_function.js";

interface IAggregationSelectProps {
    className?: string;
    aggregationFunctions?: ITranslatedAggregationFunction[];
    aggregation?: string;
    onSelect: (value: string) => void;
}

export function AggregationSelect({
    aggregationFunctions = [],
    aggregation = null,
    className = "",
    onSelect,
}: IAggregationSelectProps) {
    const handleSelect = (e: ChangeEvent<HTMLSelectElement>) => onSelect(e.target.value);

    return (
        <select className={className} onChange={handleSelect} value={aggregation}>
            {aggregationFunctions.map((opt) => (
                <option key={opt.functionName} value={opt.functionName}>
                    {opt.title}
                </option>
            ))}
        </select>
    );
}
