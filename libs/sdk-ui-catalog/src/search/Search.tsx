// (C) 2025 GoodData Corporation

import React, { useCallback, useEffect, useMemo } from "react";

import { useIntl } from "react-intl";

import type { IAnalyticalBackend } from "@gooddata/sdk-backend-spi";
import type { GenAIObjectType } from "@gooddata/sdk-model";
import { useDebouncedState } from "@gooddata/sdk-ui";
import { Input } from "@gooddata/sdk-ui-kit";
import { useSemanticSearch } from "@gooddata/sdk-ui-semantic-search";

import { useSearchActions } from "./SearchContext.js";
import { useFilterState } from "../filter/index.js";
import { mapGenAIObjectType } from "../objectType/index.js";

const initialSearchTerm = "";
const searchResultLimit = 50;
const debounceDelay = 300;
const searchTypes: GenAIObjectType[] = ["dashboard", "visualization", "metric", "fact", "attribute"];

type Props = {
    backend: IAnalyticalBackend;
    workspace: string;
};

export function Search({ backend, workspace }: Props) {
    const intl = useIntl();
    const { types } = useFilterState();

    const [value, setValue, searchTerm] = useDebouncedState<string>(initialSearchTerm, debounceDelay);

    const handleChange = useCallback(
        (value: string | number) => {
            setValue(String(value));
        },
        [setValue],
    );

    const objectTypes = useMemo(() => {
        // If no types are selected, use the default search types
        if (types.length === 0) {
            return searchTypes;
        }
        // Otherwise, use the selected types
        return types.map(mapGenAIObjectType);
    }, [types]);

    const { setSearchStatus, setSearchItems } = useSearchActions();
    const { searchResults, searchStatus } = useSemanticSearch({
        backend,
        workspace,
        searchTerm,
        limit: searchResultLimit,
        objectTypes,
        deepSearch: false,
    });

    useEffect(() => {
        setSearchStatus(searchStatus);
        setSearchItems(searchResults);
    }, [searchResults, setSearchItems, searchStatus, setSearchStatus]);

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
