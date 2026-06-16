// (C) 2026 GoodData Corporation

import { act, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { IntlProvider } from "react-intl";
import { afterEach, describe, expect, it, vi } from "vitest";

import { DEFAULT_LANGUAGE, DEFAULT_MESSAGES } from "@gooddata/sdk-ui";

import { type IUiAutocompleteOption, type IUiAutocompleteSection } from "../types.js";
import { UiAutocomplete } from "../UiAutocomplete.js";

interface ISampleOption extends IUiAutocompleteOption {
    raw?: string;
}

const SECTIONS: IUiAutocompleteSection<ISampleOption>[] = [
    {
        id: "groups",
        label: "Groups",
        options: [
            { id: "g1", label: "Marketing" },
            { id: "g2", label: "Engineering" },
        ],
    },
    {
        id: "users",
        label: "Users",
        options: [
            { id: "u1", label: "Jane Good", secondaryText: "jane@example.com" },
            { id: "u2", label: "Marek", secondaryText: "marek@example.com" },
        ],
    },
];

function renderWithIntl(ui: React.ReactNode) {
    return render(
        <IntlProvider locale={DEFAULT_LANGUAGE} messages={DEFAULT_MESSAGES[DEFAULT_LANGUAGE]}>
            {ui}
        </IntlProvider>,
    );
}

describe("UiAutocomplete", () => {
    // The debounce test opts into fake timers; restore here so a mid-test
    // assertion failure can't leak them into later tests.
    afterEach(() => {
        vi.useRealTimers();
    });

    it("renders the text input as a combobox", () => {
        renderWithIntl(
            <UiAutocomplete loadOptions={() => Promise.resolve({ sections: [] })} onSelect={() => {}} />,
        );
        expect(screen.getByRole("combobox")).toBeInTheDocument();
    });

    it("opens the dropdown on click and shows sectioned results", async () => {
        renderWithIntl(
            <UiAutocomplete
                loadOptions={() => Promise.resolve({ sections: SECTIONS })}
                onSelect={() => {}}
                debounceMs={0}
            />,
        );
        fireEvent.click(screen.getByRole("combobox"));
        await waitFor(() => expect(screen.getByText("Marketing")).toBeInTheDocument());
        expect(screen.getByText("Groups")).toBeInTheDocument();
        expect(screen.getByText("Users")).toBeInTheDocument();
        expect(screen.getByText("Jane Good")).toBeInTheDocument();
    });

    it("renders the optional secondaryText next to the label", async () => {
        renderWithIntl(
            <UiAutocomplete
                loadOptions={() => Promise.resolve({ sections: SECTIONS })}
                onSelect={() => {}}
                debounceMs={0}
            />,
        );
        fireEvent.click(screen.getByRole("combobox"));
        await waitFor(() => expect(screen.getByText("jane@example.com")).toBeInTheDocument());
    });

    it("calls onSelect with the picked option", async () => {
        const onSelect = vi.fn();
        renderWithIntl(
            <UiAutocomplete
                loadOptions={() => Promise.resolve({ sections: SECTIONS })}
                onSelect={onSelect}
                debounceMs={0}
            />,
        );
        fireEvent.click(screen.getByRole("combobox"));
        await waitFor(() => expect(screen.getByText("Marek")).toBeInTheDocument());
        fireEvent.click(screen.getByText("Marek"));
        expect(onSelect).toHaveBeenCalledTimes(1);
        expect(onSelect.mock.calls[0][0].id).toBe("u2");
    });

    it("filters out already-selected ids", async () => {
        renderWithIntl(
            <UiAutocomplete
                loadOptions={() => Promise.resolve({ sections: SECTIONS })}
                onSelect={() => {}}
                selectedIds={["u1"]}
                debounceMs={0}
            />,
        );
        fireEvent.click(screen.getByRole("combobox"));
        await waitFor(() => expect(screen.getByText("Marek")).toBeInTheDocument());
        expect(screen.queryByText("Jane Good")).not.toBeInTheDocument();
    });

    it("does not show the no-match message when matches exist but are all selected", async () => {
        const single: IUiAutocompleteSection<ISampleOption>[] = [
            { id: "users", label: "Users", options: [{ id: "u1", label: "Only Match" }] },
        ];
        renderWithIntl(
            <UiAutocomplete
                loadOptions={() => Promise.resolve({ sections: single })}
                onSelect={() => {}}
                selectedIds={["u1"]}
                debounceMs={0}
            />,
        );
        fireEvent.click(screen.getByRole("combobox"));
        // Wait for the load to settle (loading row gone). The only match is
        // already selected → hidden, but the search succeeded, so the "no
        // matching options" message must not appear.
        await waitFor(() => expect(screen.queryByText("Loading…")).not.toBeInTheDocument());
        expect(screen.queryByText("Only Match")).not.toBeInTheDocument();
        expect(screen.queryByText("No matching options.")).not.toBeInTheDocument();
    });

    it("debounces the search query", async () => {
        vi.useFakeTimers();
        const loadOptions = vi.fn(() =>
            Promise.resolve({ sections: [] as IUiAutocompleteSection<ISampleOption>[] }),
        );
        renderWithIntl(<UiAutocomplete loadOptions={loadOptions} onSelect={() => {}} debounceMs={400} />);
        expect(loadOptions).toHaveBeenCalledTimes(1);
        const input = screen.getByRole("combobox") as HTMLInputElement;
        fireEvent.change(input, { target: { value: "j" } });
        fireEvent.change(input, { target: { value: "ja" } });
        expect(loadOptions).toHaveBeenCalledTimes(1);
        act(() => {
            vi.advanceTimersByTime(400);
        });
        await Promise.resolve();
        expect(loadOptions).toHaveBeenCalledTimes(2);
        expect(loadOptions).toHaveBeenLastCalledWith("ja", 0);
    });

    it("shows the empty state when no matches", async () => {
        renderWithIntl(
            <UiAutocomplete
                loadOptions={() => Promise.resolve({ sections: [] })}
                onSelect={() => {}}
                debounceMs={0}
            />,
        );
        fireEvent.click(screen.getByRole("combobox"));
        await waitFor(() => expect(screen.getByText("No matching options.")).toBeInTheDocument());
    });

    it("opt-in pagination: renders a Load more row and appends results when activated", async () => {
        const PAGE_0: IUiAutocompleteSection<ISampleOption>[] = [
            { id: "users", label: "Users", options: [{ id: "u1", label: "User 1" }] },
        ];
        const PAGE_1: IUiAutocompleteSection<ISampleOption>[] = [
            { id: "users", label: "Users", options: [{ id: "u2", label: "User 2" }] },
        ];
        const loadOptions = vi.fn(
            async (
                _search: string,
                page: number,
            ): Promise<{ sections: IUiAutocompleteSection<ISampleOption>[]; hasNextPage?: boolean }> => {
                if (page === 0) return { sections: PAGE_0, hasNextPage: true };
                return { sections: PAGE_1, hasNextPage: false };
            },
        );
        renderWithIntl(
            <UiAutocomplete<ISampleOption> loadOptions={loadOptions} onSelect={() => {}} debounceMs={0} />,
        );
        fireEvent.click(screen.getByRole("combobox"));
        await waitFor(() => expect(screen.getByText("User 1")).toBeInTheDocument());
        expect(screen.getByText("Load more")).toBeInTheDocument();
        fireEvent.click(screen.getByText("Load more"));
        await waitFor(() => expect(screen.getByText("User 2")).toBeInTheDocument());
        expect(loadOptions).toHaveBeenCalledTimes(2);
        expect(loadOptions).toHaveBeenLastCalledWith("", 1);
        // After the last page the Load more row goes away.
        expect(screen.queryByText("Load more")).not.toBeInTheDocument();
    });

    it("does not select an option when Enter is pressed twice while loading more", async () => {
        let resolvePage1: ((r: { sections: IUiAutocompleteSection<ISampleOption>[] }) => void) | undefined;
        const onSelect = vi.fn();
        const loadOptions = vi.fn(
            (
                _search: string,
                page: number,
            ): Promise<{ sections: IUiAutocompleteSection<ISampleOption>[]; hasNextPage?: boolean }> => {
                if (page === 0) {
                    return Promise.resolve({
                        sections: [{ id: "s", label: "S", options: [{ id: "u1", label: "User 1" }] }],
                        hasNextPage: true,
                    });
                }
                return new Promise((resolve) => {
                    resolvePage1 = resolve;
                });
            },
        );
        renderWithIntl(<UiAutocomplete loadOptions={loadOptions} onSelect={onSelect} debounceMs={0} />);
        const input = screen.getByRole("combobox");
        fireEvent.click(input);
        await waitFor(() => expect(screen.getByText("Load more")).toBeInTheDocument());
        // Highlight the Load more row, activate it (page 1 stays pending), then
        // press Enter again before it resolves.
        fireEvent.keyDown(input, { code: "ArrowUp", key: "ArrowUp" }); // wrap to last row = Load more
        fireEvent.keyDown(input, { code: "Enter", key: "Enter" });
        await waitFor(() => expect(loadOptions).toHaveBeenCalledWith("", 1));
        fireEvent.keyDown(input, { code: "Enter", key: "Enter" });
        expect(onSelect).not.toHaveBeenCalled();
        // Resolve to leave the component in a clean state.
        act(() =>
            resolvePage1?.({ sections: [{ id: "s", label: "S", options: [{ id: "u2", label: "User 2" }] }] }),
        );
        await waitFor(() => expect(screen.getByText("User 2")).toBeInTheDocument());
    });

    it("gives the Load more row a unique DOM id per instance", async () => {
        const loadOptions = () =>
            Promise.resolve({
                sections: [{ id: "s", label: "S", options: [{ id: "u1", label: "User 1" }] }],
                hasNextPage: true,
            });
        // Two instances; open each in turn and capture its Load-more row id.
        // (Only one popup stays open at a time — opening the second closes the
        // first via outside-click — so capture sequentially.)
        const readLoadMoreId = async () => {
            const li = (await screen.findByText("Load more")).closest("li");
            return li?.getAttribute("id");
        };
        const { unmount: unmountA } = renderWithIntl(
            <UiAutocomplete loadOptions={loadOptions} onSelect={() => {}} debounceMs={0} />,
        );
        fireEvent.click(screen.getByRole("combobox"));
        const idA = await readLoadMoreId();
        unmountA();
        renderWithIntl(<UiAutocomplete loadOptions={loadOptions} onSelect={() => {}} debounceMs={0} />);
        fireEvent.click(screen.getByRole("combobox"));
        const idB = await readLoadMoreId();
        expect(idA).toBeTruthy();
        expect(idB).toBeTruthy();
        expect(idA).not.toBe(idB);
    });

    it("drops accumulated pages when the query changes and returns to an earlier value", async () => {
        // Per-query paged data: query "" yields A1 (+page) → A2; query "a" yields B1.
        const byQuery: Record<string, IUiAutocompleteSection<ISampleOption>[][]> = {
            "": [
                [{ id: "s", label: "S", options: [{ id: "a1", label: "A1" }] }],
                [{ id: "s", label: "S", options: [{ id: "a2", label: "A2" }] }],
            ],
            a: [[{ id: "s", label: "S", options: [{ id: "b1", label: "B1" }] }]],
        };
        const loadOptions = vi.fn(
            async (
                search: string,
                page: number,
            ): Promise<{ sections: IUiAutocompleteSection<ISampleOption>[]; hasNextPage?: boolean }> => ({
                sections: byQuery[search][page],
                hasNextPage: search === "" && page === 0,
            }),
        );
        renderWithIntl(<UiAutocomplete loadOptions={loadOptions} onSelect={() => {}} debounceMs={0} />);
        const input = screen.getByRole("combobox");
        fireEvent.click(input);
        await waitFor(() => expect(screen.getByText("A1")).toBeInTheDocument());
        fireEvent.click(screen.getByText("Load more"));
        await waitFor(() => expect(screen.getByText("A2")).toBeInTheDocument());
        // Move to "a", then back to "" — the A2 page must NOT reattach.
        fireEvent.change(input, { target: { value: "a" } });
        await waitFor(() => expect(screen.getByText("B1")).toBeInTheDocument());
        fireEvent.change(input, { target: { value: "" } });
        await waitFor(() => expect(screen.getByText("A1")).toBeInTheDocument());
        expect(screen.queryByText("A2")).not.toBeInTheDocument();
        // Load-more row is back (fresh page-0 says hasNextPage), starting at page 1 again.
        expect(screen.getByText("Load more")).toBeInTheDocument();
    });

    it("shows the error state when the loader rejects", async () => {
        renderWithIntl(
            <UiAutocomplete
                loadOptions={() => Promise.reject(new Error("nope"))}
                onSelect={() => {}}
                debounceMs={0}
            />,
        );
        fireEvent.click(screen.getByRole("combobox"));
        await waitFor(() =>
            expect(screen.getByText("Could not load options. Please try again.")).toBeInTheDocument(),
        );
    });

    it("retries a failed load when the popup is reopened", async () => {
        let attempt = 0;
        const loadOptions = vi.fn(() => {
            attempt += 1;
            return attempt === 1
                ? Promise.reject(new Error("nope"))
                : Promise.resolve({
                      sections: [{ id: "s", label: "S", options: [{ id: "u1", label: "Recovered" }] }],
                  });
        });
        renderWithIntl(<UiAutocomplete loadOptions={loadOptions} onSelect={() => {}} debounceMs={0} />);
        const input = screen.getByRole("combobox");
        fireEvent.click(input);
        await waitFor(() =>
            expect(screen.getByText("Could not load options. Please try again.")).toBeInTheDocument(),
        );
        // Close, then reopen — the reopen should re-run the loader and recover.
        fireEvent.click(input);
        fireEvent.click(input);
        await waitFor(() => expect(screen.getByText("Recovered")).toBeInTheDocument());
    });

    it("clears the keyboard highlight when the search text changes", async () => {
        const onSelect = vi.fn();
        const loadOptions = (search: string) =>
            Promise.resolve({
                sections: [
                    {
                        id: "s",
                        label: "S",
                        options: [{ id: search === "" ? "first" : "other", label: "Row" }],
                    },
                ],
            });
        renderWithIntl(<UiAutocomplete loadOptions={loadOptions} onSelect={onSelect} debounceMs={0} />);
        const input = screen.getByRole("combobox");
        fireEvent.click(input);
        await waitFor(() => expect(screen.getByRole("option")).toBeInTheDocument());
        // Highlight the row, then type — the highlight must not carry over to the
        // row the new query slots into the same position.
        fireEvent.keyDown(input, { code: "ArrowDown", key: "ArrowDown" });
        fireEvent.change(input, { target: { value: "x" } });
        await waitFor(() => expect(screen.getByRole("option")).toBeInTheDocument());
        fireEvent.keyDown(input, { code: "Enter", key: "Enter" });
        expect(onSelect).not.toHaveBeenCalled();
    });

    it("discards a stale request that resolves after a newer query's results", async () => {
        const resolvers: Record<
            string,
            (result: { sections: IUiAutocompleteSection<ISampleOption>[] }) => void
        > = {};
        const loadOptions = vi.fn(
            (search: string) =>
                new Promise<{ sections: IUiAutocompleteSection<ISampleOption>[] }>((resolve) => {
                    resolvers[search] = resolve;
                }),
        );
        renderWithIntl(<UiAutocomplete loadOptions={loadOptions} onSelect={() => {}} debounceMs={0} />);
        const input = screen.getByRole("combobox");
        fireEvent.click(input);
        fireEvent.change(input, { target: { value: "a" } });
        await waitFor(() => expect(loadOptions).toHaveBeenCalledWith("a", 0));
        fireEvent.change(input, { target: { value: "ab" } });
        await waitFor(() => expect(loadOptions).toHaveBeenCalledWith("ab", 0));
        act(() => {
            resolvers["ab"]({
                sections: [{ id: "s", label: "S", options: [{ id: "ab", label: "AB match" }] }],
            });
        });
        await waitFor(() => expect(screen.getByText("AB match")).toBeInTheDocument());
        act(() => {
            resolvers["a"]({
                sections: [{ id: "s", label: "S", options: [{ id: "a", label: "A match" }] }],
            });
        });
        await waitFor(() => expect(screen.getByText("AB match")).toBeInTheDocument());
        expect(screen.queryByText("A match")).not.toBeInTheDocument();
    });

    it("clears previous results and reports loading synchronously on typing", async () => {
        const loadOptions = (search: string) => Promise.resolve({ sections: search === "" ? SECTIONS : [] });
        renderWithIntl(<UiAutocomplete loadOptions={loadOptions} onSelect={() => {}} debounceMs={400} />);
        fireEvent.click(screen.getByRole("combobox"));
        await waitFor(() => expect(screen.getByText("Marketing")).toBeInTheDocument());
        fireEvent.change(screen.getByRole("combobox"), { target: { value: "x" } });
        // Before the debounced fetch even fires, the stale options must be gone.
        expect(screen.queryByText("Marketing")).not.toBeInTheDocument();
        expect(screen.getByText("Loading…")).toBeInTheDocument();
    });

    it("scopes Escape to the popup and lets idle Escape propagate", async () => {
        const outerKeyDown = vi.fn();
        renderWithIntl(
            <div onKeyDown={outerKeyDown}>
                <UiAutocomplete
                    loadOptions={() => Promise.resolve({ sections: SECTIONS })}
                    onSelect={() => {}}
                    debounceMs={0}
                />
            </div>,
        );
        const input = screen.getByRole("combobox");
        fireEvent.click(input);
        await waitFor(() => expect(screen.getByText("Marketing")).toBeInTheDocument());
        fireEvent.keyDown(input, { code: "Escape", key: "Escape" });
        expect(screen.queryByText("Marketing")).not.toBeInTheDocument();
        expect(outerKeyDown).not.toHaveBeenCalled();
        // Popup closed and the input is empty — Escape now reaches the ancestors
        // (an enclosing modal must be able to dismiss).
        fireEvent.keyDown(input, { code: "Escape", key: "Escape" });
        expect(outerKeyDown).toHaveBeenCalledTimes(1);
    });

    it("does not page the wrong query when Load more was highlighted before a query change", async () => {
        const onSelect = vi.fn();
        const loadOptions = vi.fn(
            (
                search: string,
                page: number,
            ): Promise<{ sections: IUiAutocompleteSection<ISampleOption>[]; hasNextPage?: boolean }> => {
                // Both queries return one page-0 row with a "Load more"; the row's
                // id must differ per query so a stale highlight can't carry over.
                const id = `${search || "empty"}-p${page}`;
                return Promise.resolve({
                    sections: [{ id: "s", label: "S", options: [{ id, label: `Row ${id}` }] }],
                    hasNextPage: page === 0,
                });
            },
        );
        renderWithIntl(<UiAutocomplete loadOptions={loadOptions} onSelect={onSelect} debounceMs={0} />);
        const input = screen.getByRole("combobox");
        fireEvent.click(input);
        await waitFor(() => expect(screen.getByText("Load more")).toBeInTheDocument());
        // Highlight the Load more row (last), then change the query.
        fireEvent.keyDown(input, { code: "ArrowUp", key: "ArrowUp" });
        fireEvent.change(input, { target: { value: "x" } });
        await waitFor(() => expect(screen.getByText("Row x-p0")).toBeInTheDocument());
        const calls = loadOptions.mock.calls.length;
        // Enter must not trigger a page-1 fetch for the new query via the stale row.
        fireEvent.keyDown(input, { code: "Enter", key: "Enter" });
        expect(loadOptions).toHaveBeenCalledTimes(calls);
        expect(onSelect).not.toHaveBeenCalled();
    });

    it("clears a real-option highlight when Load more is activated", async () => {
        let resolvePage1: ((r: { sections: IUiAutocompleteSection<ISampleOption>[] }) => void) | undefined;
        const onSelect = vi.fn();
        const loadOptions = vi.fn(
            (
                _search: string,
                page: number,
            ): Promise<{ sections: IUiAutocompleteSection<ISampleOption>[]; hasNextPage?: boolean }> => {
                if (page === 0) {
                    return Promise.resolve({
                        sections: [{ id: "s", label: "S", options: [{ id: "u1", label: "User 1" }] }],
                        hasNextPage: true,
                    });
                }
                return new Promise((resolve) => {
                    resolvePage1 = resolve;
                });
            },
        );
        renderWithIntl(<UiAutocomplete loadOptions={loadOptions} onSelect={onSelect} debounceMs={0} />);
        const input = screen.getByRole("combobox");
        fireEvent.click(input);
        await waitFor(() => expect(screen.getByText("User 1")).toBeInTheDocument());
        // Highlight the real option via keyboard, then click Load more (no hover
        // over it first). Page 1 stays pending → status is loadingMore.
        fireEvent.keyDown(input, { code: "ArrowDown", key: "ArrowDown" });
        fireEvent.click(screen.getByText("Load more"));
        // Enter while loading must not select the previously-highlighted option.
        fireEvent.keyDown(input, { code: "Enter", key: "Enter" });
        expect(onSelect).not.toHaveBeenCalled();
        act(() =>
            resolvePage1?.({ sections: [{ id: "s", label: "S", options: [{ id: "u2", label: "User 2" }] }] }),
        );
        await waitFor(() => expect(screen.getByText("User 2")).toBeInTheDocument());
    });

    it("retries a failed load when reopened with the keyboard", async () => {
        let attempt = 0;
        const loadOptions = vi.fn(() => {
            attempt += 1;
            return attempt === 1
                ? Promise.reject(new Error("nope"))
                : Promise.resolve({
                      sections: [{ id: "s", label: "S", options: [{ id: "u1", label: "Recovered" }] }],
                  });
        });
        renderWithIntl(<UiAutocomplete loadOptions={loadOptions} onSelect={() => {}} debounceMs={0} />);
        const input = screen.getByRole("combobox");
        fireEvent.click(input);
        await waitFor(() =>
            expect(screen.getByText("Could not load options. Please try again.")).toBeInTheDocument(),
        );
        // Close, then reopen via ArrowDown (the keyboard path) — must also retry.
        fireEvent.keyDown(input, { code: "Escape", key: "Escape" });
        fireEvent.keyDown(input, { code: "ArrowDown", key: "ArrowDown" });
        await waitFor(() => expect(screen.getByText("Recovered")).toBeInTheDocument());
    });
});
