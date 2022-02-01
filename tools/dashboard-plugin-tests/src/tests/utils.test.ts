// (C) 2019-2022 GoodData Corporation
import { convertToPluginIdentifier, createLocalTestPlugin, createLocalTestPluginLink } from "../utils";

describe("Dashboard Plugin Tests - Utils", () => {
    it("should convert plugin name to plugin identifier", () => {
        const identifier = convertToPluginIdentifier("test-plugin");

        expect(identifier).toMatchSnapshot();
    });

    it("should create local test plugin", () => {
        const plugin = createLocalTestPlugin("test-plugin");

        expect(plugin).toMatchSnapshot();
    });

    it("create create local test plugin link", () => {
        const plugin = createLocalTestPlugin("test-plugin");
        const pluginIdentifier = createLocalTestPluginLink(plugin);

        expect(pluginIdentifier).toMatchSnapshot();
    });
});
