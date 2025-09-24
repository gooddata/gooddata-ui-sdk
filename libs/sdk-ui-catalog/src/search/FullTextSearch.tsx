// (C) 2025 GoodData Corporation

import { useCallback, useEffect, useMemo } from "react";

import { useIntl } from "react-intl";

import { useDebouncedState } from "@gooddata/sdk-ui";
import { Input } from "@gooddata/sdk-ui-kit";

import { useFullTextSearchActions } from "./FullTextSearchContext.js";

const initialSearchTerm = "";
const debounceDelay = 300;

export function FullTextSearch() {
    const intl = useIntl();
    const { setSearchTerm } = useFullTextSearchActions();
    const [value, setValue, searchTerm] = useDebouncedState<string>(initialSearchTerm, debounceDelay);

    const handleChange = useCallback(
        (value: string | number) => {
            setValue(String(value));
        },
        [setValue],
    );

    useEffect(() => {
        setSearchTerm(searchTerm);
    }, [searchTerm, setSearchTerm]);

    const label = intl.formatMessage({ id: "analyticsCatalog.search.label" });
    const accessibilityConfig = useMemo(() => ({ ariaLabel: label }), [label]);

    return (
        <Input
            type="search"
            name="search"
            placeholder={label}
            accessibilityConfig={accessibilityConfig}
            isSearch
            value={value}
            onChange={handleChange}
            clearOnEsc
        />
    );
}
