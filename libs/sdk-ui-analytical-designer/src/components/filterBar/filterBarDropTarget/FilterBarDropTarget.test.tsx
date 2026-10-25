// (C) 2019-2026 GoodData Corporation

import { render } from "@testing-library/react";
import { Provider } from "react-redux";
import { legacy_createStore } from "redux";
import { describe, expect, it } from "vitest";

import { type FilterBarAcceptedType } from "../../../store/filter_bar/filter_bar_types.js";
import { type IAppState } from "../../../store/types.js";
import { withBucketUiConfig } from "../../../tests/extended_reference_point_builder.test.helpers.js";
import { getInitializedState } from "../../../tests/state.test.helpers.js";
import { withData } from "../../../tests/state_builder.test.helpers.js";
import { withDragDrop } from "../../../utils/with_drag_drop_context.js";
import { withIntl } from "../../../utils/with_intl.js";

import { PureFilterBarDropTarget } from "./FilterBarDropTarget.js";

describe("FilterBarDropTarget", () => {
    // the component now reads the accepted types from the store, so the scenarios are driven by
    // the filters ui config the getAcceptedTypes selector reads
    function createStoreWithAcceptedTypes(acceptedTypes: ReadonlyArray<FilterBarAcceptedType>) {
        const state = withData(getInitializedState(), {
            extendedReferencePoint: withBucketUiConfig(
                getInitializedState().data.extendedReferencePoint,
                "filters",
                { accepts: [...acceptedTypes], itemsLimit: 20 },
            ),
        });

        return legacy_createStore((currentState: IAppState = state) => currentState);
    }

    describe("#tootip", () => {
        const Component = withDragDrop(withIntl(PureFilterBarDropTarget));

        function renderComponent(acceptedTypes: ReadonlyArray<FilterBarAcceptedType>) {
            return render(
                <Provider store={createStoreWithAcceptedTypes(acceptedTypes)}>
                    <Component isOver />
                </Provider>,
            );
        }

        it("should not render tooltip when dropTarget is not accepting any type", () => {
            renderComponent([]);

            const bubbleControl = document.querySelectorAll(".gd-bubble-trigger");
            expect(bubbleControl).toHaveLength(0);
        });

        it("should render tooltip when dropTarget is accepting some type", () => {
            renderComponent(["attribute", "date"]);

            const bubbleControl = document.querySelectorAll(".gd-bubble-trigger");
            expect(bubbleControl).toHaveLength(1);
        });
    });
});
