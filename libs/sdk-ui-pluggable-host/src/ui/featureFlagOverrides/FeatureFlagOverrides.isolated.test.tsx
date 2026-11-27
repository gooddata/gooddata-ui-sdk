// (C) 2026 GoodData Corporation

import { act, screen, waitFor, within } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, onTestFinished, vi } from "vitest";

import {
    FEATURE_FLAG_OVERRIDES_STORAGE_KEY,
    type FeatureFlagOverrideRule,
    type IStaleFeatureFlagOverrideRule,
    type ITigerFeatureFlags,
    LocalFeatureFlagOverrides,
} from "@gooddata/sdk-backend-tiger";
import { type IEarlyAccessFeaturesConfig, type IUserSettings } from "@gooddata/sdk-model";

import { render } from "../../../test/render.js";

import {
    FeatureFlagOverridesPanel,
    type IFeatureFlagOverridesPanelProps,
} from "./FeatureFlagOverridesPanel.js";
import { FeatureFlagScopeDropdown } from "./FeatureFlagScopeDropdown.js";

const { getDescriptor, getServerFeatureFlags } = vi.hoisted(() => ({
    getDescriptor: vi.fn<(id: string) => Promise<{ title: string }>>(),
    getServerFeatureFlags: vi.fn<(workspaceId?: string) => Partial<ITigerFeatureFlags> | undefined>(),
}));

vi.mock("@gooddata/sdk-backend-tiger", async (importOriginal) => ({
    ...(await importOriginal<typeof import("@gooddata/sdk-backend-tiger")>()),
    getServerFeatureFlags,
}));

vi.mock("../../platformContext/backend.js", () => ({
    getBackend: () => ({ workspace: (id: string) => ({ getDescriptor: () => getDescriptor(id) }) }),
}));

beforeEach(() => {
    getDescriptor.mockImplementation(() => new Promise(() => {}));
});

const userSettings: IUserSettings = {
    userId: "jane",
    locale: "en-US",
    separators: { thousand: ",", decimal: "." },
    enableFeatureFlagOverrides: true,
    enableRadarChart: false,
};

const panelProps = {
    stored: { rules: [], staleRules: [] },
    context: { organizationId: "org", workspaceId: "ws", userId: "jane" },
    settings: userSettings,
    userName: "Jane Doe",
    onClose: () => {},
    onApplied: () => {},
} satisfies IFeatureFlagOverridesPanelProps;

const storedRules = (rules: FeatureFlagOverrideRule[]) => ({ rules, staleRules: [] });

const readStoredRules = (): unknown =>
    JSON.parse(localStorage.getItem(FEATURE_FLAG_OVERRIDES_STORAGE_KEY) ?? "null")?.rules;

const findRow = async (text: string) => {
    const row = (await screen.findAllByText(text))
        .map((element) => element.closest("li"))
        .find(
            (item) =>
                item?.closest(".gd-feature-flag-overrides__rows") &&
                !item.classList.contains("gd-feature-flag-overrides__row--other"),
        );
    if (!row) {
        throw new Error(`No row with ${text}`);
    }
    return within(row);
};

const findGroupHeadingOf = async (flag: string) =>
    (await screen.findByText(flag)).closest("section")?.querySelector(".gd-ui-kit-section-heading")
        ?.textContent;

