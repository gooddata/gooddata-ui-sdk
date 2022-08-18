// (C) 2022 GoodData Corporation
import React from "react";
import { IntlProvider } from "react-intl";
import { pickCorrectWording, messagesMap } from "@gooddata/sdk-ui";
import userEvent from "@testing-library/user-event";
import { render, screen, waitFor, within } from "@testing-library/react";
import noop from "lodash/noop";
import { ChartSortingOwnProps, ChartSortingWithIntl } from "../ChartSorting";
import {
    singleNormalAttributeSortConfig,
    singleAreaAttributeSortConfig,
    multipleAttributesSortConfig,
} from "./mock";

import { IBucketItemDescriptors } from "../types";

const bucketItems: IBucketItemDescriptors = {
    m1: {
        type: "measure",
        name: "Snapshot",
        sequenceNumber: "M1",
    },
    m2: {
        type: "measure",
        name: "Timeline",
        sequenceNumber: "M2",
    },
    m3: {
        type: "measure",
        name: "NrOfOppor.",
        sequenceNumber: "M3",
    },
    a1: {
        type: "attribute",
        name: "Account",
    },
    a2: {
        type: "attribute",
        name: "Activity",
    },
};

const DefaultLocale = "en-US";

const messages = pickCorrectWording(messagesMap[DefaultLocale], {
    workspace: "mockWorkspace",
    enableRenamingMeasureToMetric: true,
});

const renderComponent = (props?: Partial<ChartSortingOwnProps>) => {
    const defaultProps: ChartSortingOwnProps = {
        ...singleNormalAttributeSortConfig,
        bucketItems: bucketItems,
        onApply: noop,
        onCancel: noop,
    };

    return render(
        <IntlProvider key={DefaultLocale} locale={DefaultLocale} messages={messages}>
            <ChartSortingWithIntl {...defaultProps} {...props} />
        </IntlProvider>,
    );
};

