// (C) 2020-2026 GoodData Corporation

import { beforeEach, describe, expect, it } from "vitest";

import { EventCollector, MockBuilder, TestSourceDescriptor, TestTargetDescriptor } from "./fixture.js";
import {
    EventBus,
    type IPackagesRebuilt,
    packagesChanged,
    sourceInitialized,
    targetSelected,
} from "../../events.js";
import { BuildScheduler } from "../buildScheduler.js";

describe("BuildScheduler", () => {
    let eventBus: EventBus | undefined;
    let collector: EventCollector | undefined;

    beforeEach(() => {
        eventBus = new EventBus();
        collector = new EventCollector(eventBus, ["buildRequested", "packagesRebuilt"]);

        BuildScheduler.init(eventBus);
        MockBuilder.init(eventBus);

        eventBus.post(sourceInitialized(TestSourceDescriptor));
        eventBus.post(targetSelected(TestTargetDescriptor));
    });

    it("should build only single package if it is root", async () => {
        eventBus?.post(
            packagesChanged([{ packageName: "@gooddata/sdk-ui-ext", files: [], independent: false }]),
        );

        const packagesBuilt = (await collector?.waitFor("packagesRebuilt")) as IPackagesRebuilt;

        expect(packagesBuilt.body.packages).toMatchSnapshot();
    });

    it("should build the entire subtree if leaf changes", async () => {
        eventBus?.post(
            packagesChanged([{ packageName: "@gooddata/sdk-model", files: [], independent: false }]),
        );

        const packagesBuilt = (await collector?.waitFor("packagesRebuilt")) as IPackagesRebuilt;

        expect(packagesBuilt.body.packages).toMatchSnapshot();
    });

    it("should build single package if the package change is marked as independent", async () => {
        eventBus?.post(
            packagesChanged([{ packageName: "@gooddata/sdk-model", files: [], independent: true }]),
        );

        const packagesBuilt = (await collector?.waitFor("packagesRebuilt")) as IPackagesRebuilt;

        expect(packagesBuilt.body.packages).toMatchSnapshot();
    });
});
