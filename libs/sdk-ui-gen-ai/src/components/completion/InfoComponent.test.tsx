// (C) 2026 GoodData Corporation

import { render, screen } from "@testing-library/react";
import { createIntl } from "react-intl";
import { describe, expect, it } from "vitest";

import { en_US } from "../../localization/bundles/en-US.localization-bundle.js";

import { InfoComponent } from "./InfoComponent.js";

const messages = Object.fromEntries(Object.entries(en_US).map(([id, message]) => [id, message.text]));
const intl = createIntl({ locale: "en", messages });

describe("InfoComponent", () => {
    it("labels a document reference as a document", () => {
        render(
            <InfoComponent
                id="harvest_brief"
                intl={intl}
                item={{
                    type: "document",
                    title: "Harvest Brief",
                    description: "",
                    deprecated: false,
                    production: true,
                    unlisted: false,
                }}
            />,
        );

        expect(screen.getByText("Harvest Brief")).toBeInTheDocument();
        expect(screen.getByText("Document")).toBeInTheDocument();
    });
});
