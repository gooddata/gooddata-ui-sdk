// (C) 2026 GoodData Corporation

// @vitest-environment happy-dom

import { describe, expect, it } from "vitest";

import { UnexpectedError } from "@gooddata/sdk-backend-spi";

import { missingTranslationsFromXliff } from "./xliff.js";

const XLIFF = `<?xml version='1.0' encoding='UTF-8'?>
<xliff xmlns="urn:oasis:names:tc:xliff:document:2.0" version="2.1" srcLang="en-US" trgLang="ja-JP">
    <file id="2b044154514b464199db24063099becb">
        <group id="analyticalDashboard">
            <group id="analyticalDashboard.04a8f9c7-cce9-4511-be2b-ea52ea80773f">
                <unit id="analyticalDashboard.04a8f9c7-cce9-4511-be2b-ea52ea80773f.title">
                    <segment>
                        <source>Drill to insight</source>
                        <target>インサイトにドリルダウン</target>
                    </segment>
                </unit>
                <unit id="analyticalDashboard.04a8f9c7-cce9-4511-be2b-ea52ea80773f.description">
                    <segment>
                        <source />
                    </segment>
                </unit>
                <unit id="analyticalDashboard.04a8f9c7-cce9-4511-be2b-ea52ea80773f.free-form">
                    <notes>
                        <note appliesTo="source">Free-form translations are marked by the 'id' attribute.</note>
                    </notes>
                    <segment id="25a4c15df4128a679d8a8f00a668cae32a85d4e50a49303912793e766241e6d8">
                        <source>
                            <mrk id="1" type="free-form:path" value="$.layout.sections[*].items[*].widget.description" />
                        </source>
                    </segment>
                    <segment id="bd964ad96694187fce207b937c370acc078af5861103d97ebc8f14297c3f95b2">
                        <source>
                            <mrk id="1" type="free-form:path" value="$.layout.sections[*].items[*].widget.title" />Combo chart
                        </source>
                        <target>コンボチャート</target>
                    </segment>
                    <segment id="9028e3b993e66f48f52b4f12cddf5b7d30b2ba4eb2fc41487da002f1d154182c">
                        <source>
                            <mrk id="1" type="free-form:path" value="$.layout.sections[*].items[*].widget.title" />Column chart
                        </source>
                    </segment>
                </unit>
            </group>
        </group>
        <group id="attribute">
            <group id="attribute.attr.f_account.account">
                <unit id="attribute.attr.f_account.account.title">
                    <segment>
                        <source>Account</source>
                    </segment>
                </unit>
                <unit id="attribute.attr.f_account.account.description">
                    <segment>
                        <source>Account</source>
                        <target>アカウント</target>
                    </segment>
                </unit>
                <unit id="attribute.attr.f_account.account.tags">
                    <segment>
                        <source>Account</source>
                        <target>アカウント</target>
                    </segment>
                    <segment>
                        <source>Sales</source>
                    </segment>
                    <segment>
                        <source>CRM</source>
                    </segment>
                </unit>
            </group>
            <group id="attribute.attr.f_activity.activity">
                <unit id="attribute.attr.f_activity.activity.title">
                    <segment>
                        <source>Activity</source>
                        <target>アクティビティ</target>
                    </segment>
                </unit>
                <unit id="attribute.attr.f_activity.activity.tags">
                    <segment>
                        <source>Activity</source>
                        <target>アクティビティ</target>
                    </segment>
                </unit>
            </group>
        </group>
        <group id="filterContext">
            <group id="filterContext.f1">
                <unit id="filterContext.f1.free-form">
                    <segment id="aaaf7e51">
                        <source>
                            <mrk id="1" type="free-form:path" value="$.filters[*].attributeFilter.title" />Region
                        </source>
                    </segment>
                </unit>
            </group>
        </group>
        <group id="metric">
            <group id="metric.amount">
                <unit id="metric.amount.title">
                    <segment>
                        <source>Amount</source>
                    </segment>
                </unit>
                <unit id="metric.amount.description">
                    <segment>
                        <source />
                    </segment>
                </unit>
            </group>
        </group>
        <group id="exportDefinition">
            <group id="exportDefinition.weekly">
                <unit id="exportDefinition.weekly.title">
                    <segment>
                        <source>Weekly export</source>
                    </segment>
                </unit>
            </group>
        </group>
    </file>
</xliff>`;

describe("missingTranslationsFromXliff", () => {
    it("lists the objects with untranslated texts, in the order of the document", () => {
        expect(missingTranslationsFromXliff(XLIFF)).toEqual([
            {
                type: "analyticalDashboard",
                id: "04a8f9c7-cce9-4511-be2b-ea52ea80773f",
                title: "Drill to insight",
                missing: [{ text: "freeForm", count: 1 }],
            },
            {
                type: "attribute",
                id: "attr.f_account.account",
                title: "Account",
                missing: [
                    { text: "title", count: 1 },
                    { text: "tags", count: 2 },
                ],
            },
            {
                type: "filterContext",
                id: "f1",
                title: "f1",
                missing: [{ text: "freeForm", count: 1 }],
            },
            {
                type: "measure",
                id: "amount",
                title: "Amount",
                missing: [{ text: "title", count: 1 }],
            },
            {
                type: "exportDefinition",
                id: "weekly",
                title: "Weekly export",
                missing: [{ text: "title", count: 1 }],
            },
        ]);
    });

    it("names the object types the way the rest of the SDK does", () => {
        const xliff = (group: string) =>
            `<xliff version="2.0" xmlns="urn:oasis:names:tc:xliff:document:2.0" srcLang="en-US" trgLang="ja-JP"><file id="f"><group id="${group}"><group id="${group}.x"><unit id="${group}.x.title"><segment><source>X</source></segment></unit></group></group></file></xliff>`;
        const typeOf = (group: string) => missingTranslationsFromXliff(xliff(group))[0].type;

        expect(typeOf("visualizationObject")).toBe("insight");
        expect(typeOf("label")).toBe("displayForm");
        expect(typeOf("dataset")).toBe("dataSet");
        expect(typeOf("exportDefinition")).toBe("exportDefinition");
        expect(typeOf("somethingNew")).toBeUndefined();
        expect(typeOf("constructor")).toBeUndefined();
    });

    it("lists nothing when every text with a source has a translation", () => {
        const translated = XLIFF.replace(
            /<source>([^<]+)<\/source>\s*<\/segment>/g,
            "<source>$1</source><target>x</target></segment>",
        )
            .replace(/(\/>Column chart\s*<\/source>)/, "$1<target>x</target>")
            .replace(/(\/>Region\s*<\/source>)/, "$1<target>x</target>");

        expect(missingTranslationsFromXliff(translated)).toEqual([]);
    });

    it("rejects a document that is not XML", () => {
        expect(() => missingTranslationsFromXliff("<xliff><file>")).toThrow(UnexpectedError);
    });
});
