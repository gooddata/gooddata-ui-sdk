// (C) 2026 GoodData Corporation

import { render } from "@testing-library/react";
import { type Mock, beforeEach, describe, expect, it, vi } from "vitest";

import { ReferenceMd } from "@gooddata/reference-workspace";
import { dummyBackend } from "@gooddata/sdk-backend-mockingbird";
import { type ISortItem, measureLocalId, newAttributeSort, newMeasureSort } from "@gooddata/sdk-model";

import { type ICoreChartProps } from "../../../interfaces/chartProps.js";
import { CoreMekko } from "../CoreMekko.js";
import { Mekko } from "../Mekko.js";

/**
 * This mock enables us to test props as parameters of the called chart function
 */
vi.mock("../CoreMekko", () => ({
    CoreMekko: vi.fn(() => null),
}));

const measureSort = newMeasureSort(measureLocalId(ReferenceMd.Amount), "desc");
const attributeSort = newAttributeSort(ReferenceMd.Product.Name, "asc");
const sortBy: ISortItem[] = [attributeSort, measureSort];

function lastCoreMekkoProps(): ICoreChartProps {
    const calls = (CoreMekko as unknown as Mock).mock.calls;
    return calls[calls.length - 1][0];
}

describe("Mekko", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it("should render with custom SDK", () => {
        render(<Mekko workspace="foo" backend={dummyBackend()} widthMeasure={ReferenceMd.Amount} />);
        expect(CoreMekko).toHaveBeenCalled();
    });

    it("should strip measure sorts from the stacked execution and pass all sorts via config", () => {
        render(
            <Mekko
                workspace="foo"
                backend={dummyBackend()}
                widthMeasure={ReferenceMd.Amount}
                heightMeasure={ReferenceMd.Won}
                viewBy={ReferenceMd.Product.Name}
                stackBy={ReferenceMd.Region.Default}
                sortBy={sortBy}
            />,
        );

        const props = lastCoreMekkoProps();
        expect(props.execution.definition.sortBy).toEqual([attributeSort]);
        expect(props.config?.sortBy).toEqual(sortBy);
    });

    it("should keep measure sorts in the execution without a stackBy attribute", () => {
        render(
            <Mekko
                workspace="foo"
                backend={dummyBackend()}
                widthMeasure={ReferenceMd.Amount}
                heightMeasure={ReferenceMd.Won}
                viewBy={ReferenceMd.Product.Name}
                sortBy={sortBy}
            />,
        );

        const props = lastCoreMekkoProps();
        expect(props.execution.definition.sortBy).toEqual(sortBy);
        expect(props.config?.sortBy).toEqual(sortBy);
    });

    it("should keep a user-set config.sortBy when the sortBy prop is not provided", () => {
        render(
            <Mekko
                workspace="foo"
                backend={dummyBackend()}
                widthMeasure={ReferenceMd.Amount}
                config={{ sortBy: [measureSort] }}
            />,
        );

        expect(lastCoreMekkoProps().config?.sortBy).toEqual([measureSort]);
    });
});
