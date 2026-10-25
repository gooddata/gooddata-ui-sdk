// (C) 2007-2026 GoodData Corporation

import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { withIntl } from "../../utils/with_intl.js";

import { Recommendation } from "./Recommendation.js";

describe("Recommendation", () => {
    const Wrapped = withIntl(Recommendation);
    const testType = "test-type";

    function renderComponent() {
        return render(
            <Wrapped type="test-type">
                <div className="child">test child</div>
            </Wrapped>,
        );
    }

    it("should set type classes", () => {
        const { container } = renderComponent();
        expect(container.querySelectorAll(`.adi-recommendation-${testType}`)).toHaveLength(1);
        expect(container.querySelectorAll(`.s-recommendation-${testType}`)).toHaveLength(1);
    });

    it("should insert child element", () => {
        const { container } = renderComponent();
        expect(container.querySelectorAll(".child")).toHaveLength(1);
    });
});
