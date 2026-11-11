// (C) 2020-2026 GoodData Corporation

import { fireEvent, render, screen, within } from "@testing-library/react";
import { afterAll, describe, expect, it, vi } from "vitest";

import { type AnalyticalDashboardUriFactory, type DocumentUriFactory } from "../selectors/uri_selector.js";
import {
    type IInsightUsageInDocumentItem,
    type IInsightUsageOnDashboard,
} from "../store/insight_usage/insight_usage_state.js";
import { createAnalyticalDashboard } from "../tests/constants.test.helpers.js";
import { withIntl } from "../utils/with_intl.js";
import { withRedux } from "../utils/with_redux.js";

import { InsightUsageOnDashboards } from "./InsightUsageOnDashboards.js";

vi.hoisted(() => {
    vi.resetModules();
});

// the component reads everything from the store through useSelector, so the selectors it uses are
// mocked to return the values under test
const {
    mockGetInsightUsageOnDashboardsSelector,
    mockGetInsightUsageInDocumentsSelector,
    mockGetIsEmbedded,
    mockGetSourceDashboardId,
    mockIsAllowedDashboardLinks,
    mockAnalyticalDashboardUriFactorySelector,
    mockDocumentUriFactorySelector,
} = vi.hoisted(() => ({
    mockGetInsightUsageOnDashboardsSelector: vi.fn(),
    mockGetInsightUsageInDocumentsSelector: vi.fn(),
    mockGetIsEmbedded: vi.fn(),
    mockGetSourceDashboardId: vi.fn(),
    mockIsAllowedDashboardLinks: vi.fn(),
    mockAnalyticalDashboardUriFactorySelector: vi.fn(),
    mockDocumentUriFactorySelector: vi.fn(),
}));

vi.mock("../store/insight_usage/insight_usage_selectors.js", async () => {
    const actual = await vi.importActual<Record<string, unknown>>(
        "../store/insight_usage/insight_usage_selectors.js",
    );
    return {
        ...actual,
        getInsightUsageOnDashboardsSelector: mockGetInsightUsageOnDashboardsSelector,
        getInsightUsageInDocumentsSelector: mockGetInsightUsageInDocumentsSelector,
    };
});

vi.mock("../selectors/meta_selector.js", async () => {
    const actual = await vi.importActual<Record<string, unknown>>("../selectors/meta_selector.js");
    return {
        ...actual,
        getIsEmbedded: mockGetIsEmbedded,
    };
});

vi.mock("../selectors/route_selector.js", async () => {
    const actual = await vi.importActual<Record<string, unknown>>("../selectors/route_selector.js");
    return {
        ...actual,
        getSourceDashboardId: mockGetSourceDashboardId,
        isAllowedDashboardLinks: mockIsAllowedDashboardLinks,
    };
});

vi.mock("../selectors/uri_selector.js", async () => {
    const actual = await vi.importActual<Record<string, unknown>>("../selectors/uri_selector.js");
    return {
        ...actual,
        analyticalDashboardUriFactorySelector: mockAnalyticalDashboardUriFactorySelector,
        documentUriFactorySelector: mockDocumentUriFactorySelector,
    };
});

afterAll(() => {
    // Drop this file's mocked selectors from the shared (isolate:false) registry so they do not leak
    // into sibling files that import the real ones (the saga tests).
    vi.resetModules();
});

const buildInsightUsageOnDashboards = (
    dashboards: { name: string; identifier: string; id: number }[],
): IInsightUsageOnDashboard => {
    return {
        accessibleDashboards: dashboards.map(({ name, identifier, id }) =>
            createAnalyticalDashboard(name, identifier, id),
        ),
        allDashboards: dashboards.map(({ name, identifier, id }) =>
            createAnalyticalDashboard(name, identifier, id),
        ),
        inaccessibleDashboardsCount: 0,
        allDashboardsCount: dashboards.length,
    };
};

interface IInsightUsageOnDashboardsStateValues {
    insightUsageOnDashboard: IInsightUsageOnDashboard;
    isEmbedded: boolean;
    sourceDashboardIdentifier?: string;
    isAllowedDashboardLinks: boolean;
    analyticalDashboardUriFactory: AnalyticalDashboardUriFactory;
    documents: IInsightUsageInDocumentItem[];
    documentUriFactory: DocumentUriFactory;
}

