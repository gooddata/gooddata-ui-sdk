// (C) 2019-2022 GoodData Corporation
import { InMemoryPaging } from "@gooddata/sdk-backend-base";
import { IDateFilterConfigsQuery, IDateFilterConfigsQueryResult } from "@gooddata/sdk-backend-spi";
import { idRef, IDateFilterConfig } from "@gooddata/sdk-model";
import invariant from "ts-invariant";

const DefaultDateFilterConfig: IDateFilterConfig = {
    ref: idRef("defaultDateFilterProjectConfig"),
    selectedOption: "THIS_MONTH",
    allTime: {
        localIdentifier: "ALL_TIME",
        type: "allTime",
        name: "",
        visible: true,
    },
    absoluteForm: {
        localIdentifier: "ABSOLUTE_FORM",
        type: "absoluteForm",
        name: "",
        visible: true,
    },
    relativeForm: {
        type: "relativeForm",
        // month has to be the first as it should be the default selected option
        availableGranularities: ["GDC.time.month", "GDC.time.date", "GDC.time.quarter", "GDC.time.year"],
        localIdentifier: "RELATIVE_FORM",
        name: "",
        visible: true,
    },
    relativePresets: [
        {
            from: -6,
            to: 0,
            granularity: "GDC.time.date",
            localIdentifier: "LAST_7_DAYS",
            type: "relativePreset",
            visible: true,
            name: "",
        },
        {
            from: -29,
            to: 0,
            granularity: "GDC.time.date",
            localIdentifier: "LAST_30_DAYS",
            type: "relativePreset",
            visible: true,
            name: "",
        },
        {
            from: -89,
            to: 0,
            granularity: "GDC.time.date",
            localIdentifier: "LAST_90_DAYS",
            type: "relativePreset",
            visible: true,
            name: "",
        },
        {
            from: 0,
            to: 0,
            granularity: "GDC.time.month",
            localIdentifier: "THIS_MONTH",
            type: "relativePreset",
            visible: true,
            name: "",
        },
        {
            from: -1,
            to: -1,
            granularity: "GDC.time.month",
            localIdentifier: "LAST_MONTH",
            type: "relativePreset",
            visible: true,
            name: "",
        },
        {
            from: -11,
            to: 0,
            granularity: "GDC.time.month",
            localIdentifier: "LAST_12_MONTHS",
            type: "relativePreset",
            visible: true,
            name: "",
        },
        {
            from: 0,
            to: 0,
            granularity: "GDC.time.quarter",
            localIdentifier: "THIS_QUARTER",
            type: "relativePreset",
            visible: true,
            name: "",
        },
        {
            from: -1,
            to: -1,
            granularity: "GDC.time.quarter",
            localIdentifier: "LAST_QUARTER",
            type: "relativePreset",
            visible: true,
            name: "",
        },
        {
            from: -3,
            to: 0,
            granularity: "GDC.time.quarter",
            localIdentifier: "LAST_4_QUARTERS",
            type: "relativePreset",
            visible: true,
            name: "",
        },
        {
            from: 0,
            to: 0,
            granularity: "GDC.time.year",
            localIdentifier: "THIS_YEAR",
            type: "relativePreset",
            visible: true,
            name: "",
        },
        {
            from: -1,
            to: -1,
            granularity: "GDC.time.year",
            localIdentifier: "LAST_YEAR",
            type: "relativePreset",
            visible: true,
            name: "",
        },
    ],
    absolutePresets: [],
};

export class TigerWorkspaceDateFilterConfigsQuery implements IDateFilterConfigsQuery {
    private limit: number | undefined;
    private offset: number | undefined;

    public withLimit(limit: number): IDateFilterConfigsQuery {
        invariant(limit > 0, `limit must be a positive number, got: ${limit}`);

        this.limit = limit;

        return this;
    }

    public withOffset(offset: number): IDateFilterConfigsQuery {
        this.offset = offset;
        return this;
    }

    public async query(): Promise<IDateFilterConfigsQueryResult> {
        return new InMemoryPaging([DefaultDateFilterConfig], this.limit, this.offset);
    }
}
