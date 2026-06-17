// (C) 2026 GoodData Corporation

import { type IUiGranteeAsyncOption, type IUiGranteeAsyncOptions } from "@gooddata/sdk-ui-kit";

/** Shared grantee fixtures for the UiGranteeAsyncPicker / UiAddGranteeDialog stories. */
export const ALL: IUiGranteeAsyncOption[] = [
    { id: "g:marketing", kind: "group", name: "Marketing" },
    { id: "g:engineering", kind: "group", name: "Engineering" },
    { id: "g:design", kind: "group", name: "Design" },
    { id: "u:jane", kind: "user", name: "Jane Good", email: "jane.good@company.com" },
    { id: "u:marek", kind: "user", name: "Marek Stránský", email: "marek@example.com" },
    { id: "u:julie", kind: "user", name: "Julie Better", email: "julie.better@company.com" },
];

export function loadOptions(query: string): Promise<IUiGranteeAsyncOptions> {
    const q = query.trim().toLowerCase();
    const matches = q
        ? ALL.filter((o) => o.name.toLowerCase().includes(q) || o.email?.toLowerCase().includes(q))
        : ALL;
    return Promise.resolve({
        groups: matches.filter((o) => o.kind === "group"),
        users: matches.filter((o) => o.kind === "user"),
    });
}
