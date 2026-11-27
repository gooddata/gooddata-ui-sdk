// (C) 2026 GoodData Corporation

// @vitest-environment happy-dom

import { type AxiosResponse } from "axios";
import { beforeAll, describe, expect, it, vi } from "vitest";

import * as actionsApi from "@gooddata/api-client-tiger/endpoints/actions";

import { type TigerAuthenticatedCallGuard } from "../../types/index.js";

import { type TigerWorkspaceLocalizationService } from "./index.js";

vi.mock("@gooddata/api-client-tiger/endpoints/actions", async (importOriginal) => ({
    ...(await importOriginal<typeof actionsApi>()),
    ActionsApi_RetrieveTranslations: vi.fn(),
}));

const XLIFF = `<xliff xmlns="urn:oasis:names:tc:xliff:document:2.0" version="2.1" srcLang="en-US" trgLang="ja-JP">
    <file id="ws">
        <group id="metric">
            <group id="metric.amount">
                <unit id="metric.amount.title"><segment><source>Amount</source></segment></unit>
            </group>
        </group>
    </file>
</xliff>`;

describe("TigerWorkspaceLocalizationService.getMissingTranslations", () => {
    const authCall = vi.fn((callback) => callback({ axios: {}, basePath: "" }));
    let service: TigerWorkspaceLocalizationService;

    beforeAll(async () => {
        const { TigerWorkspaceLocalizationService } = await import("./index.js");
        service = new TigerWorkspaceLocalizationService(authCall as TigerAuthenticatedCallGuard, "ws");
    });

    it("downloads the workspace's translations as XML and lists the untranslated objects", async () => {
        vi.mocked(actionsApi.ActionsApi_RetrieveTranslations).mockResolvedValue({
            data: XLIFF,
        } as unknown as AxiosResponse);

        const missing = await service.getMissingTranslations("ja-JP");

        expect(actionsApi.ActionsApi_RetrieveTranslations).toHaveBeenCalledWith(
            {},
            "",
            { workspaceId: "ws", localeRequest: { locale: "ja-JP" } },
            { responseType: "text", headers: { Accept: "application/xml" } },
        );
        expect(missing).toEqual([
            { type: "measure", id: "amount", title: "Amount", missing: [{ text: "title", count: 1 }] },
        ]);
    });
});
