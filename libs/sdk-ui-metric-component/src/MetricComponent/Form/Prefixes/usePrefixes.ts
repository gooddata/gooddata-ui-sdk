// (C) 2023-2026 GoodData Corporation

import { useContext } from "react";

import { type IPrefixes, PrefixesContext } from "./PrefixesContext.js";

export function usePrefixes(): IPrefixes {
    return useContext(PrefixesContext);
}
