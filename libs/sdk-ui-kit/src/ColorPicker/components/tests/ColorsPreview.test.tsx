// (C) 2007-2022 GoodData Corporation
import React from "react";
import { render, screen } from "@testing-library/react";

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

        render(<ColorsPreview {...props} />);

        expect(screen.getByLabelText("current-color")).toHaveStyle({ backgroundColor: "hsl(0, 50%, 50%)" });
        expect(screen.getByLabelText("new-color")).toHaveStyle({ backgroundColor: "hsl(20, 50%, 50%)" });
    });
});
