// (C) 2020 GoodData Corporation
import { EventBus, packagesChanged, PackagesRebuilt, sourceInitialized, targetSelected } from "../../events";
import { EventCollector, MockBuilder, TestSourceDescriptor, TestTargetDescriptor } from "./fixture";
import { BuildScheduler } from "../buildScheduler";

describe("BuildScheduler", () => {
    let eventBus: EventBus | undefined;
    let collector: EventCollector | undefined;

    beforeEach(() => {
        eventBus = new EventBus();
        collector = new EventCollector(eventBus, ["buildRequested", "packagesRebuilt"]);

        new BuildScheduler(eventBus);
        new MockBuilder(eventBus);

        eventBus.post(sourceInitialized(TestSourceDescriptor));
        eventBus.post(targetSelected(TestTargetDescriptor));
    });

    it("should only single package if it is root", async () => {
        eventBus?.post(
            packagesChanged([{ packageName: "@gooddata/sdk-ui-ext", files: [], independent: false }]),
        );

        const packagesBuilt = (await collector?.waitFor("packagesRebuilt")) as PackagesRebuilt;

        expect(packagesBuilt.body.packages).toMatchSnapshot();
    });

    it("should build the entire subtree if leaf changes", async () => {
        eventBus?.post(
            packagesChanged([{ packageName: "@gooddata/sdk-model", files: [], independent: false }]),
        );

        const packagesBuilt = (await collector?.waitFor("packagesRebuilt")) as PackagesRebuilt;

        expect(packagesBuilt.body.packages).toMatchSnapshot();
    });

    it("should build the other subtree if leaf changes", async () => {
        eventBus?.post(
            packagesChanged([{ packageName: "@gooddata/api-model-bear", files: [], independent: false }]),
        );

        const packagesBuilt = (await collector?.waitFor("packagesRebuilt")) as PackagesRebuilt;

        expect(packagesBuilt.body.packages).toMatchSnapshot();
    });

    it("should build single package if the package change is marked as independent", async () => {
        eventBus?.post(
            packagesChanged([{ packageName: "@gooddata/sdk-model", files: [], independent: true }]),
        );

        const packagesBuilt = (await collector?.waitFor("packagesRebuilt")) as PackagesRebuilt;

        expect(packagesBuilt.body.packages).toMatchSnapshot();
    });
});
