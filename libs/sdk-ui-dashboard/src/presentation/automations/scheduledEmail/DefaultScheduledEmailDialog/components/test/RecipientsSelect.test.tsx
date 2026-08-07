// (C) 2026 GoodData Corporation

import { type ComponentProps } from "react";

import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it } from "vitest";

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

describe("RecipientsSelect", () => {
    it("requests a single capped first page of users on menu open and offers them as options", async () => {
        const { query, requests } = createUsersQueryStub(async () => [
            workspaceUser("john.id", "john@example.com", "John Doe"),
            workspaceUser("jane.id", "jane@example.com", "Jane Roe"),
        ]);
        renderComponent(createBackend(query));

        openMenu();

        expect(await screen.findByText("John Doe")).toBeInTheDocument();
        expect(screen.getByText("Jane Roe")).toBeInTheDocument();

        await waitFor(() => {
            expect(requests).toHaveLength(1);
        });
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

        expect(await screen.findByText("Zoe Zed")).toBeInTheDocument();
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

        await waitFor(
            () => {
                expect(requests.filter((request) => request.search !== undefined)).toHaveLength(1);
            },
            { timeout: 3000 },
        );
        const searchRequest = requests.find((request) => request.search !== undefined)!;
        expect(searchRequest.search).toBe("john");
        expect(searchRequest.limit).toBe(50);

        expect(await screen.findByText("John Doe")).toBeInTheDocument();
        await waitFor(() => {
            expect(screen.queryByText("Jane Roe")).not.toBeInTheDocument();
        });
    });

    it("searches the server even when the typed text equals a selected recipient's id", async () => {
        const { query, requests } = createUsersQueryStub(async () => [
            workspaceUser("john.smith", "john.smith@example.com", "John Smith"),
        ]);
        renderComponent(createBackend(query), {
            value: [userRecipient("john", "john@example.com", "John Doe")],
        });

        fireEvent.change(screen.getByRole("combobox"), { target: { value: "john" } });

        expect(await screen.findByText("John Smith", undefined, { timeout: 3000 })).toBeInTheDocument();
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
        expect(await screen.findByText("John Doe")).toBeInTheDocument();

        fireEvent.change(screen.getByRole("combobox"), { target: { value: "jane" } });

        expect(screen.getByLabelText("loading")).toBeInTheDocument();
        expect(screen.queryByText("John Doe")).not.toBeInTheDocument();
        expect(requests.filter((request) => request.search !== undefined)).toHaveLength(0);

        expect(await screen.findByText("Jane Roe", undefined, { timeout: 3000 })).toBeInTheDocument();
        expect(screen.queryByText("John Doe")).not.toBeInTheDocument();
    });

    it("offers an email matching no user as an external recipient", async () => {
        const { query } = createUsersQueryStub(async () => []);
        renderComponent(createBackend(query));

        const input = screen.getByRole("combobox");
        fireEvent.change(input, { target: { value: "guest@example.com" } });

        expect(
            await screen.findByText("guest@example.com", undefined, { timeout: 3000 }),
        ).toBeInTheDocument();
        expect(screen.getByText("(guest)")).toBeInTheDocument();
    });

    it("offers nothing for an email matching no user when external recipients are disallowed", async () => {
        const { query, requests } = createUsersQueryStub(async () => []);
        renderComponent(createBackend(query), { allowExternalRecipients: false });

        const input = screen.getByRole("combobox");
        fireEvent.change(input, { target: { value: "guest@example.com" } });

        await waitFor(
            () => {
                expect(requests.some((request) => request.search === "guest@example.com")).toBe(true);
            },
            { timeout: 3000 },
        );
        await waitFor(() => {
            expect(screen.getByText("No matching users or groups.")).toBeInTheDocument();
        });
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

        expect(await screen.findByLabelText("loading")).toBeInTheDocument();

        resolveUsers([workspaceUser("john.id", "john@example.com", "John Doe")]);

        expect(await screen.findByText("John Doe")).toBeInTheDocument();
        expect(screen.queryByLabelText("loading")).not.toBeInTheDocument();
    });

    it("shows an error message when the user search fails", async () => {
        const { query } = createUsersQueryStub(() => Promise.reject(new Error("backend down")));
        renderComponent(createBackend(query));

        openMenu();

        expect(await screen.findByText("Error: Unable to load users — try again later.")).toBeInTheDocument();
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
        expect(await screen.findByText("Error: Unable to load users — try again later.")).toBeInTheDocument();

        fireEvent.keyDown(screen.getByRole("combobox"), { key: "Escape", code: "Escape" });
        openMenu();

        expect(await screen.findByText("John Doe")).toBeInTheDocument();
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
        expect(await screen.findByText("Error: Unable to load users — try again later.")).toBeInTheDocument();

        const input = screen.getByRole("combobox");
        fireEvent.change(input, { target: { value: "j" } });
        fireEvent.change(input, { target: { value: "jo" } });
        expect(requests).toHaveLength(1);

        expect(await screen.findByText("John Doe", undefined, { timeout: 3000 })).toBeInTheDocument();
        expect(requests).toHaveLength(2);
        expect(requests[1].search).toBe("jo");
    });

    it("issues no request when the menu closes without a typed search", async () => {
        const { query, requests } = createUsersQueryStub(async () => [
            workspaceUser("john.id", "john@example.com", "John Doe"),
        ]);
        renderComponent(createBackend(query));

        openMenu();
        expect(await screen.findByText("John Doe")).toBeInTheDocument();

        fireEvent.keyDown(screen.getByRole("combobox"), { key: "Escape", code: "Escape" });
        await new Promise((resolve) => setTimeout(resolve, 700));

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

        expect(await screen.findByText("Me Myself")).toBeInTheDocument();
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
        expect(await screen.findByText("Me Myself")).toBeInTheDocument();

        fireEvent.change(screen.getByRole("combobox"), { target: { value: "nobody" } });

        expect(await screen.findByText("No matching users or groups.")).toBeInTheDocument();
        await waitFor(() => {
            expect(screen.queryByText("Me Myself")).not.toBeInTheDocument();
        });
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

        expect(await screen.findByText("John Doe", undefined, { timeout: 3000 })).toBeInTheDocument();
        await waitFor(
            () => {
                expect(screen.getByRole("status")).toHaveTextContent("1 result: John Doe");
            },
            { timeout: 3000 },
        );
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
        await waitFor(() => {
            expect(requests).toHaveLength(1);
        });
        fireEvent.change(screen.getByRole("combobox"), { target: { value: "john" } });

        expect(await screen.findByText("John Doe", undefined, { timeout: 3000 })).toBeInTheDocument();

        resolveFirstPage([workspaceUser("stale.id", "stale@example.com", "Stale User")]);
        await new Promise((resolve) => setTimeout(resolve, 50));

        expect(screen.queryByText("Stale User")).not.toBeInTheDocument();
        expect(screen.getByText("John Doe")).toBeInTheDocument();
    });
});
