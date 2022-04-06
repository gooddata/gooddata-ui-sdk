// (C) 2021-2022 GoodData Corporation
import { SagaIterator } from "redux-saga";
import { DashboardContext } from "../../types/commonTypes";
import { ChangeLayoutSectionHeader } from "../../commands";
import { invalidArgumentsProvided } from "../../events/general";
import { selectLayout } from "../../store/layout/layoutSelectors";
import { put, select } from "redux-saga/effects";
import { validateSectionExists } from "./validation/layoutValidation";
import { IDashboardLayoutSectionHeader } from "@gooddata/sdk-model";
import merge from "lodash/merge";
import { layoutActions } from "../../store/layout";
import { DashboardLayoutSectionHeaderChanged, layoutSectionHeaderChanged } from "../../events/layout";

export function* changeLayoutSectionHeaderHandler(
    ctx: DashboardContext,
    cmd: ChangeLayoutSectionHeader,
): SagaIterator<DashboardLayoutSectionHeaderChanged> {
    const layout: ReturnType<typeof selectLayout> = yield select(selectLayout);
    const { index, header, merge: mergeHeaders } = cmd.payload;

    if (!validateSectionExists(layout, index)) {
        throw invalidArgumentsProvided(
            ctx,
            cmd,
            `Attempting to modify header of non-existent section at ${index}. There are currently ${layout.sections.length} sections.`,
        );
    }

    const existingHeader: IDashboardLayoutSectionHeader = layout.sections[index]!.header ?? {};
    const newHeader = mergeHeaders ? merge({}, existingHeader, header) : header;

    yield put(
        layoutActions.changeSectionHeader({
            index,
            header: newHeader,
            undo: {
                cmd,
            },
        }),
    );

    return layoutSectionHeaderChanged(ctx, newHeader, index, cmd.correlationId);
}
