// (C) 2026 GoodData Corporation

import { type ComponentProps } from "react";

import { act, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { InMemoryPaging } from "@gooddata/sdk-backend-base";
import { dummyBackend } from "@gooddata/sdk-backend-mockingbird";
import {
    type IAnalyticalBackend,
    type IWorkspaceUsersQuery,
    type IWorkspaceUsersQueryOptions,
} from "@gooddata/sdk-backend-spi";
import { type IAutomationRecipient, type IWorkspaceUser, uriRef } from "@gooddata/sdk-model";
import { BackendProvider, WorkspaceProvider } from "@gooddata/sdk-ui";

import { IntlWrapper } from "../../../../../localization/IntlWrapper.js";
import { RecipientsSelect } from "../RecipientsSelect/RecipientsSelect.js";

/**
 * Debounce window of the user search (see useWorkspaceUsersSearch).
 */
const SEARCH_DEBOUNCE = 300;

/**
 * Debounce window of the screen reader announcement (see UiSearchResultsAnnouncement).
 */
const ANNOUNCEMENT_DEBOUNCE = 1000;

/**
 * Window long enough for any pending debounce to have fired.
 */
const IDLE_WINDOW = 700;

function workspaceUser(login: string, email: string, fullName: string): IWorkspaceUser {
    return {
        ref: uriRef(`/users/${login}`),
        uri: `/users/${login}`,
        login,
        email,
        fullName,
    };
}

function userRecipient(id: string, email: string, name: string): IAutomationRecipient {
    return { id, email, name, type: "user" };
}

function createUsersQueryStub(handler: (options: IWorkspaceUsersQueryOptions) => Promise<IWorkspaceUser[]>) {
    const requests: IWorkspaceUsersQueryOptions[] = [];
    const query: IWorkspaceUsersQuery = {
        withOptions(options: IWorkspaceUsersQueryOptions) {
            requests.push(options);
            return query;
        },
        query: async () => new InMemoryPaging(await handler(requests[requests.length - 1] ?? {})),
        queryAll: () => handler(requests[requests.length - 1] ?? {}),
    };
    return { query, requests };
}

function createBackend(usersQuery: IWorkspaceUsersQuery): IAnalyticalBackend {
    const base = dummyBackend();
    return {
        ...base,
        workspace: (id: string) => ({
            ...base.workspace(id),
            users: () => usersQuery,
        }),
    };
}

function renderComponent(
    backend: IAnalyticalBackend,
    customProps: Partial<ComponentProps<typeof RecipientsSelect>> = {},
) {
    const defaultProps: ComponentProps<typeof RecipientsSelect> = {
        id: "recipients",
        value: [],
        originalValue: [],
        onChange: () => {},
        allowExternalRecipients: true,
    };

    return render(
        <BackendProvider backend={backend}>
            <WorkspaceProvider workspace="ws-1">
                <IntlWrapper>
                    <RecipientsSelect {...defaultProps} {...customProps} />
                </IntlWrapper>
            </WorkspaceProvider>
        </BackendProvider>,
    );
}

function openMenu() {
    const input = screen.getByRole("combobox");
    fireEvent.focus(input);
    fireEvent.keyDown(input, { key: "ArrowDown", code: "ArrowDown" });
}

/**
 * Moves the (fake) clock forward and lets React commit everything that settled meanwhile —
 * fired timers, resolved query promises and the renders they trigger.
 *
 * Waiting is therefore explicit and instant: no debounce is ever awaited in real time and no
 * assertion has to poll for the result.
 */
async function advance(ms: number) {
    await act(() => vi.advanceTimersByTimeAsync(ms));
}

/**
 * Lets the in-flight query promises settle without moving the clock.
 */
function settle() {
    return advance(0);
}

/**
 * Waits out the search debounce and lets the resulting request settle.
 */
function settleSearch() {
    return advance(SEARCH_DEBOUNCE);
}

function searchRequests(requests: IWorkspaceUsersQueryOptions[]) {
    return requests.filter((request) => request.search !== undefined);
}

describe("RecipientsSelect", () => {
    beforeEach(() => {
        vi.useFakeTimers();
    });

    afterEach(() => {
        vi.useRealTimers();
    });

    it("requests a single capped first page of users on menu open and offers them as options", async () => {
        const { query, requests } = createUsersQueryStub(async () => [
            workspaceUser("john.id", "john@example.com", "John Doe"),
            workspaceUser("jane.id", "jane@example.com", "Jane Roe"),
        ]);
        renderComponent(createBackend(query));

        openMenu();
        await settle();

        expect(screen.getByText("John Doe")).toBeInTheDocument();
        expect(screen.getByText("Jane Roe")).toBeInTheDocument();

        expect(requests).toHaveLength(1);
        expect(requests[0].limit).toBe(50);
        expect(requests[0].search).toBeUndefined();
    });

    it("orders the offered users by email", async () => {
        const { query } = createUsersQueryStub(async () => [
            workspaceUser("zoe.id", "anna@example.com", "Zoe Zed"),
            workspaceUser("adam.id", "zach@example.com", "Adam Ant"),
        ]);
        renderComponent(createBackend(query));

        openMenu();
        await settle();

        expect(screen.getByText("Zoe Zed")).toBeInTheDocument();
        const optionTexts = screen
            .getAllByRole("option", { hidden: true })
            .map((option) => option.textContent);
        expect(optionTexts).toHaveLength(2);
        expect(optionTexts[0]).toContain("Zoe Zed");
        expect(optionTexts[1]).toContain("Adam Ant");
    });

    it("issues a single debounced capped search request for the typed text", async () => {
        const john = workspaceUser("john.id", "john@example.com", "John Doe");
        const jane = workspaceUser("jane.id", "jane@example.com", "Jane Roe");
        const { query, requests } = createUsersQueryStub(async ({ search }) =>
            [john, jane].filter((user) => !search || user.fullName!.toLowerCase().includes(search)),
        );
        renderComponent(createBackend(query));

        const input = screen.getByRole("combobox");
        fireEvent.change(input, { target: { value: "j" } });
        fireEvent.change(input, { target: { value: "jo" } });
        fireEvent.change(input, { target: { value: "john" } });

        expect(searchRequests(requests)).toHaveLength(0);

        await settleSearch();

        expect(searchRequests(requests)).toHaveLength(1);
        expect(searchRequests(requests)[0].search).toBe("john");
        expect(searchRequests(requests)[0].limit).toBe(50);

        expect(screen.getByText("John Doe")).toBeInTheDocument();
        expect(screen.queryByText("Jane Roe")).not.toBeInTheDocument();
    });

    it("searches the server even when the typed text equals a selected recipient's id", async () => {
        const { query, requests } = createUsersQueryStub(async () => [
            workspaceUser("john.smith", "john.smith@example.com", "John Smith"),
        ]);
        renderComponent(createBackend(query), {
            value: [userRecipient("john", "john@example.com", "John Doe")],
        });

        fireEvent.change(screen.getByRole("combobox"), { target: { value: "john" } });
        await settleSearch();

        expect(screen.getByText("John Smith")).toBeInTheDocument();
        expect(requests.some((request) => request.search === "john")).toBe(true);
    });

    it("shows the loading indicator instead of stale options while the debounced search is pending", async () => {
        const john = workspaceUser("john.id", "john@example.com", "John Doe");
        const jane = workspaceUser("jane.id", "jane@example.com", "Jane Roe");
        const { query, requests } = createUsersQueryStub(async ({ search }) =>
            [john, jane].filter((user) => !search || user.fullName!.toLowerCase().includes(search)),
        );
        renderComponent(createBackend(query));

        openMenu();
        await settle();
        expect(screen.getByText("John Doe")).toBeInTheDocument();

        fireEvent.change(screen.getByRole("combobox"), { target: { value: "jane" } });

        expect(screen.getByLabelText("loading")).toBeInTheDocument();
        expect(screen.queryByText("John Doe")).not.toBeInTheDocument();
        expect(searchRequests(requests)).toHaveLength(0);

        await settleSearch();

        expect(screen.getByText("Jane Roe")).toBeInTheDocument();
        expect(screen.queryByText("John Doe")).not.toBeInTheDocument();
    });

    it("offers an email matching no user as an external recipient", async () => {
        const { query } = createUsersQueryStub(async () => []);
        renderComponent(createBackend(query));

        const input = screen.getByRole("combobox");
        fireEvent.change(input, { target: { value: "guest@example.com" } });
        await settleSearch();

        expect(screen.getByText("guest@example.com")).toBeInTheDocument();
        expect(screen.getByText("(guest)")).toBeInTheDocument();
    });

    it("offers nothing for an email matching no user when external recipients are disallowed", async () => {
        const { query, requests } = createUsersQueryStub(async () => []);
        renderComponent(createBackend(query), { allowExternalRecipients: false });

        const input = screen.getByRole("combobox");
        fireEvent.change(input, { target: { value: "guest@example.com" } });
        await settleSearch();

        expect(requests.some((request) => request.search === "guest@example.com")).toBe(true);
        expect(screen.getByText("No matching users or groups.")).toBeInTheDocument();
        expect(screen.queryByText("guest@example.com")).not.toBeInTheDocument();
    });

    it("shows a loading indicator in the menu while the search runs", async () => {
        let resolveUsers: (users: IWorkspaceUser[]) => void = () => {};
        const { query } = createUsersQueryStub(
            () =>
                new Promise<IWorkspaceUser[]>((resolve) => {
                    resolveUsers = resolve;
                }),
        );
        renderComponent(createBackend(query));

        openMenu();
        await settle();

        expect(screen.getByLabelText("loading")).toBeInTheDocument();

        resolveUsers([workspaceUser("john.id", "john@example.com", "John Doe")]);
        await settle();

        expect(screen.getByText("John Doe")).toBeInTheDocument();
        expect(screen.queryByLabelText("loading")).not.toBeInTheDocument();
    });

    it("shows an error message when the user search fails", async () => {
        const { query } = createUsersQueryStub(() => Promise.reject(new Error("backend down")));
        renderComponent(createBackend(query));

        openMenu();
        await settle();

        expect(screen.getByText("Error: Unable to load users — try again later.")).toBeInTheDocument();
    });

    it("retries the failed search when the menu is reopened", async () => {
        let attempts = 0;
        const { query, requests } = createUsersQueryStub(() => {
            attempts += 1;
            return attempts === 1
                ? Promise.reject(new Error("backend down"))
                : Promise.resolve([workspaceUser("john.id", "john@example.com", "John Doe")]);
        });
        renderComponent(createBackend(query));

        openMenu();
        await settle();
        expect(screen.getByText("Error: Unable to load users — try again later.")).toBeInTheDocument();

        fireEvent.keyDown(screen.getByRole("combobox"), { key: "Escape", code: "Escape" });
        openMenu();
        await settle();

        expect(screen.getByText("John Doe")).toBeInTheDocument();
        expect(requests).toHaveLength(2);
    });

    it("does not retry a failed search per keystroke, only via the debounced text", async () => {
        let attempts = 0;
        const { query, requests } = createUsersQueryStub(() => {
            attempts += 1;
            return attempts === 1
                ? Promise.reject(new Error("backend down"))
                : Promise.resolve([workspaceUser("john.id", "john@example.com", "John Doe")]);
        });
        renderComponent(createBackend(query));

        openMenu();
        await settle();
        expect(screen.getByText("Error: Unable to load users — try again later.")).toBeInTheDocument();

        const input = screen.getByRole("combobox");
        fireEvent.change(input, { target: { value: "j" } });
        fireEvent.change(input, { target: { value: "jo" } });
        expect(requests).toHaveLength(1);

        await settleSearch();

        expect(screen.getByText("John Doe")).toBeInTheDocument();
        expect(requests).toHaveLength(2);
        expect(requests[1].search).toBe("jo");
    });

    it("issues no request when the menu closes without a typed search", async () => {
        const { query, requests } = createUsersQueryStub(async () => [
            workspaceUser("john.id", "john@example.com", "John Doe"),
        ]);
        renderComponent(createBackend(query));

        openMenu();
        await settle();
        expect(screen.getByText("John Doe")).toBeInTheDocument();

        fireEvent.keyDown(screen.getByRole("combobox"), { key: "Escape", code: "Escape" });
        await advance(IDLE_WINDOW);

        expect(requests).toHaveLength(1);
    });

    it("issues no request in only-me mode and offers only the logged user", async () => {
        const { query, requests } = createUsersQueryStub(async () => [
            workspaceUser("other.id", "other@example.com", "Other User"),
        ]);
        renderComponent(createBackend(query), {
            allowOnlyLoggedUserRecipients: true,
            loggedUser: userRecipient("me.id", "me@example.com", "Me Myself"),
        });

        openMenu();
        await settle();

        expect(screen.getByText("Me Myself")).toBeInTheDocument();
        expect(screen.queryByText("Other User")).not.toBeInTheDocument();
        expect(requests).toHaveLength(0);
    });

    it("filters the logged user out in only-me mode when the typed text does not match", async () => {
        const { query, requests } = createUsersQueryStub(async () => [
            workspaceUser("other.id", "other@example.com", "Other User"),
        ]);
        renderComponent(createBackend(query), {
            allowOnlyLoggedUserRecipients: true,
            loggedUser: userRecipient("me.id", "me@example.com", "Me Myself"),
        });

        openMenu();
        await settle();
        expect(screen.getByText("Me Myself")).toBeInTheDocument();

        fireEvent.change(screen.getByRole("combobox"), { target: { value: "nobody" } });
        await settle();

        expect(screen.getByText("No matching users or groups.")).toBeInTheDocument();
        expect(screen.queryByText("Me Myself")).not.toBeInTheDocument();
        expect(requests).toHaveLength(0);
    });

    it("announces the settled search results to screen readers", async () => {
        const john = workspaceUser("john.id", "john@example.com", "John Doe");
        const jane = workspaceUser("jane.id", "jane@example.com", "Jane Roe");
        const { query } = createUsersQueryStub(async ({ search }) =>
            [john, jane].filter((user) => !search || user.fullName!.toLowerCase().includes(search)),
        );
        renderComponent(createBackend(query));

        expect(screen.getByRole("status")).toBeEmptyDOMElement();

        openMenu();
        fireEvent.change(screen.getByRole("combobox"), { target: { value: "john" } });

        await settleSearch();
        expect(screen.getByText("John Doe")).toBeInTheDocument();

        await advance(ANNOUNCEMENT_DEBOUNCE);
        expect(screen.getByRole("status")).toHaveTextContent("1 result: John Doe");
    });

    it("discards a stale response resolving after a newer search", async () => {
        let resolveFirstPage: (users: IWorkspaceUser[]) => void = () => {};
        const { query, requests } = createUsersQueryStub(({ search }) =>
            search
                ? Promise.resolve([workspaceUser("john.id", "john@example.com", "John Doe")])
                : new Promise<IWorkspaceUser[]>((resolve) => {
                      resolveFirstPage = resolve;
                  }),
        );
        renderComponent(createBackend(query));

        openMenu();
        await settle();
        expect(requests).toHaveLength(1);

        fireEvent.change(screen.getByRole("combobox"), { target: { value: "john" } });
        await settleSearch();
        expect(screen.getByText("John Doe")).toBeInTheDocument();

        resolveFirstPage([workspaceUser("stale.id", "stale@example.com", "Stale User")]);
        await settle();

        expect(screen.queryByText("Stale User")).not.toBeInTheDocument();
        expect(screen.getByText("John Doe")).toBeInTheDocument();
    });
});
