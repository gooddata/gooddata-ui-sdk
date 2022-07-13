// (C) 2019-2022 GoodData Corporation
import { newTestAttributeFilterHandler } from "./fixtures";
import { waitForAsync } from "./testUtils";

describe("MultiSelectAttributeFilterHandler", () => {
    it("should initialize selection and trigger callbacks for positive attribute filter", async () => {
        const onSelectionChanged = jest.fn();
        const onSelectionCommitted = jest.fn();
        const attributeFilterHandler = newTestAttributeFilterHandler("positive");

        attributeFilterHandler.onSelectionChanged(onSelectionChanged);
        attributeFilterHandler.onSelectionCommitted(onSelectionCommitted);

        attributeFilterHandler.init();

        await waitForAsync();

        expect(onSelectionChanged).toHaveBeenCalledTimes(1);
        expect(onSelectionCommitted).toHaveBeenCalledTimes(1);
        expect(onSelectionChanged.mock.calls[0]).toMatchSnapshot("onSelectionChanged parameters");
        expect(onSelectionCommitted.mock.calls[0]).toMatchSnapshot("onSelectionCommitted parameters");
        expect(attributeFilterHandler.getCommittedSelection()).toMatchSnapshot("commited selection");
        expect(attributeFilterHandler.getWorkingSelection()).toMatchSnapshot("working selection");
    });

    it("should initialize selection and trigger callbacks for negative attribute filter", async () => {
        const onSelectionChanged = jest.fn();
        const onSelectionCommitted = jest.fn();
        const attributeFilterHandler = newTestAttributeFilterHandler("negative");

        attributeFilterHandler.onSelectionChanged(onSelectionChanged);
        attributeFilterHandler.onSelectionCommitted(onSelectionCommitted);

        attributeFilterHandler.init();

        await waitForAsync();

        expect(onSelectionChanged).toHaveBeenCalledTimes(1);
        expect(onSelectionCommitted).toHaveBeenCalledTimes(1);
        expect(onSelectionChanged.mock.calls[0]).toMatchSnapshot("onSelectionChanged parameters");
        expect(onSelectionCommitted.mock.calls[0]).toMatchSnapshot("onSelectionCommitted parameters");
        expect(attributeFilterHandler.getCommittedSelection()).toMatchSnapshot("commited selection");
        expect(attributeFilterHandler.getWorkingSelection()).toMatchSnapshot("working selection");
    });

    it("should change selection and trigger callbacks", async () => {
        const onSelectionChanged = jest.fn();
        const attributeFilterHandler = newTestAttributeFilterHandler("positive");

        attributeFilterHandler.init();

        await waitForAsync();

        attributeFilterHandler.onSelectionChanged(onSelectionChanged);
        attributeFilterHandler.changeSelection({
            isInverted: true,
            items: ["/gdc/md/referenceworkspace/obj/1054/elements?id=166497"],
        });

        expect(onSelectionChanged).toHaveBeenCalledTimes(1);
        expect(onSelectionChanged.mock.calls[0]).toMatchSnapshot("onSelectionChanged parameters");
        expect(attributeFilterHandler.getWorkingSelection()).toMatchSnapshot("working selection");
    });

    it("should revert selection and trigger callbacks", async () => {
        const onSelectionChanged = jest.fn();
        const attributeFilterHandler = newTestAttributeFilterHandler("positive");

        attributeFilterHandler.init();

        await waitForAsync();

        expect(attributeFilterHandler.getWorkingSelection()).toMatchSnapshot(
            "working selection before revert",
        );

        attributeFilterHandler.changeSelection({
            isInverted: true,
            items: ["/gdc/md/referenceworkspace/obj/1054/elements?id=166497"],
        });

        expect(attributeFilterHandler.getWorkingSelection()).toMatchSnapshot(
            "working selection after change",
        );

        attributeFilterHandler.onSelectionChanged(onSelectionChanged);
        attributeFilterHandler.revertSelection();

        expect(onSelectionChanged).toHaveBeenCalledTimes(1);
        expect(onSelectionChanged.mock.calls[0]).toMatchSnapshot("onSelectionChanged callback parameters");
        expect(attributeFilterHandler.getWorkingSelection()).toMatchSnapshot(
            "working selection after revert",
        );
    });

    it("should invert selection and trigger callbacks", async () => {
        const onSelectionChanged = jest.fn();
        const attributeFilterHandler = newTestAttributeFilterHandler("positive");

        attributeFilterHandler.init();

        await waitForAsync();

        expect(attributeFilterHandler.getWorkingSelection()).toMatchSnapshot(
            "working selection before invert",
        );

        attributeFilterHandler.onSelectionChanged(onSelectionChanged);
        attributeFilterHandler.invertSelection();

        expect(onSelectionChanged).toHaveBeenCalledTimes(1);
        expect(onSelectionChanged.mock.calls[0]).toMatchSnapshot("onSelectionChanged parameters");
        expect(attributeFilterHandler.getWorkingSelection()).toMatchSnapshot(
            "working selection after invert",
        );
    });

    it("should commit selection and trigger callbacks", async () => {
        const onSelectionCommitted = jest.fn();
        const attributeFilterHandler = newTestAttributeFilterHandler("positive");

        attributeFilterHandler.init();

        await waitForAsync();

        attributeFilterHandler.onSelectionCommitted(onSelectionCommitted);
        attributeFilterHandler.changeSelection({
            isInverted: true,
            items: ["/gdc/md/referenceworkspace/obj/1054/elements?id=166497"],
        });
        attributeFilterHandler.commitSelection();

        expect(onSelectionCommitted).toHaveBeenCalledTimes(1);
        expect(onSelectionCommitted.mock.calls[0]).toMatchSnapshot("onSelectionChanged parameters");
        expect(attributeFilterHandler.getCommittedSelection()).toMatchSnapshot("commited selection");
    });
});
