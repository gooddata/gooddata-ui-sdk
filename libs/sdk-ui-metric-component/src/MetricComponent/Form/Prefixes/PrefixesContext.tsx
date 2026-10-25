// (C) 2023-2026 GoodData Corporation

import { type ReactElement, type ReactNode, createContext } from "react";

/**
 * @internal
 */
export interface IPrefixes {
    current: string | undefined;
    parents: string[];
}

export const PrefixesContext = createContext<IPrefixes>({
    parents: [],
    current: undefined,
});

export function PrefixesProvider({
    current,
    parents,
    children,
}: {
    current: string | undefined;
    parents: string[];
    children: ReactNode;
}): ReactElement {
    return <PrefixesContext.Provider value={{ current, parents }}>{children}</PrefixesContext.Provider>;
}
