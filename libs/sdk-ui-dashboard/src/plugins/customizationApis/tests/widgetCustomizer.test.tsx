// (C) 2021 GoodData Corporation

import { DashboardCustomizationLogger } from "../customizationLogging";
import { DefaultWidgetCustomizer } from "../widgetCustomizer";
import React from "react";
import { ICustomWidget } from "../../../model";
import { idRef } from "@gooddata/sdk-model";

const TestWidget1: React.FC = () => {
    return <div>Test Widget 1</div>;
};

const TestWidget2: React.FC = () => {
    return <div>Test Widget 2</div>;
};

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