const NO_DASHBOARDS: IInsightUsageOnDashboard = {
    accessibleDashboards: [],
    allDashboards: [],
    inaccessibleDashboardsCount: 0,
    allDashboardsCount: 0,
};

describe("InsightUsageOnDashboards", () => {
    function renderComponent(userValues: Partial<IInsightUsageOnDashboardsStateValues>) {
        const values: IInsightUsageOnDashboardsStateValues = {
            insightUsageOnDashboard: {
                accessibleDashboards: [],
                allDashboards: [],
                inaccessibleDashboardsCount: 0,
                allDashboardsCount: 0,
            },
            isEmbedded: false,
            isAllowedDashboardLinks: true,
            analyticalDashboardUriFactory: (id: string) => `/${id}`,
            documents: [],
            documentUriFactory: (id: string) => `/document/${id}`,
            ...userValues,
        };
        mockGetInsightUsageOnDashboardsSelector.mockReturnValue(values.insightUsageOnDashboard);
        mockGetIsEmbedded.mockReturnValue(values.isEmbedded);
        mockGetSourceDashboardId.mockReturnValue(values.sourceDashboardIdentifier);
        mockIsAllowedDashboardLinks.mockReturnValue(values.isAllowedDashboardLinks);
        mockAnalyticalDashboardUriFactorySelector.mockReturnValue(values.analyticalDashboardUriFactory);
        mockGetInsightUsageInDocumentsSelector.mockReturnValue(values.documents);
        mockDocumentUriFactorySelector.mockReturnValue(values.documentUriFactory);

        const Wrapped = withRedux(withIntl(InsightUsageOnDashboards));

        return render(<Wrapped />);
    }

    it("should render insight usages on dashboards component with used on 1 dashboard", () => {
        const { container } = renderComponent({
            insightUsageOnDashboard: buildInsightUsageOnDashboards([
                { name: "Sale", identifier: "Bee", id: 1 },
            ]),
        });

        expect(container.querySelectorAll(".s-gd-insight-usage-on-dashboards")).toHaveLength(1);
        const button = screen.getByRole("button", { name: "Used on 1 dashboard" });
        expect(button).toHaveTextContent("1");
        expect(button).toHaveAttribute("aria-haspopup", "dialog");
        expect(button).toHaveAttribute("aria-expanded", "false");
    });

    it("should render insight usages on dashboards component with used on 2 dashboards", () => {
        const { container } = renderComponent({
            insightUsageOnDashboard: buildInsightUsageOnDashboards([
                { name: "Sale", identifier: "Bee", id: 1 },
                { name: "Sale2", identifier: "Bee2", id: 2 },
            ]),
        });

        expect(container.querySelectorAll(".s-gd-insight-usage-on-dashboards")).toHaveLength(1);
        const button = screen.getByRole("button", { name: "Used on 2 dashboards" });
        expect(button).toHaveTextContent("2");
        expect(button).toHaveAttribute("aria-haspopup", "dialog");
        expect(button).toHaveAttribute("aria-expanded", "false");
    });

    it("should mark the usage button as expanded while the overlay is open", () => {
        renderComponent({
            insightUsageOnDashboard: buildInsightUsageOnDashboards([
                { name: "Sale", identifier: "Bee", id: 1 },
            ]),
        });
        const button = screen.getByRole("button", { name: "Used on 1 dashboard" });
        fireEvent.click(button);

        expect(button).toHaveAttribute("aria-expanded", "true");
        const dialog = screen.getByRole("dialog", { hidden: true });
        const labelId = dialog.getAttribute("aria-labelledby") ?? "";
        expect(document.getElementById(labelId)).toHaveTextContent("Used in");
    });

    it("should render dashboard item with suffix 'Editing now' in embedded mode", () => {
        const { container } = renderComponent({
            isEmbedded: true,
            sourceDashboardIdentifier: "Bee",
            insightUsageOnDashboard: buildInsightUsageOnDashboards([
                { name: "Sale", identifier: "Bee", id: 1 },
            ]),
        });
        const insightUsageOnDashboardsButton = container.querySelector(
            '[data-testid="s-insight-usages-of-dashboards-link"]',
        );
        fireEvent.click(insightUsageOnDashboardsButton);

        expect(document.querySelectorAll(".s-gd-insight-usage-on-dashboards")).toHaveLength(1);
        expect(document.querySelector(".s-usages-overlay-body .gd-dashboard-link").textContent).toEqual(
            "Sale",
        );
        expect(
            document.querySelector(".s-usages-overlay-body .editing-now .gd-dashboard-link-hover-icon")
                .textContent,
        ).toEqual("Editing now");
    });

    it("should link to other dashboards but not to the dashboard being edited", () => {
        const { container } = renderComponent({
            sourceDashboardIdentifier: "Bee",
            insightUsageOnDashboard: buildInsightUsageOnDashboards([
                { name: "Sale", identifier: "Bee", id: 1 },
                { name: "Sale1", identifier: "Bee1", id: 2 },
            ]),
        });
        fireEvent.click(container.querySelector('[data-testid="s-insight-usages-of-dashboards-link"]'));

        const links = Array.from(document.querySelectorAll<HTMLAnchorElement>(".s-usage-item a"));
        expect(links.map((link) => link.textContent)).toEqual(["Sale1"]);
    });

    it("should render expected dialog content when insight is used only on one dashboard that is not accessible", () => {
        const { container } = renderComponent({
            sourceDashboardIdentifier: "Bee",
            insightUsageOnDashboard: {
                accessibleDashboards: [],
                allDashboards: [createAnalyticalDashboard("Sale", "Bee", 1)],
                inaccessibleDashboardsCount: 1,
                allDashboardsCount: 1,
            },
        });
        fireEvent.click(container.querySelector('[data-testid="s-insight-usages-of-dashboards-link"]'));

        expect(document.querySelectorAll(".s-usage-item")).toHaveLength(0);
        expect(document.querySelector(".s-usages-inaccessible-dashboards-only").textContent).toEqual(
            "1 dashboard not shared with you",
        );
    });

    it("should render expected dialog content when insight is used also on on dashboards that is not accessible", () => {
        const { container } = renderComponent({
            sourceDashboardIdentifier: "Bee",
            insightUsageOnDashboard: {
                accessibleDashboards: [],
                allDashboards: [
                    createAnalyticalDashboard("Sale", "Bee", 1),
                    createAnalyticalDashboard("Sale 2", "Fee", 2),
                ],
                inaccessibleDashboardsCount: 2,
                allDashboardsCount: 2,
            },
        });
        fireEvent.click(container.querySelector('[data-testid="s-insight-usages-of-dashboards-link"]'));

        expect(document.querySelectorAll(".s-usage-item")).toHaveLength(0);
        expect(document.querySelector(".s-usages-inaccessible-dashboards-only").textContent).toEqual(
            "2 dashboards not shared with you",
        );
    });

    it("should render expected dialog content when some referenced dashboard are not accessible", () => {
        const { container } = renderComponent({
            sourceDashboardIdentifier: "Bee",
            insightUsageOnDashboard: {
                accessibleDashboards: [createAnalyticalDashboard("Sale", "Bee", 1)],
                allDashboards: [
                    createAnalyticalDashboard("Sale", "Bee", 1),
                    createAnalyticalDashboard("Sale 2", "Fee", 2),
                ],
                inaccessibleDashboardsCount: 1,
                allDashboardsCount: 2,
            },
        });
        fireEvent.click(container.querySelector('[data-testid="s-insight-usages-of-dashboards-link"]'));

        expect(document.querySelectorAll(".s-usage-item")).toHaveLength(1);
        expect(document.querySelector(".s-usages-inaccessible-dashboards").textContent).toEqual(
            "and 1 more not shared with you",
        );
    });

    it("should render expected dialog content when insight is used also on multiple dashboards are not accessible", () => {
        const { container } = renderComponent({
            sourceDashboardIdentifier: "Bee",
            insightUsageOnDashboard: {
                accessibleDashboards: [createAnalyticalDashboard("Sale", "Bee", 1)],
                allDashboards: [
                    createAnalyticalDashboard("Sale", "Bee", 1),
                    createAnalyticalDashboard("Sale 2", "Fee", 2),
                    createAnalyticalDashboard("Sale 3", "Qee", 3),
                ],
                inaccessibleDashboardsCount: 2,
                allDashboardsCount: 3,
            },
        });
        fireEvent.click(container.querySelector('[data-testid="s-insight-usages-of-dashboards-link"]'));

        expect(document.querySelectorAll(".s-usage-item")).toHaveLength(1);
        expect(document.querySelector(".s-usages-inaccessible-dashboards").textContent).toEqual(
            "and 2 more not shared with you",
        );
    });

    describe("dashboard links", () => {
        it("should link the dashboard to a new tab outside embedded mode", () => {
            const { container } = renderComponent({
                insightUsageOnDashboard: buildInsightUsageOnDashboards([
                    { name: "Sale1", identifier: "Bee1", id: 2 },
                ]),
            });
            fireEvent.click(container.querySelector('[data-testid="s-insight-usages-of-dashboards-link"]'));
            const link = document.querySelector<HTMLAnchorElement>(".s-usage-item a");

            expect(link.href).toEqual("http://localhost:3000/Bee1");
            expect(link.target).toEqual("_blank");
        });

        it("should not link the dashboard in embedded mode", () => {
            const { container } = renderComponent({
                isEmbedded: true,
                insightUsageOnDashboard: buildInsightUsageOnDashboards([
                    { name: "Sale1", identifier: "Bee1", id: 2 },
                ]),
            });
            fireEvent.click(container.querySelector('[data-testid="s-insight-usages-of-dashboards-link"]'));

            expect(document.querySelector(".s-usage-item").textContent).toEqual("Sale1");
            expect(document.querySelector(".s-usage-item a")).toBeNull();
        });
    });

    describe("documents", () => {
        const documents: IInsightUsageInDocumentItem[] = [
            { id: "doc1", title: "Board pack" },
            { id: "doc2", title: "Weekly review" },
        ];

        it("should count and describe documents when no dashboard uses the visualization", () => {
            renderComponent({ insightUsageOnDashboard: NO_DASHBOARDS, documents });

            const button = screen.getByRole("button", { name: "Used in 2 reports" });
            expect(button).toHaveTextContent("2");
        });

        it("should combine the dashboard and document counts", () => {
            renderComponent({
                insightUsageOnDashboard: buildInsightUsageOnDashboards([
                    { name: "Sale", identifier: "Bee", id: 1 },
                ]),
                documents,
            });

            const button = screen.getByRole("button", { name: "Used in 1 dashboard and 2 reports" });
            expect(button).toHaveTextContent("3");
        });

        it("should list dashboards and documents in separate groups", () => {
            renderComponent({
                insightUsageOnDashboard: buildInsightUsageOnDashboards([
                    { name: "Sale", identifier: "Bee", id: 1 },
                ]),
                documents,
            });
            fireEvent.click(screen.getByRole("button", { name: "Used in 1 dashboard and 2 reports" }));

            const overlay = within(document.querySelector<HTMLElement>(".s-usages-overlay-body"));
            expect(overlay.getByText("Dashboards (1)").closest("button")).toBeInTheDocument();
            expect(overlay.getByText("Reports (2)").closest("button")).toBeInTheDocument();
            expect(document.querySelectorAll(".s-usage-item")).toHaveLength(1);
            expect(
                Array.from(document.querySelectorAll(".s-usage-document-item")).map(
                    (item) => item.textContent,
                ),
            ).toEqual(["Board pack", "Weekly review"]);
        });

        it("should collapse a group", () => {
            renderComponent({ insightUsageOnDashboard: NO_DASHBOARDS, documents });
            fireEvent.click(screen.getByRole("button", { name: "Used in 2 reports" }));
            const overlay = within(document.querySelector<HTMLElement>(".s-usages-overlay-body"));
            const groupToggle = overlay.getByText("Reports (2)").closest("button");

            fireEvent.click(groupToggle);

            expect(groupToggle).toHaveAttribute("aria-expanded", "false");
            expect(document.querySelectorAll(".s-usage-document-item")).toHaveLength(0);
        });

        it("should link the report to a new tab", () => {
            renderComponent({ insightUsageOnDashboard: NO_DASHBOARDS, documents });
            fireEvent.click(screen.getByRole("button", { name: "Used in 2 reports" }));
            const link = document.querySelector<HTMLAnchorElement>(".s-usage-document-item a");

            expect(link.href).toEqual("http://localhost:3000/document/doc1");
            expect(link.target).toEqual("_blank");
        });

        it("should not link the report in embedded mode", () => {
            renderComponent({ insightUsageOnDashboard: NO_DASHBOARDS, documents, isEmbedded: true });
            fireEvent.click(screen.getByRole("button", { name: "Used in 2 reports" }));

            expect(document.querySelector(".s-usage-document-item a")).toBeNull();
        });
    });
});
