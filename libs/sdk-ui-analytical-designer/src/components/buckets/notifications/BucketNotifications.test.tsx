// (C) 2020-2026 GoodData Corporation

import { fireEvent, render, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { type IRemovedItems } from "../../../store/bucket_notifications/bucket_notifications_types.js";
import { getIntlOptions, withIntl } from "../../../utils/with_intl.js";
import { withRedux } from "../../../utils/with_redux.js";

import { BucketNotifications, type IBucketNotificationsStateProps } from "./BucketNotifications.js";
import { type IHiddenItems } from "./hidden_bucket_items_selector.js";

vi.hoisted(() => {
    vi.resetModules();
});

const { getRemovedItemsMock, hiddenBucketItemsSelectorMock } = vi.hoisted(() => ({
    getRemovedItemsMock: vi.fn(),
    hiddenBucketItemsSelectorMock: vi.fn(),
}));

// The component reads both values from the store; the tests drive them directly, so the
// (memoised) selectors are stubbed and no state subtree has to be seeded.
vi.mock("../../../store/bucket_notifications/bucket_notifications_selector.js", async (importOriginal) => {
    const actual = await importOriginal<
        // oxlint-disable-next-line @typescript-eslint/consistent-type-imports
        typeof import("../../../store/bucket_notifications/bucket_notifications_selector.js")
    >();
    return {
        ...actual,
        getRemovedItems: getRemovedItemsMock,
    };
});

vi.mock("./hidden_bucket_items_selector.js", async (importOriginal) => {
    // oxlint-disable-next-line @typescript-eslint/consistent-type-imports
    const actual = await importOriginal<typeof import("./hidden_bucket_items_selector.js")>();
    return {
        ...actual,
        hiddenBucketItemsSelector: hiddenBucketItemsSelectorMock,
    };
});

const intlOptions = getIntlOptions({
    "bucket_notification.body.hiddenItem": "hiddenItem",
    "bucket_notification.body.hiddenItems": "hiddenItems",
    "bucket_notification.body.removedItem": "removedItem",
    "bucket_notification.body.removedItems": "removedItems",
    "bucket_notification.granularityChanged.forSingleFilter": "forSingleFilter",
    "bucket_notification.granularityChanged.forMultipleFilters": "forMultipleFilters",
});

function renderComponent({ removedBucketItems, hiddenBucketItems }: IBucketNotificationsStateProps) {
    getRemovedItemsMock.mockReturnValue(removedBucketItems);
    hiddenBucketItemsSelectorMock.mockReturnValue(hiddenBucketItems);

    const Component = withRedux(withIntl(BucketNotifications, intlOptions));
    return render(<Component />);
}

const removedBucketItems: IRemovedItems = {
    measures: 6,
    measureValueFilters: 8,
    rankingFilter: true,
};

const hiddenBucketItems: IHiddenItems = {
    attributes: 2,
    measures: 6,
    measureValueFilters: 8,
    rankingFilter: true,
};

describe("BucketNotifications", () => {
    it("should not render the component when there are no notifications", () => {
        const { container } = renderComponent({
            removedBucketItems: null,
            hiddenBucketItems: null,
        });
        expect(container.querySelector(".s-bucket-notifications")).toBeFalsy();
        expect(container.querySelector(".s-removed-items-notification")).toBeFalsy();
        expect(container.querySelector(".s-hidden-items-notification")).toBeFalsy();
    });

    it("should render the component and all the types of notifications at once", () => {
        const { container } = renderComponent({
            removedBucketItems,
            hiddenBucketItems,
        });
        const notifications = container.querySelector(".s-bucket-notifications");

        expect(notifications).toBeTruthy();
        expect(notifications.querySelector(".s-removed-items-notification")).toBeTruthy();
        expect(notifications.querySelector(".s-hidden-items-notification")).toBeTruthy();
    });

    it("should build expected test className for removed items notification", () => {
        const { container } = renderComponent({
            removedBucketItems,
            hiddenBucketItems: null,
        });
        expect(container.querySelector(".s-removed-items-notification--m-6--mvf-8--rf-true")).toBeTruthy();
    });

    it("should build expected test className for removed items notification when ranking filter was not removed", () => {
        const { container } = renderComponent({
            removedBucketItems: {
                ...removedBucketItems,
                rankingFilter: false,
            },
            hiddenBucketItems: null,
        });
        expect(container.querySelector(".s-removed-items-notification--m-6--mvf-8--rf-false")).toBeTruthy();
    });

    it("should build expected test className for hidden items notification", () => {
        const { container } = renderComponent({
            removedBucketItems: null,
            hiddenBucketItems,
        });
        expect(
            container.querySelector(".s-hidden-items-notification--a-2--m-6--mvf-8--rf-true"),
        ).toBeTruthy();
    });

    it("should build expected test className for hidden items notification when ranking filter is not hidden", () => {
        const { container } = renderComponent({
            removedBucketItems: null,
            hiddenBucketItems: {
                ...hiddenBucketItems,
                rankingFilter: false,
            },
        });
        expect(
            container.querySelector(".s-hidden-items-notification--a-2--m-6--mvf-8--rf-false"),
        ).toBeTruthy();
    });

    it("should render tooltip for notification", () => {
        const { container } = renderComponent({
            removedBucketItems,
            hiddenBucketItems,
        });
        const bubbleTrigger = container.querySelectorAll(".gd-bubble-trigger");
        expect(bubbleTrigger).toHaveLength(2);
    });

    describe("notification message", () => {
        it.each([
            [0, 1, false, "removedItem"],
            [1, 0, false, "removedItem"],
            [1, 1, false, "removedItems"],
            [0, 1, true, "removedItems"],
            [1, 0, true, "removedItems"],
            [1, 1, true, "removedItems"],
        ])(
            "should render expected notification for %s removed measure(s), %s measure value filter(s), and ranking filter with removal status %s",
            (
                measures: number,
                measureValueFilters: number,
                rankingFilter: boolean,
                expectedMessage: string,
            ) => {
                const { container } = renderComponent({
                    removedBucketItems: {
                        measures,
                        measureValueFilters,
                        rankingFilter,
                    },
                    hiddenBucketItems: null,
                });
                expect(container.querySelector(".s-bucket-notification-message").textContent).toEqual(
                    expectedMessage,
                );
            },
        );

        it.each([
            [0, 0, 1, false, "hiddenItem"],
            [0, 1, 0, false, "hiddenItem"],
            [0, 1, 1, false, "hiddenItems"],
            [1, 0, 0, false, "hiddenItem"],
            [1, 0, 1, false, "hiddenItems"],
            [1, 1, 0, false, "hiddenItems"],
            [1, 1, 1, false, "hiddenItems"],
            [0, 0, 1, true, "hiddenItems"],
            [0, 1, 0, true, "hiddenItems"],
            [0, 1, 1, true, "hiddenItems"],
            [1, 0, 0, true, "hiddenItems"],
            [1, 0, 1, true, "hiddenItems"],
            [1, 1, 0, true, "hiddenItems"],
            [1, 1, 1, true, "hiddenItems"],
        ])(
            "should render expected notification for %s hidden attribute(s), %s measure(s), %s measure value filter(s), and ranking filter visibility %s",
            (
                attributes: number,
                measures: number,
                measureValueFilters: number,
                rankingFilter: boolean,
                expectedMessage: string,
            ) => {
                const { container } = renderComponent({
                    removedBucketItems: null,
                    hiddenBucketItems: {
                        attributes,
                        measures,
                        measureValueFilters,
                        rankingFilter,
                    },
                });
                expect(container.querySelector(".s-bucket-notification-message").textContent).toEqual(
                    expectedMessage,
                );
            },
        );
    });

    describe("notification tooltip", () => {
        it.each([
            [
                "removed items notification",
                removedBucketItems,
                null,
                "Removed items:metrics (6)metric value filters (8)top/bottom filter",
            ],
            [
                "hidden items notification",
                null,
                hiddenBucketItems,
                "Hidden items:attributes (2)metrics (6)metric value filters (8)top/bottom filter",
            ],
        ])(
            "should show notification with all item types for %s",
            async (
                _: string,
                removedBucketItems: IRemovedItems,
                hiddenBucketItems: IHiddenItems,
                expectedNotification: string,
            ) => {
                const { container } = renderComponent({
                    removedBucketItems,
                    hiddenBucketItems,
                });
                const bubbleControl = container.querySelectorAll(".gd-bubble-trigger");
                expect(bubbleControl).toHaveLength(1);

                fireEvent.mouseEnter(bubbleControl[0]);

                await waitFor(() => {
                    const bubble = document.querySelectorAll(".s-bucket-notification-tooltip");
                    expect(bubble).toHaveLength(1);
                    expect(bubble[0].textContent).toEqual(expectedNotification);
                });
            },
        );
    });
});
