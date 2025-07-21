// (C) 2021-2025 GoodData Corporation

import { DashboardCustomizationLogger } from "../customizationLogging.js";
import { DefaultWidgetCustomizer } from "../widgetCustomizer.js";
import { ICustomWidget } from "../../../model/index.js";
import { idRef } from "@gooddata/sdk-model";
import { describe, it, expect, beforeEach } from "vitest";

function TestWidget1() {
    return <div>Test Widget 1</div>;
}

function TestWidget2() {
    return <div>Test Widget 2</div>;
}

function testWidget(type: string): ICustomWidget {
    return {
        type: "customWidget",
        customType: type,
        uri: "/1",
        identifier: "1",
        ref: idRef("1"),
    };
}

describe("widget customizer", () => {
    let Customizer: DefaultWidgetCustomizer;

    beforeEach(() => {
        Customizer = new DefaultWidgetCustomizer(new DashboardCustomizationLogger());
    });

    it("should correctly handle multiple custom widget types", () => {
        Customizer.addCustomWidget("w1", TestWidget1);
        Customizer.addCustomWidget("w2", TestWidget2);

        const provider = Customizer.getWidgetComponentProvider();

        expect(provider(testWidget("w1"))).toEqual(TestWidget1);
        expect(provider(testWidget("w2"))).toEqual(TestWidget2);
        expect(provider(testWidget("w3"))).toBeUndefined();
    });

    it("should use last-win when multiple widgets of same type", () => {
        Customizer.addCustomWidget("w1", TestWidget1);
        Customizer.addCustomWidget("w1", TestWidget2);

        const provider = Customizer.getWidgetComponentProvider();
        expect(provider(testWidget("w1"))).toEqual(TestWidget2);
    });

    it("should not do any modifications once sealed", () => {
        Customizer.addCustomWidget("w1", TestWidget1);
        Customizer.sealCustomizer();
        Customizer.addCustomWidget("w1", TestWidget2);

        const provider = Customizer.getWidgetComponentProvider();
        expect(provider(testWidget("w1"))).toEqual(TestWidget1);
    });
});
