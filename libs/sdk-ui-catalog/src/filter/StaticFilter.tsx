// (C) 2025 GoodData Corporation

import React from "react";

import { DropdownInvertableSelect } from "@gooddata/sdk-ui-kit";

export interface IStaticFilterProps {
    options: string[];
    onChange: (selection: string[]) => void;
}

export function StaticFilter({ options, onChange }: IStaticFilterProps) {
    const handleChange = (selection: string[], isInverted: boolean) => {
        const optionsSet = new Set(options);
        const selectionSet = new Set(selection);
        const nextSelection = isInverted
            ? options.filter((item) => !selectionSet.has(item))
            : selection.filter((item) => optionsSet.has(item));
        onChange(nextSelection);
    };

    return (
        <DropdownInvertableSelect
            options={options}
            getItemTitle={(item) => item}
            getItemKey={(item) => item}
            onChange={handleChange}
        />
    );
}
