// (C) 2007-2021 GoodData Corporation
import { PositionType } from "../../types.js";
import { ILegendDetails, getLegendDetails, ILegendDetailOptions } from "../helpers.js";
import { ContentRect } from "react-measure";
import { describe, it, expect } from "vitest";

describe("helpers", () => {
    const NULLABLE_VALUE: any = null;

    describe("getLegendDetails", () => {
        const TEST_DATA: [
            number,
            number,
            boolean | "autoPositionWithPopup",
            string,
            PositionType,
            string,
            boolean,
            ILegendDetails,
        ][] = [
            [
                NULLABLE_VALUE,
                NULLABLE_VALUE,
                "autoPositionWithPopup",
                "legendLabel",
                "bottom",
                "line",
                false,
                NULLABLE_VALUE,
            ],
            [
                100,
                100,
                "autoPositionWithPopup",
                "legendLabel",
                "bottom",
                "line",
                false,
                {
                    maxRows: 1,
                    name: "legendLabel",
                    position: "top",
                    renderPopUp: true,
                },
            ],
            [
                100,
                400,
                "autoPositionWithPopup",
                "legendLabel",
                "bottom",
                "line",
                false,
                {
                    maxRows: 2,
                    name: "legendLabel",
                    position: "top",
                    renderPopUp: true,
                },
            ],
            [
                700,
                100,
                "autoPositionWithPopup",
                "legendLabel",
                "bottom",
                "line",
                false,
                {
                    name: "legendLabel",
                    position: "right",
                    renderPopUp: false,
                },
            ],
            [
                700,
                200,
                "autoPositionWithPopup",
                "legendLabel",
                "bottom",
                "line",
                false,
                {
                    maxRows: 1,
                    name: "legendLabel",
                    position: "bottom",
                    renderPopUp: true,
                },
            ],
            [
                700,
                200,
                "autoPositionWithPopup",
                "legendLabel",
                "left",
                "line",
                false,
                {
                    name: "legendLabel",
                    position: "left",
                    renderPopUp: false,
                },
            ],
            [
                700,
                300,
                "autoPositionWithPopup",
                "legendLabel",
                "bottom",
                "line",
                false,
                {
                    maxRows: 2,
                    name: "legendLabel",
                    position: "bottom",
                    renderPopUp: true,
                },
            ],
            [
                700,
                300,
                "autoPositionWithPopup",
                "legendLabel",
                "left",
                "line",
                false,
                {
                    name: "legendLabel",
                    position: "left",
                    renderPopUp: false,
                },
            ],
            [
                400,
                200,
                true,
                "legendLabel",
                "left",
                "line",
                false,
                {
                    position: "left",
                    renderPopUp: false,
                    name: undefined,
                },
            ],
            [
                400,
                200,
                true,
                "legendLabel",
                "top",
                "heatmap",
                false,
                {
                    position: "top",
                    renderPopUp: false,
                    name: undefined,
                },
            ],
            [
                400,
                200,
                true,
                "legendLabel",
                NULLABLE_VALUE,
                "heatmap",
                false,
                {
                    position: "right",
                    renderPopUp: false,
                    name: undefined,
                },
            ],
            [
                400,
                200,
                true,
                "legendLabel",
                "left",
                "heatmap",
                true,
                {
                    position: "bottom",
                    renderPopUp: false,
                    name: undefined,
                },
            ],
            [
                400,
                200,
                true,
                "legendLabel",
                "top",
                "heatmap",
                true,
                {
                    position: "top",
                    renderPopUp: false,
                    name: undefined,
                },
            ],
        ];

        it.each(TEST_DATA)(
            "should return config for given dimensions %s, %s, responsive: %s, label: %s, user position: %s, chartType: %s, showFluidLegend: %s",
            (width, height, responsive, legendLabel, position, chartType, showFluidLegend, expected) => {
                const contentRect: ContentRect = {
                    client: {
                        top: 0,
                        left: 0,
                        width,
                        height,
                    },
                };
                const legendDetailOptions: ILegendDetailOptions = {
                    contentRect,
                    showFluidLegend,
                    legendLabel,
                    isHeatmap: chartType === "heatmap",
                };
                const legendDetails = getLegendDetails(position, responsive, legendDetailOptions);
                expect(legendDetails).toEqual(expected);
            },
        );
    });
});
