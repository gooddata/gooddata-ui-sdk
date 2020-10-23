// (C) 2007-2020 GoodData Corporation
import React from "react";
import { mount } from "enzyme";
import Overlay from "@gooddata/goodstrap/lib/core/Overlay";
import { ExportDialog } from "../ExportDialog";

describe("ExportDialog", () => {
    it("should render content", () => {
        const wrapper = mount(<ExportDialog className="exportDialogTest" />);

        expect(wrapper.find(Overlay)).toHaveLength(1);
        expect(wrapper.find(".exportDialogTest")).toHaveLength(1);
    });
});
