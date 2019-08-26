// (C) 2007-2018 GoodData Corporation
import * as React from "react";
import { mount } from "enzyme";
import { Execution } from "@gooddata/typings";

import { AddTotal } from "../AddTotal";
import { RemoveRows } from "../RemoveRows";
import { ITotalCellProps, TotalCell } from "../TotalCell";
import { ITotalWithData } from "../../../../../interfaces/Totals";
import { withIntl } from "../../../utils/intlUtils";

const WrappedTotalCell = withIntl(TotalCell);

describe("TotalCell", () => {
    function render(customProps = {}) {
        const header: Execution.IMeasureHeaderItem = {
            measureHeaderItem: {
                uri: "uri",
                identifier: "identifier",
                localIdentifier: "localIdentifier",
                name: "name",
                format: "format",
            },
        };

        const props: ITotalCellProps = {
            totalsWithData: [],
            editAllowed: false,
            headersCount: 3,
            columnIndex: 1,
            firstMeasureIndex: 1,
            header,
            ...customProps,
        };

        return mount(<WrappedTotalCell {...props} />);
    }

    const TOTALS: ITotalWithData[] = [
        {
            type: "sum",
            values: [null, 125],
            outputMeasureIndexes: [],
        },
        {
            type: "avg",
            values: [45.98, 12.32],
            outputMeasureIndexes: [],
        },
        {
            type: "nat",
            values: [12.99, 1.008],
            outputMeasureIndexes: [],
        },
    ];

    describe("totals edit not allowed", () => {
        it("should render no totals when totals not provided", () => {
            const wrapper = render();

            expect(wrapper.find(".indigo-table-footer-cell").length).toEqual(0);
        });

        it("should render totals when totals provided", () => {
            const wrapper = render({
                totalsWithData: TOTALS,
            });

            expect(wrapper.find(".indigo-table-footer-cell").length).toEqual(3);
        });

        it("should not render add total buttons", () => {
            const wrapper = render();

            expect(wrapper.find(AddTotal).length).toEqual(0);
        });

        it("should not render remove buttons when totals are provided", () => {
            const wrapper = render();

            expect(wrapper.find(RemoveRows).length).toEqual(0);
        });
    });

    describe("totals edit allowed", () => {
        it("should render footer cells for add totals buttons into column", () => {
            const wrapper = render({
                editAllowed: true,
            });

            expect(wrapper.find(".indigo-totals-add-cell").length).toEqual(1);
        });

        describe("columns edit", () => {
            it("should render enable total button when no columns enabled", () => {
                const wrapper = render({
                    editAllowed: true,
                    totalsWithData: [
                        {
                            type: "sum",
                            outputMeasureIndexes: [],
                            values: [45.98, 12.32],
                        },
                    ],
                });

                expect(wrapper.find(".indigo-totals-enable-column-button").length).toEqual(1);
            });

            it("should render disable total button when some column enabled", () => {
                const wrapper = render({
                    editAllowed: true,
                    totalsWithData: [
                        {
                            type: "sum",
                            outputMeasureIndexes: [0],
                            values: [45.98, 12.32],
                        },
                    ],
                });

                expect(wrapper.find(".indigo-totals-disable-column-button").length).toEqual(1);
            });

            it("should not render value when no column enabled", () => {
                const wrapper = render({
                    editAllowed: true,
                    totalsWithData: [
                        {
                            type: "sum",
                            outputMeasureIndexes: [],
                            values: [45.98, 12.32],
                        },
                    ],
                });

                expect(
                    wrapper
                        .find(".indigo-table-footer-cell")
                        .at(0)
                        .text().length,
                ).toBe(0);
            });

            it("should render value when some column enabled", () => {
                const wrapper = render({
                    editAllowed: true,
                    totalsWithData: [
                        {
                            type: "sum",
                            outputMeasureIndexes: [0],
                            values: [45.98, 12.32],
                        },
                    ],
                });

                expect(
                    wrapper
                        .find(".indigo-table-footer-cell")
                        .at(0)
                        .text().length,
                ).toBeGreaterThan(0);
            });

            it("should bind events on enable column buttons", () => {
                const events = {
                    onEnableColumn: jest.fn(),
                };
                const wrapper = render({
                    editAllowed: true,
                    totalsWithData: [
                        {
                            type: "sum",
                            outputMeasureIndexes: [],
                            values: [45.98, 12.32],
                        },
                    ],
                    ...events,
                });
                const button = wrapper.find(".indigo-totals-enable-column-button").at(0);
                button.simulate("click");

                expect(events.onEnableColumn).toBeCalledWith(1, "sum");
            });

            it("should bind events on disable column buttons", () => {
                const events = {
                    onDisableColumn: jest.fn(),
                };
                const wrapper = render({
                    editAllowed: true,
                    totalsWithData: [
                        {
                            type: "sum",
                            outputMeasureIndexes: [0],
                            values: [45.98, 12.32],
                        },
                    ],
                    ...events,
                });
                const button = wrapper.find(".indigo-totals-disable-column-button").at(0);
                button.simulate("click");

                expect(events.onDisableColumn).toBeCalledWith(1, "sum");
            });
        });

        describe("add totals buttons", () => {
            it("should not render into first column", () => {
                const wrapper = render({
                    editAllowed: true,
                    headersCount: 2,
                    columnIndex: 0,
                    header: { type: "measure" },
                });

                expect(wrapper.find(AddTotal).length).toEqual(0);
            });

            it("should render into other measure columns", () => {
                const wrapper = render({
                    editAllowed: true,
                });

                expect(wrapper.find(AddTotal).length).toEqual(1);
            });

            it("should not render into attribute column", () => {
                const wrapper = render({
                    editAllowed: true,
                    header: { type: "attribute" },
                });

                expect(wrapper.find(AddTotal).length).toEqual(0);
            });

            it("should bind mouse events on total cell", () => {
                const events = {
                    onCellMouseOver: jest.fn(),
                    onCellMouseLeave: jest.fn(),
                };
                const wrapper = render({
                    editAllowed: true,
                    totalsWithData: TOTALS,
                    ...events,
                });
                const cell = wrapper.find(".indigo-table-footer-cell.col-1").at(0);

                cell.simulate("mouseOver");

                expect(events.onCellMouseOver).toBeCalledWith(0, 1);

                cell.simulate("mouseLeave");

                expect(events.onCellMouseLeave).toBeCalledWith(0, 1);
            });
        });
    });
});
