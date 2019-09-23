import { getAttributeElementIdFromAttributeElementUri } from "../getAttributeElementIdFromAttributeElementUri";

describe("getAttributeElementIdFromAttributeElementUri", () => {
    const uri = "/gdc/md/d20eyb3wfs0xe5l0lfscdnrnyhq1t42q/obj/1024/elements?id=1225";

    it("should return id from attribute value uri", () => {
        expect(getAttributeElementIdFromAttributeElementUri(uri)).toEqual("1225");
    });
});
