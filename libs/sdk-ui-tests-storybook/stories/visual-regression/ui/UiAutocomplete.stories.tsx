// (C) 2026 GoodData Corporation

import { useCallback, useState } from "react";

import { IntlProvider } from "react-intl";
import { action } from "storybook/actions";

import { DEFAULT_LANGUAGE, DEFAULT_MESSAGES } from "@gooddata/sdk-ui";
import {
    type IUiAutocompleteLoadResult,
    type IUiAutocompleteOption,
    type IUiAutocompleteSection,
    UiAutocomplete,
} from "@gooddata/sdk-ui-kit";

import { type IStoryParameters, State } from "../../_infra/backstopScenario.js";
import { wrapWithTheme } from "../themeWrapper.js";

interface ISampleOption extends IUiAutocompleteOption {
    raw: string;
}

const SECTIONS: IUiAutocompleteSection<ISampleOption>[] = [
    {
        id: "fruits",
        label: "Fruits",
        options: [
            { id: "apple", label: "Apple", raw: "apple" },
            { id: "banana", label: "Banana", secondaryText: "yellow", raw: "banana" },
            { id: "cherry", label: "Cherry", secondaryText: "red", raw: "cherry" },
        ],
    },
    {
        id: "veggies",
        label: "Vegetables",
        options: [
            { id: "carrot", label: "Carrot", raw: "carrot" },
            { id: "potato", label: "Potato", raw: "potato" },
        ],
    },
];

function loadOptions(query: string): Promise<IUiAutocompleteLoadResult<ISampleOption>> {
    const q = query.trim().toLowerCase();
    if (!q) return Promise.resolve({ sections: SECTIONS });
    return Promise.resolve({
        sections: SECTIONS.map((section) => ({
            ...section,
            options: section.options.filter((o) => o.label.toLowerCase().includes(q)),
        })).filter((section) => section.options.length > 0),
    });
}

// Paginated demo: simulate a flat user list returned in pages of 3.
const PAGED_USERS: ISampleOption[] = Array.from({ length: 9 }, (_, i) => ({
    id: `u${i + 1}`,
    label: `User ${i + 1}`,
    secondaryText: `user${i + 1}@example.com`,
    raw: `u${i + 1}`,
}));

function loadPagedOptions(query: string, page: number): Promise<IUiAutocompleteLoadResult<ISampleOption>> {
    const q = query.trim().toLowerCase();
    const matches = q ? PAGED_USERS.filter((o) => o.label.toLowerCase().includes(q)) : PAGED_USERS;
    const pageSize = 3;
    const start = page * pageSize;
    const slice = matches.slice(start, start + pageSize);
    return Promise.resolve({
        sections: slice.length ? [{ id: "users", label: "Users", options: slice }] : [],
        hasNextPage: start + pageSize < matches.length,
    });
}

function Example({
    loader = loadOptions,
}: {
    loader?: (q: string, page: number) => Promise<IUiAutocompleteLoadResult<ISampleOption>>;
}) {
    const [picked, setPicked] = useState<ISampleOption[]>([]);
    const handleSelect = useCallback((option: ISampleOption) => {
        action("select")(option);
        setPicked((prev) => [...prev, option]);
    }, []);

    return (
        <IntlProvider locale={DEFAULT_LANGUAGE} messages={DEFAULT_MESSAGES[DEFAULT_LANGUAGE]}>
            <div
                className="screenshot-target"
                style={{ width: 500, padding: 24, background: "rgba(20,56,93,0.04)" }}
            >
                <UiAutocomplete<ISampleOption>
                    loadOptions={loader}
                    selectedIds={picked.map((o) => o.id)}
                    onSelect={handleSelect}
                    debounceMs={0}
                />
                <div style={{ marginTop: 16, color: "#454a56" }}>
                    Picked: {picked.map((o) => o.label).join(", ") || "(none)"}
                </div>
            </div>
        </IntlProvider>
    );
}

export default {
    title: "15 Ui/UiAutocomplete",
};

const screenshotParams = {
    screenshot: { readySelector: { selector: ".screenshot-target", state: State.Attached } },
} as const;

export function Default() {
    return <Example />;
}
Default.parameters = { kind: "default", ...screenshotParams } satisfies IStoryParameters;

// Interactive-only (no `screenshot`): its closed-input state is pixel-identical
// to Default, so a VRT baseline would add nothing. Kept for manually exercising
// pagination / Load-more in Storybook.
export function Paginated() {
    return <Example loader={loadPagedOptions} />;
}
Paginated.parameters = { kind: "paginated" } satisfies IStoryParameters;

export const Themed = () => wrapWithTheme(<Example />);
Themed.parameters = { kind: "themed", ...screenshotParams } satisfies IStoryParameters;
