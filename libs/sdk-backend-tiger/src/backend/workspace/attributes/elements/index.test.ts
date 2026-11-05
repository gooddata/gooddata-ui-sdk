// (C) 2026 GoodData Corporation

import { invariant } from "ts-invariant";
import { beforeAll, beforeEach, describe, expect, it, vi } from "vitest";

import { ActionsApi_ComputeLabelElementsPost } from "@gooddata/api-client-tiger/endpoints/labelElements";
import { idRef, newNegativeAttributeFilter, newPositiveAttributeFilter } from "@gooddata/sdk-model";

import { type TigerAuthenticatedCallGuard } from "../../../../types/index.js";

import { type TigerWorkspaceElements as TigerWorkspaceElementsClass } from "./index.js";

vi.mock("@gooddata/api-client-tiger/endpoints/labelElements", () => ({
    ActionsApi_ComputeLabelElementsPost: vi.fn().mockResolvedValue({
        data: {
            paging: { total: 0 },
            elements: [],
        },
    }),
}));

const authCall: TigerAuthenticatedCallGuard = async (fn) =>
    fn({ axios: {} } as any, { getPrincipal: () => Promise.resolve({}) } as any);

const lastElementsRequest = () => {
    const calls = vi.mocked(ActionsApi_ComputeLabelElementsPost).mock.calls;
    return calls[calls.length - 1][2].elementsRequest;
};