describe("ChartSorting", () => {
    describe("Attribute Normal Sort with no metrics", () => {
        beforeEach(() => {
            renderComponent();
        });
        it("should render dialog with correct values", () => {
            expect(screen.getByText("Z to A")).toBeInTheDocument();
        });

        it("should set correct attribute dropdown value", async () => {
            await userEvent.click(screen.getByText("Z to A"));
            expect(screen.queryByText("A to Z")).toBeInTheDocument();
        });
    });

    describe("Chronological date sorts", () => {
        beforeEach(() => {
            renderComponent({
                bucketItems: {
                    ...bucketItems,
                    a1: {
                        type: "chronologicalDate",
                        name: "Activity",
                    },
                },
            });
        });
        it("should render dialog with correctly preselected value when config with just one chronological asc date is provided", () => {
            expect(screen.getByText("Newest to oldest")).toBeInTheDocument();
        });

        it("should render dialog with correctly preselected value when config with just one chronological desc date is provided", async () => {
            await userEvent.click(screen.getByText("Newest to oldest"));
            expect(screen.queryByText("Oldest to newest")).toBeInTheDocument();
        });
    });

    describe("Generic date sorts", () => {
        beforeEach(() => {
            renderComponent({
                bucketItems: {
                    ...bucketItems,
                    a1: {
                        type: "genericDate",
                        name: "Activity",
                    },
                },
            });
        });

        it("should render dialog with correctly preselected value when config with just one chronological asc date is provided", () => {
            expect(screen.getByText("Default")).toBeInTheDocument();
        });
    });

    describe("Attribute Area Sort with no metrics", () => {
        beforeEach(() => {
            renderComponent({
                ...singleAreaAttributeSortConfig,
            });
        });

        it("should render dialog with correct values and measure dropdown disabled", () => {
            expect(screen.getByText("Total")).toBeInTheDocument();
            expect(screen.getByText("Smallest to largest")).toBeInTheDocument();
            expect(screen.getByText("Total").closest("button")).toHaveClass("disabled");
        });

        it("should allow to set normal attribute sort item and hide measure dropdown", async () => {
            await userEvent.click(screen.getByText("Smallest to largest"));

            expect(screen.getByText("A to Z")).toBeInTheDocument();
            expect(screen.getAllByText("Smallest to largest")[0]).toBeInTheDocument();

            await userEvent.click(screen.getByText("Z to A"));
            expect(screen.getByText("Z to A")).toBeInTheDocument();

            expect(screen.queryByText("Sum of all metrics (total)")).not.toBeInTheDocument();
        });
    });

    describe("Attribute Area sort with multiple Metrics", () => {
        beforeEach(() => {
            renderComponent({
                ...multipleAttributesSortConfig,
            });
        });

        it("should render dialog with correct values", () => {
            const sortAttributes = screen.getAllByLabelText(/sort-attribute/i);

            expect(within(sortAttributes[0]).getByText("Largest to smallest")).toBeInTheDocument();
            expect(within(sortAttributes[1]).getByText("Smallest to largest")).toBeInTheDocument();
        });

        it("should allow to change metric dropdown", async () => {
            await userEvent.click(screen.getByText("Snapshot (M1)"));
            await userEvent.click(screen.getByText("Timeline").closest("button"));
            expect(screen.getByText("Timeline (M2)")).toBeInTheDocument();
        });
    });

    describe("onCancel", () => {
        it("should call onCancel when Cancel button is clicked", async () => {
            const onCancel = jest.fn();
            renderComponent({ onCancel });

            await userEvent.click(screen.getByText("Cancel"));
            expect(onCancel).toHaveBeenCalled();
        });
    });

    describe("onApply", () => {
        it("should not call onApply when disabled Apply button is clicked", async () => {
            const onApply = jest.fn();
            renderComponent({ onApply });

            await userEvent.click(screen.getByText(/Apply/i).closest("button"));
            expect(screen.getByText(/Apply/i).closest("button")).toHaveClass("disabled");
            expect(onApply).not.toHaveBeenCalled();
        });

        it("should call onApply when Apply button is clicked", async () => {
            const onApply = jest.fn();
            renderComponent({ onApply });

            await userEvent.click(screen.getByText("Z to A"));
            await userEvent.click(screen.getByText("A to Z"));
            await userEvent.click(screen.getByText(/Apply/i).closest("button"));

            expect(screen.getByText(/Apply/i).closest("button")).not.toHaveClass("disabled");
            expect(onApply).toHaveBeenCalled();
        });

        it("should call onApply for simple normal attribute with correct SortItem payload", async () => {
            const onApply = jest.fn();
            renderComponent({
                onApply,
                ...singleNormalAttributeSortConfig,
            });

            await userEvent.click(screen.getByText("Z to A"));
            await userEvent.click(screen.getByText("A to Z"));
            await userEvent.click(screen.getByText(/Apply/i).closest("button"));

            expect(onApply).toHaveBeenCalledWith([
                {
                    attributeSortItem: {
                        attributeIdentifier: "a1",
                        direction: "asc",
                    },
                },
            ]);
        });

        it("should call onApply for simple area attribute with correct SortItem payload", async () => {
            const onApply = jest.fn();
            renderComponent({
                onApply,
                ...singleAreaAttributeSortConfig,
            });

            await userEvent.click(screen.getByText("Smallest to largest"));
            await userEvent.click(screen.getByText("Largest to smallest"));
            await userEvent.click(screen.getByText(/Apply/i).closest("button"));

            expect(onApply).toHaveBeenCalledWith([
                {
                    attributeSortItem: {
                        aggregation: "sum",
                        attributeIdentifier: "a1",
                        direction: "desc",
                    },
                },
            ]);
        });

        it("should call onApply for multiple attributes with correct SortItem payload", async () => {
            const onApply = jest.fn();
            renderComponent({
                onApply,
                ...multipleAttributesSortConfig,
            });

            const secondAttribute = screen.getByText("Smallest to largest").closest("button");
            await userEvent.click(secondAttribute);

            const secondSort = screen.queryAllByText("Largest to smallest")[1];
            await userEvent.click(secondSort);

            await userEvent.click(screen.getByText(/Apply/i).closest("button"));
            await waitFor(() => {
                expect(onApply).toHaveBeenCalledWith([
                    {
                        measureSortItem: {
                            direction: "desc",
                            locators: [
                                {
                                    measureLocatorItem: {
                                        measureIdentifier: "m1",
                                    },
                                },
                            ],
                        },
                    },
                    {
                        attributeSortItem: {
                            attributeIdentifier: "a2",
                            direction: "desc",
                            aggregation: "sum",
                        },
                    },
                ]);
            });
        });

        it("should render when current sort does not match available sorts length", () => {
            renderComponent({
                availableSorts: multipleAttributesSortConfig.availableSorts,
                currentSort: singleNormalAttributeSortConfig.currentSort,
            });

            expect(screen.queryAllByLabelText(/sort-attribute/i).length).toBe(1);
        });
    });
});
