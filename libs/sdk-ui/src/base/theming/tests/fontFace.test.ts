// (C) 2007-2020 GoodData Corporation
import { createFontFace } from "../fontFace";

const url = "url(https://fonts.gstatic.com/s/indieflower/v11/m8JVjfNVeKWVnh3QMuKkFcZVaUuH.woff2)";

describe("fontFace", () => {
    it("should add font face to style", () => {
        jest.spyOn(document.head, "appendChild");
        createFontFace(url, "regular");

        expect(document.head.appendChild).toHaveBeenCalled();
    });
});
