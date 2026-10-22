// (C) 2026 GoodData Corporation

import { render, screen } from "@testing-library/react";
import { RawIntlProvider } from "react-intl";
import { describe, expect, it } from "vitest";

import { type ICatalogAttribute, type ISeparators } from "@gooddata/sdk-model";

import type { IUseAttributeElements } from "../../../../../model/types/attributeFilterTypes.js";
import { createInternalIntl } from "../../../../localization/createInternalIntl.js";

import { AttributeListItemTooltipContent } from "./AttributeListItemTooltipContent.js";

const item = { attribute: { title: "Amount" } } as ICatalogAttribute;

function renderValues(attributeElements: IUseAttributeElements, separators?: ISeparators) {
    render(
        <RawIntlProvider value={createInternalIntl()}>
            <AttributeListItemTooltipContent
                item={item}
                hideDataSet
                attributesDataSetLoading={false}
                attributesElementsLoading={false}
                attributeElements={attributeElements}
                separators={separators}
            />
        </RawIntlProvider>,
    );

    return screen.getAllByText(/./, { selector: ".s-attribute-element" }).map((el) => el.textContent);
}

describe("AttributeListItemTooltipContent", () => {
    const elements = [
        { title: "1234.5", uri: "1234.5" },
        { title: "abc", uri: "abc" },
    ];

    it("formats the sample values by the number format of the elements", () => {
        expect(
            renderValues(
                { elements, totalCount: 2, numberFormat: "#,##0.0" },
                { decimal: ",", thousand: " " },
            ),
        ).toEqual(["1 234,5", "abc"]);
    });

    it("shows the raw values without a number format", () => {
        expect(renderValues({ elements, totalCount: 2 }, { decimal: ",", thousand: " " })).toEqual([
            "1234.5",
            "abc",
        ]);
    });
});
