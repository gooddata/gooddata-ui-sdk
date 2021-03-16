// (C) 2007-2020 GoodData Corporation
import React from "react";
import { mount } from "enzyme";

import { ColorsPreview, IColorsPreviewProps } from "../ColorsPreview";

describe("ColorsPreview", () => {
    it("should render colors preview with proper colors", () => {
        const props: IColorsPreviewProps = {
            currentHslColor: {
                h: 0,
                s: 0.5,
                l: 0.5,
            },
            draftHslColor: {
                h: 20,
                s: 0.5,
                l: 0.5,
            },
        };

        const colorsPreview = mount(<ColorsPreview {...props} />);

        expect(colorsPreview.find(".s-current-color").prop("style").backgroundColor).toEqual(
            "hsl(0, 50%, 50%)",
        );

        expect(colorsPreview.find(".s-new-color").prop("style").backgroundColor).toEqual("hsl(20, 50%, 50%)");
    });
});
