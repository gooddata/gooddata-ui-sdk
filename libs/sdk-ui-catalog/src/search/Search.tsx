// (C) 2025 GoodData Corporation

import React, { useCallback, useEffect, useMemo } from "react";

import { useIntl } from "react-intl";

import type { IAnalyticalBackend } from "@gooddata/sdk-backend-spi";
import { useDebouncedState } from "@gooddata/sdk-ui";
import { Input } from "@gooddata/sdk-ui-kit";
import { useSemanticSearch } from "@gooddata/sdk-ui-semantic-search";

import { useSearchActions } from "./SearchContext.js";
import type { ObjectType } from "../objectType/types.js";

const initialSearchTerm = "";
const searchResultLimit = 50;
const debounceDelay = 300;
const objectTypes: ObjectType[] = ["dashboard", "visualization", "metric", "fact", "attribute"];

type Props = {
    backend: IAnalyticalBackend;
    workspace: string;
};

export function Search({ backend, workspace }: Props) {
    const intl = useIntl();

    const [value, setValue, searchTerm] = useDebouncedState<string>(initialSearchTerm, debounceDelay);
    const isModified = searchTerm !== initialSearchTerm;

    const handleChange = useCallback(
        (value: string | number) => {
            setValue(String(value));
        },
        [setValue],
    );

    const { setIsSearching, setSearchStatus, setSearchItems } = useSearchActions();
    const { searchResults, searchStatus } = useSemanticSearch({
        backend,
        workspace,
        searchTerm,
        limit: searchResultLimit,
        objectTypes,
        deepSearch: false,
    });

    // Sync the search state to the context
    useEffect(() => {
        setIsSearching(isModified);
    }, [setIsSearching, isModified]);

    useEffect(() => {
        setSearchStatus(searchStatus);
    }, [setSearchStatus, searchStatus]);

    useEffect(() => {
        setSearchItems(searchResults);
    }, [searchResults, setSearchItems]);

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