const expectBadgeAfterName = (flag: string, text: string) => {
    const badge = screen.getByText(text);
    const name = screen.getByText(flag);
    expect(badge).toHaveClass("gd-ui-kit-badge");
    expect(badge.closest(".gd-feature-flag-overrides__name")).toBe(name.parentElement);
    expect(name.compareDocumentPosition(badge) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
    expect(badge.closest("li")?.querySelector(".gd-feature-flag-overrides__hint")).toBeNull();
};

const findGroupRows = async (heading: string) => {
    const section = (await screen.findByText(heading)).closest("section");
    if (!section) {
        throw new Error(`No group ${heading}`);
    }
    return [...section.querySelectorAll("li")];
};

const findOtherPageRows = async (count: number) =>
    (await findGroupRows(`On other pages · ${count}`)).map((row) => within(row));

const getGroupHeadings = () =>
    [...document.querySelectorAll(".gd-feature-flag-overrides__group-heading")].map(
        (heading) => heading.textContent,
    );

const getCell = (row: HTMLElement, cell: "value-text" | "scope-text" | "conditions") =>
    row.querySelector(`.gd-feature-flag-overrides__${cell}`);

const getConditionTexts = (row: ReturnType<typeof within>) =>
    row
        .getAllByText((_content: string, element: Element | null) =>
            Boolean(element?.classList.contains("gd-feature-flag-overrides__condition")),
        )
        .map((element: HTMLElement) => element.textContent);

const countDescriptorCalls = (workspaceId: string) =>
    getDescriptor.mock.calls.filter(([id]) => id === workspaceId).length;

const resolveWorkspaceTitles = (titles: Record<string, string>) => {
    getDescriptor.mockImplementation((id) =>
        id in titles ? Promise.resolve({ title: titles[id] }) : new Promise(() => {}),
    );
};

const apply = async (user: ReturnType<typeof render>["user"]) => {
    await user.click(screen.getByRole("button", { name: "Apply & reload" }));
};

afterEach(() => {
    vi.restoreAllMocks();
    localStorage.clear();
});

describe("FeatureFlagOverridesPanel", () => {
    it("warns that overrides change only the frontend", async () => {
        render(<FeatureFlagOverridesPanel {...panelProps} />);

        expect(
            await screen.findByText(/The backend keeps the server values, so a mismatch can cause errors\./),
        ).toBeVisible();
    });

    it("does not offer the gate flag", async () => {
        render(<FeatureFlagOverridesPanel {...panelProps} />);

        await screen.findByRole("dialog");
        expect(screen.queryByText("enableFeatureFlagOverrides")).not.toBeInTheDocument();
    });

    describe("toolbar", () => {
        it("filters flags by name and switches to the overridden ones", async () => {
            const { user } = render(
                <FeatureFlagOverridesPanel
                    {...panelProps}
                    stored={storedRules([{ flag: "enableMekkoChart", value: true }])}
                />,
            );
            const all = await screen.findByRole("button", { name: /^All flags/ });
            const overridden = screen.getByRole("button", { name: /^Overridden/ });

            expect(all).toHaveAttribute("aria-pressed", "true");
            await user.type(screen.getByRole("searchbox", { name: "Search flags" }), "chart");
            expect(screen.getByText("enableRadarChart")).toBeVisible();
            expect(screen.queryByText("enableChangeAnalysis")).not.toBeInTheDocument();

            await user.click(overridden);
            expect(overridden).toHaveAttribute("aria-pressed", "true");
            expect(all).toHaveAttribute("aria-pressed", "false");
            expect(screen.getByText("enableMekkoChart")).toBeVisible();
            expect(screen.queryByText("enableRadarChart")).not.toBeInTheDocument();
        });

        it("starts on the overridden flags when asked to", async () => {
            render(<FeatureFlagOverridesPanel {...panelProps} initialOverriddenOnly />);

            expect(await screen.findByRole("button", { name: /^Overridden/ })).toHaveAttribute(
                "aria-pressed",
                "true",
            );
        });

        it("counts all flags and the overridden ones live", async () => {
            const { user } = render(<FeatureFlagOverridesPanel {...panelProps} />);
            const overridden = await screen.findByRole("button", { name: /^Overridden/ });

            expect(overridden).toHaveTextContent("Overridden(0)");
            const row = await findRow("enableRadarChart");
            await user.click(row.getByRole("checkbox", { name: "Value of enableRadarChart" }));
            expect(overridden).toHaveTextContent("Overridden(1)");
        });
    });

    describe("scope", () => {
        const openScopes = async (user: ReturnType<typeof render>["user"], flag: string) => {
            await user.click((await findRow(flag)).getByRole("button", { name: /applies to/ }));
            return screen.findByRole("listbox", { name: `Where ${flag} is overridden` });
        };
        const pickOption = async (
            user: ReturnType<typeof render>["user"],
            { listbox, name }: { listbox: HTMLElement; name: string },
        ) => {
            const item = within(listbox).getByRole("option", { name }).firstElementChild;
            if (!(item instanceof HTMLElement)) {
                throw new Error(`No item in the option ${name}`);
            }
            await user.click(item);
        };
        const userToggle = (row: Awaited<ReturnType<typeof findRow>>) =>
            row.getByRole("button", { name: "Only when signed in as Jane Doe" });

        it("labels the trigger with the short scope and the full scope for screen readers", async () => {
            render(
                <FeatureFlagOverridesPanel
                    {...panelProps}
                    stored={storedRules([
                        { flag: "enableRadarChart", value: true },
                        { flag: "enableMekkoChart", value: true, organizationId: "org" },
                        { flag: "aiChatSearchLimit", value: 3, organizationId: "org", workspaceId: "ws" },
                    ])}
                />,
            );
            const trigger = async (flag: string, name: string) =>
                (await findRow(flag)).getByRole("button", { name: `${flag} applies to: ${name}` });

            expect(await trigger("enableRadarChart", "Everywhere")).toHaveTextContent(/^Everywhere$/);
            expect(await trigger("enableMekkoChart", "This organization")).toHaveTextContent(
                /^Organization$/,
            );
            expect(await trigger("aiChatSearchLimit", "This workspace")).toHaveTextContent(/^Workspace$/);
            expect(await trigger("aiChatSearchLimit", "This workspace")).toHaveAttribute(
                "aria-haspopup",
                "listbox",
            );
        });

        it("joins the trigger and the user toggle into one group", async () => {
            render(
                <FeatureFlagOverridesPanel
                    {...panelProps}
                    stored={storedRules([{ flag: "enableRadarChart", value: true }])}
                />,
            );
            const row = await findRow("enableRadarChart");
            const group = row.getByRole("group", { name: "enableRadarChart applies to" });
            const trigger = within(group).getByRole("button", { name: /applies to/ });

            expect(group.firstElementChild).toContainElement(trigger);
            expect(group.lastElementChild).toContainElement(userToggle(row));
            expect(trigger.querySelector("svg:last-of-type")).toHaveClass("gd-ui-kit-icon--disableAnimation");
        });

        it("starts a new override everywhere and moves it with the selected option", async () => {
            const onApplied = vi.fn();
            const { user } = render(<FeatureFlagOverridesPanel {...panelProps} onApplied={onApplied} />);
            const row = await findRow("enableRadarChart");

            expect(row.queryByRole("button", { name: /applies to/ })).not.toBeInTheDocument();
            await user.click(row.getByRole("checkbox", { name: "Value of enableRadarChart" }));
            const listbox = await openScopes(user, "enableRadarChart");
            await pickOption(user, { listbox, name: "Workspace (ws)" });

            await waitFor(() => expect(screen.queryByRole("listbox")).not.toBeInTheDocument());
            expect(
                row.getByRole("button", { name: "enableRadarChart applies to: This workspace" }),
            ).toBeVisible();
            await apply(user);
            expect(readStoredRules()).toEqual([
                { flag: "enableRadarChart", value: true, organizationId: "org", workspaceId: "ws" },
            ]);
            expect(onApplied).toHaveBeenCalledOnce();
        });

        it("replaces the rule already at the scope it moves to", async () => {
            const { user } = render(
                <FeatureFlagOverridesPanel
                    {...panelProps}
                    stored={storedRules([
                        { flag: "aiChatSearchLimit", value: 1 },
                        { flag: "aiChatSearchLimit", value: 5, organizationId: "org" },
                    ])}
                />,
            );

            const listbox = await openScopes(user, "aiChatSearchLimit");
            await pickOption(user, { listbox, name: "Everywhere" });
            await apply(user);

            expect(readStoredRules()).toEqual([{ flag: "aiChatSearchLimit", value: 5 }]);
        });

        it("disables an option where a more specific override would win, says why and keeps it", async () => {
            const { user } = render(
                <FeatureFlagOverridesPanel
                    {...panelProps}
                    stored={storedRules([
                        { flag: "aiChatSearchLimit", value: 1, organizationId: "org" },
                        { flag: "aiChatSearchLimit", value: 2, organizationId: "org", workspaceId: "ws" },
                    ])}
                />,
            );
            const row = await findRow("aiChatSearchLimit");

            const listbox = await openScopes(user, "aiChatSearchLimit");
            const everywhere = within(listbox).getByRole("option", { name: /^Everywhere/ });

            expect(everywhere).toHaveAttribute("aria-disabled", "true");
            expect(everywhere).toHaveTextContent("Another override would apply instead.");
            expect(within(listbox).getByRole("option", { name: "Organization (org)" })).not.toHaveAttribute(
                "aria-disabled",
                "true",
            );

            await user.keyboard("{Home}");
            expect(listbox).toHaveAttribute("aria-activedescendant", everywhere.id);
            expect(everywhere.firstElementChild).toHaveClass(
                "gd-ui-kit-listbox__item--isFocused",
                "gd-ui-kit-listbox__item--isDisabled",
            );
            expect(everywhere.querySelector(".gd-ui-kit-listbox__item-explanation")).toBeInTheDocument();
            await user.keyboard("{Enter}");
            await user.click(everywhere);

            expect(screen.getByRole("listbox")).toBe(listbox);
            expect(
                row.getByRole("button", { name: "aiChatSearchLimit applies to: This workspace" }),
            ).toBeVisible();
        });

        it("offers no workspace option outside a workspace", async () => {
            const { user } = render(
                <FeatureFlagOverridesPanel
                    {...panelProps}
                    context={{ organizationId: "org", userId: "jane" }}
                    stored={storedRules([{ flag: "enableRadarChart", value: true }])}
                />,
            );

            const listbox = await openScopes(user, "enableRadarChart");

            expect(within(listbox).getByRole("option", { name: "Organization (org)" })).toBeVisible();
            expect(within(listbox).queryByRole("option", { name: /^Workspace/ })).not.toBeInTheDocument();
        });

        it("closes only the list on Escape", async () => {
            const onClose = vi.fn();
            const { user } = render(
                <FeatureFlagOverridesPanel
                    {...panelProps}
                    onClose={onClose}
                    stored={storedRules([{ flag: "enableRadarChart", value: true }])}
                />,
            );

            await openScopes(user, "enableRadarChart");
            await user.keyboard("{Escape}");

            await waitFor(() => expect(screen.queryByRole("listbox")).not.toBeInTheDocument());
            expect(onClose).not.toHaveBeenCalled();
            expect(screen.getByRole("dialog", { name: "Feature flag overrides" })).toBeVisible();
        });

        it("names the options by their IDs while the workspace title loads", async () => {
            const { user } = render(
                <FeatureFlagOverridesPanel
                    {...panelProps}
                    stored={storedRules([{ flag: "enableRadarChart", value: true }])}
                />,
            );

            const listbox = await openScopes(user, "enableRadarChart");

            expect(within(listbox).getByRole("option", { name: "Organization (org)" })).toBeVisible();
            expect(within(listbox).getByRole("option", { name: "Workspace (ws)" })).toBeVisible();
        });

        it("names the options by the organization and workspace names", async () => {
            getDescriptor.mockResolvedValue({ title: "Sales demo" });
            const { user } = render(
                <FeatureFlagOverridesPanel
                    {...panelProps}
                    organizationTitle="Acme"
                    stored={storedRules([{ flag: "enableRadarChart", value: true }])}
                />,
            );

            const listbox = await openScopes(user, "enableRadarChart");

            expect(getDescriptor).toHaveBeenCalledWith("ws");
            const organization = within(listbox).getByRole("option", { name: "Organization (Acme)" });
            expect(organization).toHaveTextContent("Organization (Acme)");
            expect(within(organization).getByText("Organization")).toHaveClass(
                "gd-feature-flag-overrides__option-label",
            );
            expect(within(organization).getByText("(Acme)")).toHaveClass(
                "gd-feature-flag-overrides__option-name",
            );
            expect(within(listbox).getByRole("option", { name: "Everywhere" }).firstElementChild).toHaveClass(
                "gd-ui-kit-listbox__item--isSelected",
                "gd-ui-kit-listbox__item--isCompact",
            );
            expect(
                await within(listbox).findByRole("option", { name: "Workspace (Sales demo)" }),
            ).toBeVisible();
        });

        it("keeps the workspace ID when its title fails to load", async () => {
            getDescriptor.mockRejectedValue(new Error("offline"));
            const { user } = render(
                <FeatureFlagOverridesPanel
                    {...panelProps}
                    stored={storedRules([{ flag: "enableRadarChart", value: true }])}
                />,
            );

            await waitFor(() => expect(getDescriptor).toHaveBeenCalled());
            await act(() => Promise.resolve());
            const listbox = await openScopes(user, "enableRadarChart");

            expect(within(listbox).getByRole("option", { name: "Workspace (ws)" })).toBeVisible();
        });

        it("limits the override to the signed-in user", async () => {
            const { user } = render(
                <FeatureFlagOverridesPanel
                    {...panelProps}
                    stored={storedRules([{ flag: "enableRadarChart", value: true, organizationId: "org" }])}
                />,
            );
            const toggle = userToggle(await findRow("enableRadarChart"));

            expect(toggle).toHaveAttribute("aria-pressed", "false");
            await user.click(toggle);
            expect(toggle).toHaveAttribute("aria-pressed", "true");
            await apply(user);

            expect(readStoredRules()).toEqual([
                { flag: "enableRadarChart", value: true, organizationId: "org", userId: "jane" },
            ]);
        });

        it("lifts the limit to the signed-in user", async () => {
            const { user } = render(
                <FeatureFlagOverridesPanel
                    {...panelProps}
                    stored={storedRules([{ flag: "enableRadarChart", value: true, userId: "jane" }])}
                />,
            );
            const toggle = userToggle(await findRow("enableRadarChart"));

            expect(toggle).toHaveAttribute("aria-pressed", "true");
            await user.click(toggle);
            expect(toggle).toHaveAttribute("aria-pressed", "false");
            await apply(user);

            expect(readStoredRules()).toEqual([{ flag: "enableRadarChart", value: true }]);
        });

        it("disables the toggle when another rule at the same level would win, and says why", async () => {
            render(
                <FeatureFlagOverridesPanel
                    {...panelProps}
                    stored={storedRules([
                        {
                            flag: "enableRadarChart",
                            value: true,
                            organizationId: "org",
                            workspaceId: "ws",
                            userId: "jane",
                        },
                        { flag: "enableRadarChart", value: false, workspaceId: "ws" },
                        { flag: "enableRadarChart", value: true, organizationId: "org", workspaceId: "ws" },
                    ])}
                />,
            );
            const toggle = userToggle(await findRow("enableRadarChart"));

            expect(toggle).toHaveAttribute("aria-pressed", "false");
            expect(toggle).toBeDisabled();
            expect(toggle).toHaveAccessibleDescription("Another override would apply instead.");
        });

        it("explains a disabled toggle", async () => {
            const onTargetChange = vi.fn();
            const { user } = render(
                <FeatureFlagScopeDropdown
                    flag="enableRadarChart"
                    target={{ scope: "workspace", onlyMe: false }}
                    scopes={["everywhere", "organization", "workspace"]}
                    scopeNames={{ organization: "org", workspace: "ws" }}
                    userName="Jane Doe"
                    isEffectiveTarget={(target) => !target.onlyMe}
                    onTargetChange={onTargetChange}
                />,
            );
            const toggle = screen.getByRole("button", { name: "Only when signed in as Jane Doe" });

            expect(toggle).toBeDisabled();
            expect(toggle).toHaveAccessibleDescription("Another override would apply instead.");
            // happy-dom sends no pointer events to a disabled button; Chrome does, to its wrapper too.
            const tooltipAnchor = toggle.closest(".gd-ui-kit-tooltip__anchor");
            if (!(tooltipAnchor instanceof HTMLElement)) {
                throw new Error("The toggle has no tooltip anchor");
            }
            await user.hover(tooltipAnchor);
            await waitFor(() =>
                expect(screen.getAllByText("Another override would apply instead.")).toHaveLength(2),
            );
            await user.click(toggle);
            expect(onTargetChange).not.toHaveBeenCalled();
        });

        it("keeps the same trigger and toggle across picking an option and toggling", async () => {
            const { user } = render(
                <FeatureFlagOverridesPanel
                    {...panelProps}
                    stored={storedRules([{ flag: "enableRadarChart", value: true }])}
                />,
            );
            const row = await findRow("enableRadarChart");
            const trigger = row.getByRole("button", { name: /applies to/ });
            const toggle = userToggle(row);

            const listbox = await openScopes(user, "enableRadarChart");
            expect(row.getByRole("button", { name: /applies to/ })).toBe(trigger);
            expect(userToggle(row)).toBe(toggle);
            await pickOption(user, { listbox, name: "Organization (org)" });
            await user.click(toggle);

            expect(row.getByRole("button", { name: "enableRadarChart applies to: This organization" })).toBe(
                trigger,
            );
            expect(userToggle(row)).toBe(toggle);
            expect(toggle).toHaveAttribute("aria-pressed", "true");
        });
    });

    describe("values", () => {
        it("edits the rule that applies and keeps rules for other contexts", async () => {
            const otherOrganizationRule: FeatureFlagOverrideRule = {
                flag: "aiChatSearchLimit",
                value: 1,
                organizationId: "other",
            };
            const { user } = render(
                <FeatureFlagOverridesPanel
                    {...panelProps}
                    stored={storedRules([
                        otherOrganizationRule,
                        { flag: "aiChatSearchLimit", value: 5, organizationId: "org" },
                    ])}
                />,
            );
            const input = (await findRow("aiChatSearchLimit")).getByRole("textbox", {
                name: "Value of aiChatSearchLimit",
            });

            expect(input).toHaveValue("5");
            await user.clear(input);
            await user.type(input, "12");
            await apply(user);

            expect(readStoredRules()).toEqual([
                otherOrganizationRule,
                { flag: "aiChatSearchLimit", value: 12, organizationId: "org" },
            ]);
        });

        it("explains a number that does not parse and blocks applying until it is fixed", async () => {
            const { user } = render(<FeatureFlagOverridesPanel {...panelProps} />);
            const input = (await findRow("aiChatSearchLimit")).getByRole("textbox", {
                name: "Value of aiChatSearchLimit",
            });

            await user.type(input, "12a");
            expect(input).toHaveAccessibleDescription("Enter a number");
            expect(screen.getByText("Fix or reset the invalid values to apply.")).toBeVisible();
            expect(screen.getByRole("button", { name: "Apply & reload" })).toBeDisabled();

            await user.type(input, "{Backspace}");
            await apply(user);
            expect(readStoredRules()).toEqual([{ flag: "aiChatSearchLimit", value: 12 }]);
        });

        it("keeps a cleared override listed among the overridden flags", async () => {
            const { user } = render(
                <FeatureFlagOverridesPanel
                    {...panelProps}
                    initialOverriddenOnly
                    stored={storedRules([{ flag: "aiChatSearchLimit", value: 5 }])}
                />,
            );
            const input = (await findRow("aiChatSearchLimit")).getByRole("textbox", {
                name: "Value of aiChatSearchLimit",
            });

            await user.clear(input);

            expect(input).toBeVisible();
            expect(screen.getByRole("button", { name: "Apply & reload" })).toBeDisabled();
        });

        it("keeps the rule order while a value goes through an invalid state", async () => {
            const { user } = render(
                <FeatureFlagOverridesPanel
                    {...panelProps}
                    stored={storedRules([
                        { flag: "aiChatSearchLimit", value: 1, organizationId: "org" },
                        { flag: "aiChatSearchLimit", value: 2, organizationId: "org", userId: "jane" },
                    ])}
                />,
            );
            const input = (await findRow("aiChatSearchLimit")).getByRole("textbox", {
                name: "Value of aiChatSearchLimit",
            });

            await user.type(input, "a");
            await user.type(input, "{Backspace}3");
            await apply(user);

            expect(readStoredRules()).toEqual([
                { flag: "aiChatSearchLimit", value: 1, organizationId: "org" },
                { flag: "aiChatSearchLimit", value: 23, organizationId: "org", userId: "jane" },
            ]);
        });

        it("keeps an invalid row visible when the search does not match it", async () => {
            const { user } = render(<FeatureFlagOverridesPanel {...panelProps} />);
            const input = (await findRow("aiChatSearchLimit")).getByRole("textbox", {
                name: "Value of aiChatSearchLimit",
            });

            await user.type(input, "12a");
            await user.type(screen.getByRole("searchbox", { name: "Search flags" }), "radar");

            expect(input).toBeVisible();
            expect(input).toHaveValue("12a");
        });

        it("edits a workspace rule that has no organization in place", async () => {
            const { user } = render(
                <FeatureFlagOverridesPanel
                    {...panelProps}
                    stored={storedRules([{ flag: "enableRadarChart", value: true, workspaceId: "ws" }])}
                />,
            );

            await user.click(
                (await findRow("enableRadarChart")).getByRole("checkbox", {
                    name: "Value of enableRadarChart",
                }),
            );
            await apply(user);

            expect(readStoredRules()).toEqual([
                { flag: "enableRadarChart", value: false, workspaceId: "ws" },
            ]);
        });

        it("resets a workspace rule that has no organization", async () => {
            const { user } = render(
                <FeatureFlagOverridesPanel
                    {...panelProps}
                    stored={storedRules([{ flag: "enableRadarChart", value: true, workspaceId: "ws" }])}
                />,
            );

            await user.click(
                (await findRow("enableRadarChart")).getByRole("button", {
                    name: "Remove override of enableRadarChart",
                }),
            );
            await apply(user);

            expect(localStorage.getItem(FEATURE_FLAG_OVERRIDES_STORAGE_KEY)).toBeNull();
        });

        it("resets an override", async () => {
            const { user } = render(
                <FeatureFlagOverridesPanel
                    {...panelProps}
                    stored={storedRules([{ flag: "enableRadarChart", value: true }])}
                />,
            );

            await user.click(
                (await findRow("enableRadarChart")).getByRole("button", {
                    name: "Remove override of enableRadarChart",
                }),
            );
            await apply(user);

            expect(localStorage.getItem(FEATURE_FLAG_OVERRIDES_STORAGE_KEY)).toBeNull();
        });

        it("discards an invalid value on a flag without an override", async () => {
            const { user } = render(<FeatureFlagOverridesPanel {...panelProps} />);
            const row = await findRow("aiChatSearchLimit");
            const input = row.getByRole("textbox", { name: "Value of aiChatSearchLimit" });

            await user.type(input, "a");
            await user.click(row.getByRole("button", { name: "Discard invalid value of aiChatSearchLimit" }));

            expect(input).toHaveValue("");
            await apply(user);
            expect(localStorage.getItem(FEATURE_FLAG_OVERRIDES_STORAGE_KEY)).toBeNull();
        });

        it("locks flags that are set in code", async () => {
            LocalFeatureFlagOverrides.enableRadarChart = true;
            onTestFinished(() => {
                delete LocalFeatureFlagOverrides.enableRadarChart;
            });

            render(
                <FeatureFlagOverridesPanel
                    {...panelProps}
                    settings={{ ...userSettings, enableRadarChart: true }}
                />,
            );
            const row = await findRow("enableRadarChart");
            const checkbox = row.getByRole("checkbox", { name: "Value of enableRadarChart" });

            expect(row.getByText("Set in code")).toBeVisible();
            expect(row.queryByRole("button", { name: "Set in code" })).not.toBeInTheDocument();
            expect(checkbox).toBeDisabled();
            expect(checkbox).toBeChecked();
            expect(checkbox).toHaveAccessibleDescription(
                "A developer set this flag in the code, so overrides have no effect.",
            );
            expect(row.getByText("Fixed in code")).toBeVisible();
            expect(row.queryByText(/Saved overrides/)).not.toBeInTheDocument();
            expect(row.queryByRole("button", { name: /Remove|Discard/ })).not.toBeInTheDocument();
        });

        it("points out saved overrides of a flag set in code and resets those on this page", async () => {
            LocalFeatureFlagOverrides.enableRadarChart = true;
            onTestFinished(() => {
                delete LocalFeatureFlagOverrides.enableRadarChart;
            });
            const { user } = render(
                <FeatureFlagOverridesPanel
                    {...panelProps}
                    settings={{ ...userSettings, enableRadarChart: true }}
                    stored={storedRules([
                        { flag: "enableRadarChart", value: false },
                        { flag: "enableRadarChart", value: false, organizationId: "other" },
                        { flag: "aiChatSearchLimit", value: 5 },
                    ])}
                />,
            );
            const row = await findRow("enableRadarChart");
            const checkbox = row.getByRole("checkbox", { name: "Value of enableRadarChart" });

            expect(checkbox).toBeChecked();
            expect(checkbox).toHaveAccessibleDescription(
                "A developer set this flag in the code, so overrides have no effect. " +
                    "Saved overrides for this flag take effect once the code value is removed.",
            );
            expect(screen.queryByText(/not applied/)).not.toBeInTheDocument();
            const otherPages = (await screen.findByText("On other pages · 1")).closest("section");
            expect(otherPages).toHaveTextContent("enableRadarChart");
            expect(otherPages).toHaveTextContent("Organization other");

            await user.click(row.getByRole("button", { name: "Remove saved overrides of enableRadarChart" }));

            expect(row.queryByText(/Saved overrides/)).not.toBeInTheDocument();
            expect(row.queryByRole("button", { name: /Remove/ })).not.toBeInTheDocument();
            expect(screen.getByText("1 change not applied")).toBeVisible();
            await apply(user);
            expect(readStoredRules()).toEqual([
                { flag: "enableRadarChart", value: false, organizationId: "other" },
                { flag: "aiChatSearchLimit", value: 5 },
            ]);
        });
    });

    describe("groups", () => {
        it("keeps rows in their group while editing", async () => {
            const { user } = render(
                <FeatureFlagOverridesPanel
                    {...panelProps}
                    stored={storedRules([{ flag: "enableMekkoChart", value: true }])}
                />,
            );

            expect(await findGroupHeadingOf("enableMekkoChart")).toBe("Overridden · 1");
            expect(await findGroupHeadingOf("enableRadarChart")).toMatch(/^Other flags · /);

            await user.click(
                (await findRow("enableRadarChart")).getByRole("checkbox", {
                    name: "Value of enableRadarChart",
                }),
            );
            await user.click(
                (await findRow("enableMekkoChart")).getByRole("button", {
                    name: "Remove override of enableMekkoChart",
                }),
            );

            expect(await findGroupHeadingOf("enableMekkoChart")).toBe("Overridden · 1");
            expect(await findGroupHeadingOf("enableRadarChart")).toMatch(/^Other flags · /);
        });

        it("regroups after clearing all", async () => {
            const { user } = render(
                <FeatureFlagOverridesPanel
                    {...panelProps}
                    stored={storedRules([{ flag: "enableMekkoChart", value: true }])}
                />,
            );

            await user.click(await screen.findByRole("button", { name: "Clear all" }));

            expect(await findGroupHeadingOf("enableMekkoChart")).toBeUndefined();
            expect(screen.queryByText(/^(Overridden|Other flags) · /)).not.toBeInTheDocument();
        });

        it("shows no group headings when only one group has rows", async () => {
            render(<FeatureFlagOverridesPanel {...panelProps} />);

            expect(await findGroupHeadingOf("enableRadarChart")).toBeUndefined();
            expect(screen.queryByText(/^(Overridden|Other flags) · /)).not.toBeInTheDocument();
        });

        it("regroups after an import", async () => {
            const { user } = render(<FeatureFlagOverridesPanel {...panelProps} />);
            const file = new File(
                [JSON.stringify({ version: 1, rules: [{ flag: "enableRadarChart", value: true }] })],
                "overrides.json",
                { type: "application/json" },
            );

            await user.upload(await screen.findByLabelText("Import JSON", { selector: "input" }), file);

            await waitFor(async () =>
                expect(await findGroupHeadingOf("enableRadarChart")).toBe("Overridden · 1"),
            );
        });
    });

    describe("highlight", () => {
        const OVERRIDDEN = "gd-feature-flag-overrides__row--overridden";
        const rowOf = async (flag: string) => (await screen.findByText(flag)).closest("li");

        it("highlights applied and new overrides, not plain rows", async () => {
            const { user } = render(
                <FeatureFlagOverridesPanel
                    {...panelProps}
                    stored={storedRules([{ flag: "enableMekkoChart", value: true }])}
                />,
            );

            expect(await rowOf("enableMekkoChart")).toHaveClass(OVERRIDDEN);
            expect(await rowOf("enableRadarChart")).not.toHaveClass(OVERRIDDEN);

            await user.click(
                (await findRow("enableRadarChart")).getByRole("checkbox", {
                    name: "Value of enableRadarChart",
                }),
            );

            expect(await findGroupHeadingOf("enableRadarChart")).toMatch(/^Other flags · /);
            expect(await rowOf("enableRadarChart")).toHaveClass(OVERRIDDEN);
        });

        it("removes the highlight on Reset", async () => {
            const { user } = render(
                <FeatureFlagOverridesPanel
                    {...panelProps}
                    stored={storedRules([{ flag: "enableMekkoChart", value: true }])}
                />,
            );

            expect(await rowOf("enableMekkoChart")).toHaveClass(OVERRIDDEN);
            await user.click(
                (await findRow("enableMekkoChart")).getByRole("button", {
                    name: "Remove override of enableMekkoChart",
                }),
            );

            expect(await rowOf("enableMekkoChart")).not.toHaveClass(OVERRIDDEN);
        });

        it("marks an invalid overridden row as invalid", async () => {
            const { user } = render(
                <FeatureFlagOverridesPanel
                    {...panelProps}
                    stored={storedRules([{ flag: "aiChatSearchLimit", value: 5 }])}
                />,
            );

            await user.type(
                (await findRow("aiChatSearchLimit")).getByRole("textbox", {
                    name: "Value of aiChatSearchLimit",
                }),
                "a",
            );

            expect(await rowOf("aiChatSearchLimit")).toHaveClass("gd-feature-flag-overrides__row--invalid");
        });

        it("does not highlight a flag set in code", async () => {
            LocalFeatureFlagOverrides.enableRadarChart = true;
            onTestFinished(() => {
                delete LocalFeatureFlagOverrides.enableRadarChart;
            });
            render(
                <FeatureFlagOverridesPanel
                    {...panelProps}
                    stored={storedRules([{ flag: "enableRadarChart", value: false }])}
                />,
            );

            expect(await rowOf("enableRadarChart")).not.toHaveClass(OVERRIDDEN);
        });
    });

    describe("row action tooltips", () => {
        interface IActionCase {
            name: string;
            tooltip: string;
            setUp: () => Promise<ReturnType<typeof render>["user"]>;
        }

        const cases: Array<[string, IActionCase]> = [
            [
                "reset",
                {
                    name: "Remove override of enableRadarChart",
                    tooltip: "Remove override",
                    setUp: async () =>
                        render(
                            <FeatureFlagOverridesPanel
                                {...panelProps}
                                stored={storedRules([{ flag: "enableRadarChart", value: true }])}
                            />,
                        ).user,
                },
            ],
            [
                "discard",
                {
                    name: "Discard invalid value of aiChatSearchLimit",
                    tooltip: "Discard invalid value",
                    setUp: async () => {
                        const { user } = render(<FeatureFlagOverridesPanel {...panelProps} />);
                        await user.type(
                            (await findRow("aiChatSearchLimit")).getByRole("textbox", {
                                name: "Value of aiChatSearchLimit",
                            }),
                            "a",
                        );
                        return user;
                    },
                },
            ],
            [
                "saved rules of a flag set in code",
                {
                    name: "Remove saved overrides of enableRadarChart",
                    tooltip: "Remove saved overrides",
                    setUp: async () => {
                        LocalFeatureFlagOverrides.enableRadarChart = true;
                        onTestFinished(() => {
                            delete LocalFeatureFlagOverrides.enableRadarChart;
                        });
                        return render(
                            <FeatureFlagOverridesPanel
                                {...panelProps}
                                stored={storedRules([{ flag: "enableRadarChart", value: false }])}
                            />,
                        ).user;
                    },
                },
            ],
            [
                "stale rule delete",
                {
                    name: "Delete stale override of enableSomethingRemoved",
                    tooltip: "Delete",
                    setUp: async () =>
                        render(
                            <FeatureFlagOverridesPanel
                                {...panelProps}
                                stored={{
                                    rules: [],
                                    staleRules: [
                                        {
                                            rule: { flag: "enableSomethingRemoved", value: true },
                                            reason: "unknownFlag",
                                        },
                                    ],
                                }}
                            />,
                        ).user,
                },
            ],
        ];

        it.each(cases)("shows a short tooltip on hover for %s", async (_kind, { name, tooltip, setUp }) => {
            const user = await setUp();
            const button = await screen.findByRole("button", { name });

            await user.hover(button);

            expect(await screen.findByText(tooltip)).toBeInTheDocument();
            expect(button).toHaveAccessibleName(name);
        });

        it.each(cases)("shows a short tooltip on focus for %s", async (_kind, { name, tooltip, setUp }) => {
            await setUp();
            const button = await screen.findByRole("button", { name });

            act(() => button.focus());

            expect(await screen.findByText(tooltip)).toBeInTheDocument();
            expect(button).toHaveAccessibleName(name);
        });
    });

    describe("pending changes", () => {
        const getApplyButton = () => screen.getByRole("button", { name: "Apply & reload" });

        it("enables applying only while a change is not applied", async () => {
            const { user } = render(
                <FeatureFlagOverridesPanel
                    {...panelProps}
                    stored={storedRules([{ flag: "enableRadarChart", value: true }])}
                />,
            );
            const radarRow = await findRow("enableRadarChart");
            const radar = radarRow.getByRole("checkbox", { name: "Value of enableRadarChart" });

            expect(getApplyButton()).toBeDisabled();
            await user.click(radar);
            expect(getApplyButton()).toBeEnabled();
            await user.click(radar);
            expect(getApplyButton()).toBeDisabled();

            const mekkoRow = await findRow("enableMekkoChart");
            await user.click(mekkoRow.getByRole("checkbox", { name: "Value of enableMekkoChart" }));
            expect(getApplyButton()).toBeEnabled();
            await user.click(mekkoRow.getByRole("button", { name: "Remove override of enableMekkoChart" }));
            expect(getApplyButton()).toBeDisabled();
            expect(screen.queryByText(/not applied/)).not.toBeInTheDocument();
        });

        it("enables applying over unreadable stored overrides, also after clearing all", async () => {
            const onApplied = vi.fn();
            const { user } = render(
                <FeatureFlagOverridesPanel
                    {...panelProps}
                    stored={{ rules: [], staleRules: [], unreadableContent: "{" }}
                    onApplied={onApplied}
                />,
            );

            expect(
                await screen.findByText("The stored overrides could not be read. Applying replaces them."),
            ).toBeVisible();
            expect(getApplyButton()).toBeEnabled();
            await user.click(screen.getByRole("button", { name: "Clear all" }));
            expect(screen.queryByText(/could not be read/)).not.toBeInTheDocument();
            expect(getApplyButton()).toBeEnabled();
            await apply(user);
            expect(onApplied).toHaveBeenCalledOnce();
        });

        it.each([
            ["a stale rule", "Delete stale override of enableSomethingRemoved"],
            ["a rule for another page", "Delete override of enableRadarChart for User bob"],
        ])("enables applying after deleting %s", async (_kind, deleteLabel) => {
            const { user } = render(
                <FeatureFlagOverridesPanel
                    {...panelProps}
                    stored={{
                        rules: [{ flag: "enableRadarChart", value: true, userId: "bob" }],
                        staleRules: [
                            { rule: { flag: "enableSomethingRemoved", value: true }, reason: "unknownFlag" },
                        ],
                    }}
                />,
            );
            const deleteButton = await screen.findByRole("button", { name: deleteLabel });

            expect(getApplyButton()).toBeDisabled();
            await user.click(deleteButton);
            expect(getApplyButton()).toBeEnabled();
        });

        it("marks a changed value as not applied and counts the changes", async () => {
            const { user } = render(<FeatureFlagOverridesPanel {...panelProps} />);
            const checkbox = (await findRow("enableRadarChart")).getByRole("checkbox", {
                name: "Value of enableRadarChart",
            });

            expect(screen.queryByText(/not applied/)).not.toBeInTheDocument();
            await user.click(checkbox);

            expect(checkbox).toHaveAccessibleDescription("Not applied yet");
            expectBadgeAfterName("enableRadarChart", "Not applied yet");
            expect(screen.getByText("1 change not applied")).toBeVisible();
        });

        it("counts a deleted stale rule as a change", async () => {
            const { user } = render(
                <FeatureFlagOverridesPanel
                    {...panelProps}
                    stored={{
                        rules: [],
                        staleRules: [
                            { rule: { flag: "enableSomethingRemoved", value: true }, reason: "unknownFlag" },
                        ],
                    }}
                />,
            );

            await user.click(
                await screen.findByRole("button", {
                    name: "Delete stale override of enableSomethingRemoved",
                }),
            );

            expect(screen.getByText("1 change not applied")).toBeVisible();
        });

        it("shows the value the page uses when another setting wins over the override", async () => {
            render(
                <FeatureFlagOverridesPanel
                    {...panelProps}
                    settings={{ ...userSettings, aiChatSearchLimit: 7 }}
                    stored={storedRules([{ flag: "aiChatSearchLimit", value: 5 }])}
                />,
            );

            expect(
                (await findRow("aiChatSearchLimit")).getByRole("textbox", {
                    name: "Value of aiChatSearchLimit",
                }),
            ).toHaveAccessibleDescription("Page uses 7");
            expectBadgeAfterName("aiChatSearchLimit", "Page uses 7");
        });
    });

    describe("JSON values", () => {
        const earlyAccessFeatures: IEarlyAccessFeaturesConfig = {
            features: [
                {
                    title: "Beta feature",
                    description: "A feature in beta",
                    earlyAccess: "beta-feature",
                    context: "WORKSPACE",
                    status: "BETA",
                },
            ],
        };

        it("edits the value in a detail area with no summary under the button", async () => {
            const { user } = render(
                <FeatureFlagOverridesPanel
                    {...panelProps}
                    settings={{ ...userSettings, earlyAccessFeatures }}
                />,
            );
            const row = await findRow("earlyAccessFeatures");
            const button = row.getByRole("button", { name: "Edit JSON of earlyAccessFeatures" });

            expect(button).toHaveAttribute("aria-expanded", "false");
            expect(button).not.toHaveAccessibleDescription();
            expect(button.querySelector("svg")).toHaveClass("gd-ui-kit-icon--disableAnimation");
            expect(screen.queryByText("1 item")).not.toBeInTheDocument();
            await user.click(button);

            expect(button).toHaveAttribute("aria-expanded", "true");
            expect(
                screen.getByRole("textbox", { name: "Server value of earlyAccessFeatures" }),
            ).toBeVisible();
            expect(screen.getByRole("textbox", { name: "Override of earlyAccessFeatures" })).toBeVisible();
        });

        it("says only that the page uses a different JSON value", async () => {
            render(
                <FeatureFlagOverridesPanel
                    {...panelProps}
                    settings={{ ...userSettings, earlyAccessFeatures }}
                    stored={storedRules([{ flag: "earlyAccessFeatures", value: { features: [] } }])}
                />,
            );

            expect(
                (await findRow("earlyAccessFeatures")).getByRole("button", {
                    name: "Edit JSON of earlyAccessFeatures",
                }),
            ).toHaveAccessibleDescription(/^Page uses a different value/);
            expect(screen.getByText("Page uses a different value")).toHaveClass("gd-ui-kit-badge");
        });

        it("summarizes the override only when it differs from the server value", async () => {
            const twoFeatures: IEarlyAccessFeaturesConfig = {
                features: [...earlyAccessFeatures.features, ...earlyAccessFeatures.features],
            };
            getServerFeatureFlags.mockReturnValue({ earlyAccessFeatures });
            onTestFinished(() => {
                getServerFeatureFlags.mockReset();
            });
            const { unmount } = render(
                <FeatureFlagOverridesPanel
                    {...panelProps}
                    settings={{ ...userSettings, earlyAccessFeatures: twoFeatures }}
                    stored={storedRules([{ flag: "earlyAccessFeatures", value: twoFeatures }])}
                />,
            );

            expect(
                (await findRow("earlyAccessFeatures")).getByRole("button", {
                    name: "Edit JSON of earlyAccessFeatures",
                }),
            ).toHaveAccessibleDescription("2 items");
            unmount();

            render(
                <FeatureFlagOverridesPanel
                    {...panelProps}
                    settings={{ ...userSettings, earlyAccessFeatures }}
                    stored={storedRules([{ flag: "earlyAccessFeatures", value: earlyAccessFeatures }])}
                />,
            );

            expect(
                (await findRow("earlyAccessFeatures")).getByRole("button", {
                    name: "Edit JSON of earlyAccessFeatures",
                }),
            ).not.toHaveAccessibleDescription();
        });

        it("moves focus from Edit JSON through the detail before the scope and reset", async () => {
            const { user } = render(
                <FeatureFlagOverridesPanel
                    {...panelProps}
                    stored={storedRules([{ flag: "earlyAccessFeatures", value: earlyAccessFeatures }])}
                />,
            );
            const row = await findRow("earlyAccessFeatures");

            await user.click(row.getByRole("button", { name: "Edit JSON of earlyAccessFeatures" }));
            await user.tab();
            expect(
                screen.getByRole("textbox", { name: "Server value of earlyAccessFeatures" }),
            ).toHaveFocus();
            await user.tab();
            expect(document.activeElement).toHaveAccessibleName("Auto-format");
            await user.tab();
            expect(screen.getByRole("textbox", { name: "Override of earlyAccessFeatures" })).toHaveFocus();
            await user.tab();
            expect(row.getByRole("button", { name: /^earlyAccessFeatures applies to/ })).toHaveFocus();
            await user.tab();
            expect(row.getByRole("button", { name: "Only when signed in as Jane Doe" })).toHaveFocus();
            await user.tab();
            expect(row.getByRole("button", { name: "Remove override of earlyAccessFeatures" })).toHaveFocus();
        });

        it("keeps the panel open on Escape in an editor", async () => {
            const onClose = vi.fn();
            const { user } = render(<FeatureFlagOverridesPanel {...panelProps} onClose={onClose} />);

            await user.click(
                (await findRow("earlyAccessFeatures")).getByRole("button", {
                    name: "Edit JSON of earlyAccessFeatures",
                }),
            );
            await user.click(screen.getByRole("textbox", { name: "Override of earlyAccessFeatures" }));
            await user.keyboard("{Escape}");

            expect(onClose).not.toHaveBeenCalled();
            expect(screen.getByRole("dialog", { name: "Feature flag overrides" })).toBeVisible();
        });
    });

    describe("empty states", () => {
        it("offers to clear a search that finds nothing", async () => {
            const { user } = render(<FeatureFlagOverridesPanel {...panelProps} />);

            await user.type(await screen.findByRole("searchbox", { name: "Search flags" }), "radr");
            expect(screen.getByText("No flag matches “radr”.")).toBeVisible();

            await user.click(screen.getByRole("button", { name: "Clear search" }));
            expect(screen.getByText("enableRadarChart")).toBeVisible();
        });

        it("offers all flags when none is overridden", async () => {
            const { user } = render(<FeatureFlagOverridesPanel {...panelProps} initialOverriddenOnly />);

            expect(await screen.findByText("No overrides apply on this page.")).toBeVisible();
            await user.click(screen.getByRole("button", { name: "Show all flags" }));
            expect(screen.getByText("enableRadarChart")).toBeVisible();
        });
    });

    describe("storage", () => {
        it("lists stale rules, keeps them on apply and deletes them on request", async () => {
            const removedFlag = { flag: "enableSomethingRemoved", value: true };
            const wrongType = { flag: "enableRadarChart", value: "yes" };
            const { user } = render(
                <FeatureFlagOverridesPanel
                    {...panelProps}
                    stored={{
                        rules: [],
                        staleRules: [
                            { rule: removedFlag, reason: "unknownFlag" },
                            { rule: wrongType, reason: "invalidValue" },
                        ],
                    }}
                />,
            );

            expect(await screen.findByText("Not valid · 2")).toBeVisible();
            expect(screen.getByText("Unknown flag")).toBeVisible();
            await user.click(
                screen.getByRole("button", { name: "Delete stale override of enableSomethingRemoved" }),
            );
            await apply(user);

            expect(readStoredRules()).toEqual([wrongType]);
        });

        it("clears all rules", async () => {
            const { user } = render(
                <FeatureFlagOverridesPanel
                    {...panelProps}
                    stored={{
                        rules: [{ flag: "enableRadarChart", value: true, organizationId: "other" }],
                        staleRules: [{ rule: null, reason: "invalidRule" }],
                    }}
                />,
            );

            await user.click(await screen.findByRole("button", { name: "Clear all" }));
            await apply(user);

            expect(localStorage.getItem(FEATURE_FLAG_OVERRIDES_STORAGE_KEY)).toBeNull();
        });

        it("imports the valid and the stale rules of a file and rejects an unreadable one", async () => {
            const { user } = render(<FeatureFlagOverridesPanel {...panelProps} />);
            const fileInput = await screen.findByLabelText("Import JSON", { selector: "input" });

            await user.upload(fileInput, new File(["{"], "broken.json", { type: "application/json" }));
            expect(await screen.findByText("The file is not a valid overrides export.")).toBeVisible();

            await user.upload(
                fileInput,
                new File(
                    [
                        JSON.stringify({
                            version: 1,
                            rules: [
                                { flag: "enableMekkoChart", value: true },
                                { flag: "enableSomethingRemoved", value: true },
                            ],
                        }),
                    ],
                    "overrides.json",
                    { type: "application/json" },
                ),
            );

            expect(
                await (
                    await findRow("enableMekkoChart")
                ).findByRole("checkbox", {
                    name: "Value of enableMekkoChart",
                }),
            ).toBeChecked();
            expect(screen.getByText("Not valid · 1")).toBeVisible();
            expect(screen.queryByText("The file is not a valid overrides export.")).not.toBeInTheDocument();
        });

        it("lists imported overrides for other pages and deletes them one at a time", async () => {
            const otherWorkspaceRule = {
                flag: "enableMekkoChart",
                value: true,
                organizationId: "org",
                workspaceId: "other",
            };
            const otherUserRule = { flag: "enableRadarChart", value: true, userId: "bob" };
            const { user } = render(<FeatureFlagOverridesPanel {...panelProps} />);

            await user.upload(
                await screen.findByLabelText("Import JSON", { selector: "input" }),
                new File(
                    [JSON.stringify({ version: 1, rules: [otherWorkspaceRule, otherUserRule] })],
                    "overrides.json",
                    { type: "application/json" },
                ),
            );

            const section = (await screen.findByText("On other pages · 2")).closest("section");
            if (!section) {
                throw new Error("No section for overrides on other pages");
            }
            const otherRow = (text: string) => {
                const row = within(section).getByText(text).closest("li");
                if (!row) {
                    throw new Error(`No row with ${text}`);
                }
                return within(row);
            };
            expect(otherRow("enableMekkoChart").queryByText("Organization org")).not.toBeInTheDocument();
            expect(otherRow("enableMekkoChart").getByText("Workspace other")).toBeVisible();
            expect(otherRow("enableMekkoChart").getByText("On")).toBeVisible();
            expect(otherRow("enableRadarChart").getByText("User bob")).toBeVisible();
            expect(screen.getByText("2 changes not applied")).toBeVisible();

            await user.click(
                otherRow("enableMekkoChart").getByRole("button", {
                    name: "Delete override of enableMekkoChart for Workspace other",
                }),
            );

            expect(screen.getByText("1 change not applied")).toBeVisible();
            expect(screen.getByText("On other pages · 1")).toBeVisible();
            await apply(user);
            expect(readStoredRules()).toEqual([otherUserRule]);
        });

        it("deletes one copy of a duplicated rule for another page", async () => {
            const otherUserRule: FeatureFlagOverrideRule = {
                flag: "enableRadarChart",
                value: true,
                userId: "bob",
            };
            const { user } = render(
                <FeatureFlagOverridesPanel
                    {...panelProps}
                    stored={storedRules([otherUserRule, { ...otherUserRule }])}
                />,
            );

            expect(await screen.findByText("On other pages · 2")).toBeVisible();
            const [deleteFirst] = screen.getAllByRole("button", {
                name: "Delete override of enableRadarChart for User bob",
            });
            await user.click(deleteFirst);

            expect(screen.getByText("On other pages · 1")).toBeVisible();
            expect(
                screen.getAllByRole("button", {
                    name: "Delete override of enableRadarChart for User bob",
                }),
            ).toHaveLength(1);
            await apply(user);
            expect(readStoredRules()).toEqual([otherUserRule]);
        });

        it("exports only the valid rules", async () => {
            const createObjectURL = vi.spyOn(URL, "createObjectURL").mockReturnValue("blob:overrides");
            const revokeObjectURL = vi.spyOn(URL, "revokeObjectURL").mockImplementation(() => {});
            vi.spyOn(HTMLAnchorElement.prototype, "click").mockImplementation(() => {});
            const { user } = render(
                <FeatureFlagOverridesPanel
                    {...panelProps}
                    stored={{
                        rules: [{ flag: "enableRadarChart", value: true }],
                        staleRules: [
                            { rule: { flag: "enableSomethingRemoved", value: true }, reason: "unknownFlag" },
                        ],
                    }}
                />,
            );

            await user.click(await screen.findByRole("button", { name: "Export JSON" }));
            const blob = createObjectURL.mock.calls[0]?.[0];
            if (!(blob instanceof Blob)) {
                throw new Error("No blob exported");
            }

            expect(JSON.parse(await blob.text())).toEqual({
                version: 1,
                rules: [{ flag: "enableRadarChart", value: true }],
            });
            await vi.waitFor(() => expect(revokeObjectURL).toHaveBeenCalledWith("blob:overrides"));
        });

        it("shows an error when the storage refuses the write", async () => {
            const onApplied = vi.fn();
            vi.spyOn(window, "localStorage", "get").mockImplementation(() => {
                throw new Error("SecurityError");
            });
            const { user } = render(<FeatureFlagOverridesPanel {...panelProps} onApplied={onApplied} />);

            await user.click(
                (await findRow("enableRadarChart")).getByRole("checkbox", {
                    name: "Value of enableRadarChart",
                }),
            );
            await apply(user);

            expect(
                screen.getByText("The overrides could not be saved. The browser may block its storage."),
            ).toBeVisible();
            expect(onApplied).not.toHaveBeenCalled();
        });
    });

    describe("overrides for other pages", () => {
        const workspaceRule = (
            flag: "enableMekkoChart" | "enableRadarChart",
            workspaceId: string,
        ): FeatureFlagOverrideRule => ({
            flag,
            value: true,
            organizationId: "org",
            workspaceId,
        });

        it("names the current organization, the signed-in user and the workspace", async () => {
            resolveWorkspaceTitles({ sales: "Sales demo" });
            render(
                <FeatureFlagOverridesPanel
                    {...panelProps}
                    organizationTitle="Acme"
                    stored={storedRules([
                        workspaceRule("enableMekkoChart", "sales"),
                        { flag: "enableRadarChart", value: true, organizationId: "other", userId: "jane" },
                        { flag: "aiChatSearchLimit", value: 5, organizationId: "org", userId: "bob" },
                    ])}
                />,
            );
            const [workspaceRow, signedInUserRow, otherUserRow] = await findOtherPageRows(3);

            expect(await workspaceRow.findByText("Workspace (Sales demo)")).toHaveClass(
                "gd-feature-flag-overrides__condition",
            );
            expect(getConditionTexts(workspaceRow)).toEqual(["Workspace (Sales demo) ID sales"]);
            expect(workspaceRow.getByText("ID sales")).toHaveClass("sr-only");
            expect(getConditionTexts(signedInUserRow)).toEqual([
                "Organization other",
                "User (Jane Doe) ID jane",
            ]);
            expect(getConditionTexts(otherUserRow)).toEqual(["Organization (Acme) ID org", "User bob"]);
            expect(
                workspaceRow.getByRole("button", {
                    name: "Delete override of enableMekkoChart for Workspace (Sales demo)",
                }),
            ).toBeVisible();
            expect(
                signedInUserRow.getByRole("button", {
                    name: "Delete override of enableRadarChart for Organization other · User (Jane Doe)",
                }),
            ).toBeVisible();
        });

        it("shows the workspace ID while the name loads", async () => {
            render(
                <FeatureFlagOverridesPanel
                    {...panelProps}
                    stored={storedRules([workspaceRule("enableMekkoChart", "sales")])}
                />,
            );
            const [row] = await findOtherPageRows(1);

            expect(row.getByText("Workspace sales")).toBeVisible();
            expect(getDescriptor).toHaveBeenCalledWith("sales");
        });

        it("shows the workspace ID when the name fails to load", async () => {
            getDescriptor.mockImplementation((id) =>
                id === "deleted"
                    ? Promise.reject(new Error("Not found"))
                    : Promise.resolve({ title: "Sales demo" }),
            );
            render(
                <FeatureFlagOverridesPanel
                    {...panelProps}
                    context={{ organizationId: "org", userId: "jane" }}
                    stored={storedRules([
                        workspaceRule("enableMekkoChart", "deleted"),
                        workspaceRule("enableRadarChart", "sales"),
                    ])}
                />,
            );
            const [failedRow, loadedRow] = await findOtherPageRows(2);

            expect(await loadedRow.findByText("Workspace (Sales demo)")).toBeVisible();
            expect(failedRow.getByText("Workspace deleted")).toBeVisible();
            expect(countDescriptorCalls("deleted")).toBe(1);
            expect(countDescriptorCalls("sales")).toBe(1);
        });

        it("loads each workspace of the current organization once", async () => {
            getDescriptor.mockImplementation((id) => Promise.resolve({ title: `Title of ${id}` }));
            const { user } = render(
                <FeatureFlagOverridesPanel
                    {...panelProps}
                    stored={storedRules([
                        workspaceRule("enableMekkoChart", "a"),
                        workspaceRule("enableRadarChart", "a"),
                        workspaceRule("enableMekkoChart", "b"),
                        { flag: "enableRadarChart", value: false, organizationId: "other", workspaceId: "a" },
                        { flag: "enableMekkoChart", value: false, organizationId: "other", workspaceId: "c" },
                    ])}
                />,
            );
            const [firstRowOfA, secondRowOfA, rowOfB, otherOrganizationRowOfA, otherOrganizationRowOfC] =
                await findOtherPageRows(5);

            expect(await rowOfB.findByText("Workspace (Title of b)")).toBeVisible();
            await user.type(screen.getByRole("searchbox", { name: "Search flags" }), "chart");
            expect(firstRowOfA.getByText("Workspace (Title of a)")).toBeVisible();
            expect(secondRowOfA.getByText("Workspace (Title of a)")).toBeVisible();
            expect(otherOrganizationRowOfA.getByText("Workspace a")).toBeVisible();
            expect(otherOrganizationRowOfC.getByText("Workspace c")).toBeVisible();
            expect(countDescriptorCalls("a")).toBe(1);
            expect(countDescriptorCalls("b")).toBe(1);
            expect(countDescriptorCalls("c")).toBe(0);
        });

        it("names the current workspace without loading it again", async () => {
            resolveWorkspaceTitles({ ws: "Current workspace" });
            render(
                <FeatureFlagOverridesPanel
                    {...panelProps}
                    stored={storedRules([{ ...workspaceRule("enableMekkoChart", "ws"), userId: "bob" }])}
                />,
            );
            const [row] = await findOtherPageRows(1);

            expect(await row.findByText("Workspace (Current workspace)")).toBeVisible();
            expect(countDescriptorCalls("ws")).toBe(1);
        });

        it("loads only the workspaces it has not loaded yet", async () => {
            getDescriptor.mockImplementation((id) => Promise.resolve({ title: `Title of ${id}` }));
            const { user } = render(
                <FeatureFlagOverridesPanel
                    {...panelProps}
                    stored={storedRules([
                        workspaceRule("enableMekkoChart", "a"),
                        workspaceRule("enableRadarChart", "b"),
                    ])}
                />,
            );
            const [rowOfA, rowOfB] = await findOtherPageRows(2);
            expect(await rowOfA.findByText("Workspace (Title of a)")).toBeVisible();

            await user.click(
                rowOfB.getByRole("button", {
                    name: "Delete override of enableRadarChart for Workspace (Title of b)",
                }),
            );
            await user.upload(
                screen.getByLabelText("Import JSON", { selector: "input" }),
                new File(
                    [
                        JSON.stringify({
                            version: 1,
                            rules: [
                                workspaceRule("enableMekkoChart", "a"),
                                workspaceRule("enableRadarChart", "c"),
                            ],
                        }),
                    ],
                    "overrides.json",
                    { type: "application/json" },
                ),
            );

            const [importedRowOfA, importedRowOfC] = await findOtherPageRows(2);
            expect(await importedRowOfC.findByText("Workspace (Title of c)")).toBeVisible();
            expect(importedRowOfA.getByText("Workspace (Title of a)")).toBeVisible();
            expect(countDescriptorCalls("a")).toBe(1);
            expect(countDescriptorCalls("c")).toBe(1);
        });

        it("reuses a pending lookup when the workspaces change", async () => {
            let releaseA = () => {};
            const pendingA = new Promise<{ title: string }>((resolve) => {
                releaseA = () => resolve({ title: "Title of a" });
            });
            getDescriptor.mockImplementation((id) =>
                id === "a" ? pendingA : Promise.resolve({ title: `Title of ${id}` }),
            );
            const { user } = render(
                <FeatureFlagOverridesPanel
                    {...panelProps}
                    stored={storedRules([
                        workspaceRule("enableMekkoChart", "a"),
                        workspaceRule("enableRadarChart", "b"),
                    ])}
                />,
            );
            await findOtherPageRows(2);

            await user.upload(
                screen.getByLabelText("Import JSON", { selector: "input" }),
                new File(
                    [
                        JSON.stringify({
                            version: 1,
                            rules: [
                                workspaceRule("enableMekkoChart", "a"),
                                workspaceRule("enableRadarChart", "c"),
                            ],
                        }),
                    ],
                    "overrides.json",
                    { type: "application/json" },
                ),
            );
            await findOtherPageRows(2);
            await waitFor(() => expect(countDescriptorCalls("c")).toBe(1));
            act(releaseA);

            const [rowOfA, rowOfC] = await findOtherPageRows(2);
            expect(await rowOfA.findByText("Workspace (Title of a)")).toBeVisible();
            expect(await rowOfC.findByText("Workspace (Title of c)")).toBeVisible();
            expect(countDescriptorCalls("a")).toBe(1);
            expect(countDescriptorCalls("c")).toBe(1);
        });

        it("names the other workspaces when one lookup throws", async () => {
            getDescriptor.mockImplementation((id) => {
                if (id === "broken") {
                    throw new Error("Unavailable");
                }
                return Promise.resolve({ title: `Title of ${id}` });
            });
            render(
                <FeatureFlagOverridesPanel
                    {...panelProps}
                    stored={storedRules([
                        workspaceRule("enableMekkoChart", "broken"),
                        workspaceRule("enableRadarChart", "sales"),
                    ])}
                />,
            );
            const [brokenRow, loadedRow] = await findOtherPageRows(2);

            expect(await loadedRow.findByText("Workspace (Title of sales)")).toBeVisible();
            expect(brokenRow.getByText("Workspace broken")).toBeVisible();
        });
    });

    describe("saved rule rows", () => {
        const staleRules: IStaleFeatureFlagOverrideRule[] = [
            { rule: { flag: "enableSomethingRemoved", value: true }, reason: "unknownFlag" },
            { rule: null, reason: "invalidRule" },
        ];

        it("groups the overrides for other pages and the stale ones in both views", async () => {
            const { user } = render(
                <FeatureFlagOverridesPanel
                    {...panelProps}
                    stored={{
                        rules: [
                            { flag: "enableMekkoChart", value: true },
                            { flag: "enableRadarChart", value: true, organizationId: "other" },
                        ],
                        staleRules,
                    }}
                />,
            );

            await screen.findByText("Not valid · 2");
            expect(getGroupHeadings()).toEqual([
                "Overridden · 1",
                "On other pages · 1",
                "Not valid · 2",
                expect.stringMatching(/^Other flags · \d+$/),
            ]);
            await user.click(screen.getByRole("button", { name: /^Overridden/ }));
            expect(getGroupHeadings()).toEqual(["Overridden · 1", "On other pages · 1", "Not valid · 2"]);
        });

        it("filters the overrides for other pages and the stale ones by flag name", async () => {
            const { user } = render(
                <FeatureFlagOverridesPanel
                    {...panelProps}
                    stored={{
                        rules: [
                            { flag: "enableRadarChart", value: true, organizationId: "other" },
                            { flag: "enableMekkoChart", value: true, organizationId: "other" },
                        ],
                        staleRules,
                    }}
                />,
            );
            const search = await screen.findByRole("searchbox", { name: "Search flags" });

            await user.type(search, "mekko");
            const [mekkoRow] = await findGroupRows("On other pages · 1");
            expect(mekkoRow).toHaveTextContent("enableMekkoChart");
            expect(screen.queryByText(/^Not valid/)).not.toBeInTheDocument();

            await user.clear(search);
            await user.type(search, "removed");
            expect(await findGroupRows("Not valid · 1")).toHaveLength(1);
            expect(screen.queryByText("Unreadable rule")).not.toBeInTheDocument();
            expect(screen.queryByText(/^On other pages/)).not.toBeInTheDocument();
        });

        it("shows the value and the place of an override for another page", async () => {
            render(
                <FeatureFlagOverridesPanel
                    {...panelProps}
                    stored={storedRules([
                        {
                            flag: "aiChatSearchLimit",
                            value: 5,
                            organizationId: "other",
                            workspaceId: "x",
                            userId: "jane",
                        },
                        { flag: "enableRadarChart", value: true, organizationId: "other" },
                    ])}
                />,
            );
            const [userRow, organizationRow] = await findGroupRows("On other pages · 2");

            expect(getCell(userRow, "value-text")).toHaveTextContent(/^5$/);
            expect(getCell(userRow, "scope-text")).toHaveTextContent(/^Workspace$/);
            expect(getCell(userRow, "scope-text")?.querySelector(".gd-ui-kit-icon")).not.toBeNull();
            expect(getCell(organizationRow, "value-text")).toHaveTextContent(/^On$/);
            expect(getCell(organizationRow, "scope-text")).toHaveTextContent(/^Organization$/);
            expect(getCell(organizationRow, "scope-text")?.querySelector(".gd-ui-kit-icon")).toBeNull();
        });

        it("describes a stale rule by its flag, reason, value and place", async () => {
            const { user } = render(
                <FeatureFlagOverridesPanel
                    {...panelProps}
                    stored={{
                        rules: [],
                        staleRules: [
                            {
                                rule: {
                                    flag: "enableRadarChart",
                                    value: "yes",
                                    organizationId: "org",
                                    workspaceId: "w",
                                },
                                reason: "invalidValue",
                            },
                            {
                                rule: { flag: "enableMekkoChart", value: true, userId: 7 },
                                reason: "invalidRule",
                            },
                            { rule: null, reason: "invalidRule" },
                        ],
                    }}
                />,
            );
            const [wrongValueRow, unreadableUserRow, unnamedRow] = await findGroupRows("Not valid · 3");

            expect(wrongValueRow).toHaveTextContent("enableRadarChart");
            expect(getCell(wrongValueRow, "conditions")).toHaveTextContent(/^Wrong value type for the flag$/);
            expect(getCell(wrongValueRow, "value-text")).toHaveTextContent(/^yes$/);
            expect(getCell(wrongValueRow, "scope-text")).toHaveTextContent(/^Workspace$/);
            expect(getCell(unreadableUserRow, "scope-text")).toBeEmptyDOMElement();
            expect(unnamedRow).toHaveTextContent("Unreadable rule");
            expect(getCell(unnamedRow, "value-text")).toHaveTextContent(/^—$/);

            await user.click(within(unnamedRow).getByRole("button", { name: "Delete stale override" }));

            expect(screen.getByText("1 change not applied")).toBeVisible();
            expect(await findGroupRows("Not valid · 2")).toHaveLength(2);
        });

        it("shows the places with their IDs in a tooltip", async () => {
            const { user } = render(
                <FeatureFlagOverridesPanel
                    {...panelProps}
                    stored={storedRules([
                        { flag: "enableRadarChart", value: true, organizationId: "other", userId: "jane" },
                    ])}
                />,
            );
            const [row] = await findGroupRows("On other pages · 1");
            const line = getCell(row, "conditions");
            if (!(line instanceof HTMLElement)) {
                throw new Error("No line under the flag name");
            }

            await user.hover(line);

            expect(await screen.findByText("Organization other · User Jane Doe (jane)")).toBeInTheDocument();
        });

        it("names the user of a user-limited saved rule in the icon tooltip", async () => {
            const { user } = render(
                <FeatureFlagOverridesPanel
                    {...panelProps}
                    stored={{
                        rules: [
                            {
                                flag: "enableRadarChart",
                                value: true,
                                organizationId: "other",
                                userId: "jane",
                            },
                            { flag: "enableMekkoChart", value: true, userId: "bob" },
                        ],
                        staleRules: [
                            {
                                rule: { flag: "enableRadarChart", value: "yes", userId: "jane" },
                                reason: "invalidValue",
                            },
                        ],
                    }}
                />,
            );
            const [signedInUserRow, otherUserRow] = await findGroupRows("On other pages · 2");
            const [staleRow] = await findGroupRows("Not valid · 1");
            const expectUserIconTooltip = async (row: HTMLElement, text: string) => {
                const icon = getCell(row, "scope-text")?.querySelector(".gd-ui-kit-icon");
                if (!icon) {
                    throw new Error("No user icon");
                }
                await user.hover(icon);
                expect(await screen.findByText(text)).toBeInTheDocument();
                await user.unhover(icon);
                await waitFor(() => expect(screen.queryByText(text)).not.toBeInTheDocument());
            };

            await expectUserIconTooltip(signedInUserRow, "Only when signed in as Jane Doe");
            await expectUserIconTooltip(otherUserRow, "Only when signed in as bob");
            await expectUserIconTooltip(staleRow, "Only when signed in as Jane Doe");
        });

        it("lists the empty state of the flags after the saved rules", async () => {
            const { user } = render(
                <FeatureFlagOverridesPanel
                    {...panelProps}
                    initialOverriddenOnly
                    stored={{
                        rules: [{ flag: "enableRadarChart", value: true, organizationId: "other" }],
                        staleRules,
                    }}
                />,
            );
            const message = await screen.findByText("No overrides apply on this page.");
            const [otherPageRow] = await findGroupRows("On other pages · 1");

            expect(
                otherPageRow.compareDocumentPosition(message) & Node.DOCUMENT_POSITION_FOLLOWING,
            ).toBeTruthy();
            await user.click(screen.getByRole("button", { name: "Show all flags" }));
            expect(screen.queryByText("No overrides apply on this page.")).not.toBeInTheDocument();
        });

        it("shows the search empty state of the flags next to the matching saved rules", async () => {
            const { user } = render(
                <FeatureFlagOverridesPanel {...panelProps} stored={{ rules: [], staleRules }} />,
            );

            await user.type(await screen.findByRole("searchbox", { name: "Search flags" }), "removed");

            expect(await screen.findByText("No flag matches “removed”.")).toBeVisible();
            expect(await findGroupRows("Not valid · 1")).toHaveLength(1);
            await user.click(screen.getByRole("button", { name: "Clear search" }));
            expect(screen.queryByText(/No flag matches/)).not.toBeInTheDocument();
        });
    });
});
