// (C) 2026 GoodData Corporation

import { fireEvent, render } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { idRef, uriRef } from "@gooddata/sdk-model";

import { type IAttributeFilter } from "../../../../store/filter_bar/filter_bar_types.js";

import { type IAdditionalDateAttributesProps } from "./AdditionalDateAttributes.js";
import { AdditionalDateFilters, type IAdditionalDateFiltersProps } from "./AdditionalDateFilters.js";

// The suite runs with isolate: false, so without a reset a section another test file already loaded
// would keep the real AdditionalDateAttributes instead of the stub below.
vi.hoisted(() => {
    vi.resetModules();
});

// The section's own rendering is covered by AdditionalDateAttributes.test.tsx; this stub exposes each
// interaction as a button, so the wiring of the callbacks can be pinned without the element pickers.
vi.mock("./AdditionalDateAttributes.js", () => ({
    AdditionalDateAttributes: ({
        onSelect,
        onApply,
        onRemove,
        onClose,
        onEmptyDateValuesFilterAdd,
        onEmptyDateValuesFilterRemove,
        onEmptyDateValuesFilterModeChange,
    }: IAdditionalDateAttributesProps) => (
        <div>
            <button
                className="stub-select"
                onClick={() =>
                    onSelect({
                        type: "attribute",
                        localIdentifier: "added",
                        cacheItemIdentifier: "d1.dayOfMonth",
                        displayFormRef: uriRef("/gdc/md/643"),
                        filterConfig: { selectedElements: [], totalElementsCount: 0, isInverted: true },
                    })
                }
            />
            <button
                className="stub-apply"
                onClick={() =>
                    onApply({
                        filterLocalIdentifier: "dow",
                        displayFormRef: uriRef("/gdc/md/680"),
                        selectedElements: [{ title: "Tue", uri: "3", available: true }],
                        totalElementsCount: 7,
                        isInverted: false,
                    })
                }
            />
            <button className="stub-remove" onClick={() => onRemove("dow")} />
            <button className="stub-close" onClick={() => onClose("dow")} />
            <button className="stub-empty-add" onClick={onEmptyDateValuesFilterAdd} />
            <button className="stub-empty-remove" onClick={onEmptyDateValuesFilterRemove} />
            <button className="stub-empty-mode" onClick={() => onEmptyDateValuesFilterModeChange("only")} />
        </div>
    ),
}));

const dayOfWeekFilter: IAttributeFilter = {
    type: "attribute",
    localIdentifier: "dow",
    cacheItemIdentifier: "d1.dayOfWeek",
    displayFormRef: uriRef("/gdc/md/680"),
    filterConfig: {
        selectedElements: [{ title: "Mon", uri: "2", available: true }],
        totalElementsCount: 7,
        isInverted: false,
    },
};

function renderSection(props: Partial<IAdditionalDateFiltersProps> = {}) {
    const onFiltersUpdate = vi.fn();
    const onMigratedFiltersDismiss = vi.fn();
    const onEmptyDateValuesFilterModeChange = vi.fn();
    render(
        <AdditionalDateFilters
            dateDataset={{ identifier: "d1", ref: idRef("d1"), title: "Date 1" }}
            dateDatasetRefsWithGranularities={[]}
            additionalDateAttributeFilters={[dayOfWeekFilter]}
            migratedAdditionalFilters={["removed"]}
            onFiltersUpdate={onFiltersUpdate}
            onMigratedFiltersDismiss={onMigratedFiltersDismiss}
            onEmptyDateValuesFilterModeChange={onEmptyDateValuesFilterModeChange}
            {...props}
        />,
    );
    const click = (className: string) => fireEvent.click(document.querySelector(`.${className}`));
    return { onFiltersUpdate, onMigratedFiltersDismiss, onEmptyDateValuesFilterModeChange, click };
}

describe("AdditionalDateFilters", () => {
    it.each([
        ["adding a filter", "stub-select"],
        ["applying a filter's selection", "stub-apply"],
        ["removing a filter", "stub-remove"],
        ["closing a filter's picker", "stub-close"],
        ["adding the empty values filter", "stub-empty-add"],
        ["removing the empty values filter", "stub-empty-remove"],
        ["changing the empty values filter mode", "stub-empty-mode"],
    ])("dismisses the removed filters warning on %s", (_name, buttonClassName) => {
        const { onMigratedFiltersDismiss, click } = renderSection();

        click(buttonClassName);

        expect(onMigratedFiltersDismiss).toHaveBeenCalledTimes(1);
    });

    it("does not dismiss the warning on its own", () => {
        const { onMigratedFiltersDismiss } = renderSection();

        expect(onMigratedFiltersDismiss).not.toHaveBeenCalled();
    });

    it("keeps forwarding the edits it dismisses on", () => {
        const { onFiltersUpdate, onEmptyDateValuesFilterModeChange, click } = renderSection();

        click("stub-apply");
        expect(onFiltersUpdate).toHaveBeenLastCalledWith([
            {
                ...dayOfWeekFilter,
                filterConfig: {
                    selectedElements: [{ title: "Tue", uri: "3", available: true }],
                    totalElementsCount: 7,
                    isInverted: false,
                },
            },
        ]);

        click("stub-remove");
        expect(onFiltersUpdate).toHaveBeenLastCalledWith([]);

        click("stub-empty-mode");
        expect(onEmptyDateValuesFilterModeChange).toHaveBeenLastCalledWith("only");
    });
});