describe("TigerWorkspaceElementsQuery", () => {
    // The service is imported dynamically from a fresh module registry so that it picks up the mock
    // above even when another (non-isolated) test file already imported it without it.
    let factory: TigerWorkspaceElementsClass;

    beforeAll(async () => {
        vi.resetModules();
        const { TigerWorkspaceElements } = await import("./index.js");
        factory = new TigerWorkspaceElements(authCall, "workspace", (value) => value.toISOString());
    });

    beforeEach(() => {
        vi.mocked(ActionsApi_ComputeLabelElementsPost).mockClear();
    });

    describe("label type", () => {
        it("sends type computedAttribute for a computed attribute ref", async () => {
            await factory.forDisplayForm(idRef("shared_id", "computedAttribute")).query();

            expect(lastElementsRequest()).toMatchObject({ label: "shared_id", type: "computedAttribute" });
        });

        it("omits type for a display form ref", async () => {
            await factory.forDisplayForm(idRef("some_label", "displayForm")).query();

            expect(lastElementsRequest()).not.toHaveProperty("type");
        });

        it("omits type for an untyped ref", async () => {
            await factory.forDisplayForm(idRef("some_label")).query();

            expect(lastElementsRequest()).not.toHaveProperty("type");
        });
    });

    describe("number format", () => {
        const respond = (data: Record<string, unknown>) =>
            vi.mocked(ActionsApi_ComputeLabelElementsPost).mockResolvedValueOnce({
                data: {
                    paging: { total: 1 },
                    elements: [{ title: "1234.5", primaryTitle: "1234.5" }],
                    ...data,
                },
            } as any);

        it("carries the number format the backend states for a computed attribute", async () => {
            respond({ dataType: "NUMERIC", numberFormat: "[>=1000]#,.0 K;#,##0" });

            const result = await factory.forDisplayForm(idRef("ca", "computedAttribute")).query();

            expect(result.numberFormat).toBe("[>=1000]#,.0 K;#,##0");
            // the backend applies no formatting itself, the raw title stays for the client to format
            expect(result.items).toEqual([{ title: "1234.5", uri: "1234.5" }]);
        });

        it("defaults the number format of a numeric computed attribute without one", async () => {
            respond({ dataType: "INT" });

            const result = await factory.forDisplayForm(idRef("ca", "computedAttribute")).query();

            expect(result.numberFormat).toBe("#,##0.##");
        });

        it("has no number format for non-numeric computed attributes and regular labels", async () => {
            respond({ dataType: "STRING", numberFormat: "#,##0" });
            expect(
                (await factory.forDisplayForm(idRef("ca", "computedAttribute")).query()).numberFormat,
            ).toBeUndefined();

            respond({});
            expect(
                (await factory.forDisplayForm(idRef("some_label", "displayForm")).query()).numberFormat,
            ).toBeUndefined();
        });

        it("keeps the number format on the next page", async () => {
            respond({ dataType: "NUMERIC", numberFormat: "#,##0", paging: { total: 2 } });
            const first = await factory.forDisplayForm(idRef("ca", "computedAttribute")).withLimit(1).query();
            const callsAfterFirstPage = vi.mocked(ActionsApi_ComputeLabelElementsPost).mock.calls.length;

            respond({ dataType: "NUMERIC", numberFormat: "#,##0", paging: { total: 2 } });
            const second = await first.next();

            // the second page really comes from the backend
            expect(vi.mocked(ActionsApi_ComputeLabelElementsPost).mock.calls.length).toBe(
                callsAfterFirstPage + 1,
            );
            expect(second.numberFormat).toBe("#,##0");
        });
    });

    describe("date format", () => {
        const format = { locale: "en-US", pattern: "dd.MM.yyyy" };
        const respond = (data: Record<string, unknown>) =>
            vi.mocked(ActionsApi_ComputeLabelElementsPost).mockResolvedValueOnce({
                data: {
                    paging: { total: 1 },
                    elements: [{ title: "2026-03-15", primaryTitle: "2026-03-15" }],
                    ...data,
                },
            } as any);
        // the factory's date formatter renders the parsed date as an ISO string
        const parsedDay = new Date(2026, 2, 15).toISOString();

        it("formats values of a DATE computed attribute without granularity as days", async () => {
            respond({ dataType: "DATE", format });

            const result = await factory.forDisplayForm(idRef("ca", "computedAttribute")).query();

            expect(result.items).toEqual([
                {
                    title: "2026-03-15",
                    uri: "2026-03-15",
                    formattedTitle: parsedDay,
                    normalizedValue: parsedDay,
                },
            ]);
        });

        it.each(["TIMESTAMP", "TIMESTAMP_TZ"])(
            "formats values of a %s computed attribute without granularity as seconds",
            async (dataType) => {
                respond({
                    dataType,
                    format,
                    elements: [{ title: "2026-03-15 14:05:09", primaryTitle: "2026-03-15 14:05:09" }],
                });
                const parsedSecond = new Date(2026, 2, 15, 14, 5, 9).toISOString();

                const result = await factory.forDisplayForm(idRef("ca", "computedAttribute")).query();

                expect(result.items).toEqual([
                    {
                        title: "2026-03-15 14:05:09",
                        uri: "2026-03-15 14:05:09",
                        formattedTitle: parsedSecond,
                        normalizedValue: parsedSecond,
                    },
                ]);
            },
        );

        it("keeps the raw values of a computed attribute with a format that cannot be applied", async () => {
            const warn = vi.spyOn(invariant, "warn").mockImplementation(() => {});
            respond({ dataType: "DATE", format });
            const Elements = factory.constructor as typeof TigerWorkspaceElementsClass;
            const failingFactory = new Elements(authCall, "workspace", () => {
                throw new Error("unsupported pattern");
            });

            const result = await failingFactory.forDisplayForm(idRef("ca", "computedAttribute")).query();

            expect(result.items).toEqual([
                {
                    title: "2026-03-15",
                    uri: "2026-03-15",
                    formattedTitle: "2026-03-15",
                    normalizedValue: parsedDay,
                },
            ]);
            expect(warn).toHaveBeenCalledOnce();
            warn.mockRestore();
        });

        it("keeps failing on a format of a date attribute that cannot be applied", async () => {
            respond({ granularity: "DAY", format });
            const Elements = factory.constructor as typeof TigerWorkspaceElementsClass;
            const failingFactory = new Elements(authCall, "workspace", () => {
                throw new Error("unsupported pattern");
            });

            await expect(
                failingFactory.forDisplayForm(idRef("some_label", "displayForm")).query(),
            ).rejects.toThrow();
        });

        it.each([
            ["a date attribute", { granularity: "SECOND" }, idRef("some_label", "displayForm")],
            ["a computed attribute", { dataType: "TIMESTAMP_TZ" }, idRef("ca", "computedAttribute")],
        ])(
            "formats values of %s in the timezone of their format, the same as in execution results",
            async (_, attribute, ref) => {
                const zonedFormat = {
                    locale: "en-US-x-24h",
                    pattern: "dd.MM.yyyy HH:mm",
                    timezone: "America/New_York",
                };
                respond({
                    ...attribute,
                    format: zonedFormat,
                    elements: [{ title: "2026-03-15 14:05:09", primaryTitle: "2026-03-15 14:05:09" }],
                });
                const dateFormatter = vi.fn((value: Date) => value.toISOString());
                const Elements = factory.constructor as typeof TigerWorkspaceElementsClass;

                const result = await new Elements(authCall, "workspace", dateFormatter)
                    .forDisplayForm(ref)
                    .query();

                // the value is New York time, 4 hours behind UTC in daylight saving time
                const parsed = "2026-03-15T18:05:09.000Z";
                expect(dateFormatter).toHaveBeenCalledWith(
                    new Date(parsed),
                    "GDC.time.second",
                    zonedFormat.locale,
                    zonedFormat.pattern,
                    zonedFormat.timezone,
                );
                expect(result.items[0]).toMatchObject({ formattedTitle: parsed, normalizedValue: parsed });
            },
        );

        it("does not format values of a granularity the SDK does not model and warns about it", async () => {
            const warn = vi.spyOn(invariant, "warn").mockImplementation(() => {});
            respond({ granularity: "FISCAL_WEEK", format });

            expect((await factory.forDisplayForm(idRef("some_label", "displayForm")).query()).items).toEqual([
                { title: "2026-03-15", uri: "2026-03-15" },
            ]);
            expect(warn).toHaveBeenCalledWith(expect.stringContaining('"FISCAL_WEEK"'));
            warn.mockRestore();
        });

        it("does not format values of a non-date computed attribute or a label without granularity", async () => {
            respond({ dataType: "STRING", format });
            expect((await factory.forDisplayForm(idRef("ca", "computedAttribute")).query()).items).toEqual([
                { title: "2026-03-15", uri: "2026-03-15" },
            ]);

            respond({ dataType: "STRING", granularity: "DAY", format });
            expect((await factory.forDisplayForm(idRef("ca", "computedAttribute")).query()).items).toEqual([
                { title: "2026-03-15", uri: "2026-03-15" },
            ]);

            respond({ format });
            expect((await factory.forDisplayForm(idRef("some_label", "displayForm")).query()).items).toEqual([
                { title: "2026-03-15", uri: "2026-03-15" },
            ]);
        });
    });

    describe("dependsOn type", () => {
        it("sends type of parent filters based on their refs", async () => {
            await factory
                .forDisplayForm(idRef("some_label", "displayForm"))
                .withAttributeFilters([
                    {
                        attributeFilter: newPositiveAttributeFilter(idRef("parent_ca", "computedAttribute"), [
                            "a",
                        ]),
                        overAttribute: idRef("connecting_attr"),
                    },
                    {
                        attributeFilter: newNegativeAttributeFilter(idRef("parent_label", "displayForm"), [
                            "b",
                        ]),
                        overAttribute: idRef("connecting_attr"),
                    },
                    {
                        attributeFilter: newPositiveAttributeFilter(idRef("parent_untyped"), ["c"]),
                        overAttribute: idRef("connecting_attr"),
                    },
                ])
                .query();

            expect(lastElementsRequest().dependsOn).toEqual([
                { label: "parent_ca", type: "computedAttribute", values: ["a"], complementFilter: false },
                { label: "parent_label", values: ["b"], complementFilter: true },
                { label: "parent_untyped", values: ["c"], complementFilter: false },
            ]);
        });
    });
});
