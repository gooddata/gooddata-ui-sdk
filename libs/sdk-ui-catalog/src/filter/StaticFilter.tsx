// (C) 2025 GoodData Corporation

import React from "react";

import { DropdownInvertableSelect } from "@gooddata/sdk-ui-kit";

export interface IStaticFilterProps {
    dataTestId: string;
    options: string[];
    onChange: (selection: string[]) => void;
}

export function StaticFilter({ options, onChange, dataTestId }: IStaticFilterProps) {
    const handleChange = (selection: string[], isInverted: boolean) => {
        const optionsSet = new Set(options);
        const selectionSet = new Set(selection);
        const nextSelection = isInverted
            ? options.filter((item) => !selectionSet.has(item))
            : selection.filter((item) => optionsSet.has(item));
        if (options.length === nextSelection.length) {
            onChange([]);
        } else {
            onChange(nextSelection);
        }
    };

    return (
        <div data-testid={dataTestId}>
            <DropdownInvertableSelect
                options={options}
                getItemTitle={(item) => item}
                getItemKey={(item) => item}
                onChange={handleChange}
            />
        </div>
    );
}
