// (C) 2007-2026 GoodData Corporation

import { render } from "@testing-library/react";
import { defineMessage } from "react-intl";
import { describe, expect, it } from "vitest";

import { withIntl } from "../../utils/with_intl.js";

import { NoDateAvailable } from "./NoDateAvailable.js";

describe("NoDateAvailable", () => {
    function renderComponent() {
        const Wrapped = withIntl(NoDateAvailable);

        return render(
            <Wrapped
                message={defineMessage({ id: "dashboard.bucket_item.no_date_available_category" }).id}
            />,
        );
    }

    it("should contain explanation", () => {
        const { container } = renderComponent();
        expect(container.textContent).toEqual("Metric cannot be trended");
    });
});
