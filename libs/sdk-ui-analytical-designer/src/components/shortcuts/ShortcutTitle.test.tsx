// (C) 2007-2026 GoodData Corporation

import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { withIntl } from "../../utils/with_intl.js";

import { ShortcutTitle } from "./ShortcutTitle.js";

describe("ShortcutTitle", () => {
    describe("fact base metric shortcut", () => {
        function createTitle() {
            const props = {
                itemType: "fact",
                title: 'Title <button id="xss" />',
                translationKey: "shortcut.metric_over_time",
            };

            const Wrapped = withIntl(ShortcutTitle);
            return render(<Wrapped {...props} />);
        }

        it("should escape the html inside the title", () => {
            const button = document.querySelector("#xss");
            const expectedTitle = /&lt;button\sid="xss"\s\/&gt;/;
            const { container } = createTitle();
            expect(button).toBeFalsy();
            expect(expectedTitle.test(container.querySelector("p").innerHTML)).toBeTruthy();
        });

        it("should append html to the title that won't be scaped", () => {
            const { container } = createTitle();
            const expectedHTMLinTitle = /<strong>[^<]+<\/strong>/;
            expect(expectedHTMLinTitle.test(container.querySelector("p").innerHTML)).toBeTruthy();
        });
    });
});
