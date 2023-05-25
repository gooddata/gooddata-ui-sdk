// (C) 2021-2022 GoodData Corporation
import { SagaIterator } from "redux-saga";
import { DashboardContext } from "../../types/commonTypes.js";
import { ChangeLayoutSectionHeader } from "../../commands/index.js";
import { invalidArgumentsProvided } from "../../events/general.js";
import { selectLayout } from "../../store/layout/layoutSelectors.js";
import { put, select } from "redux-saga/effects";
import { validateSectionExists } from "./validation/layoutValidation.js";
import { IDashboardLayoutSectionHeader } from "@gooddata/sdk-model";
import merge from "lodash/merge.js";
import { layoutActions } from "../../store/layout/index.js";
import { DashboardLayoutSectionHeaderChanged, layoutSectionHeaderChanged } from "../../events/layout.js";
import { sanitizeHeader } from "./utils.js";

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
    const sanitizedHeader = sanitizeHeader(newHeader);

    yield put(
        layoutActions.changeSectionHeader({
            index,
            header: sanitizedHeader,
            undo: {
                cmd,
            },
        }),
    );

    return layoutSectionHeaderChanged(ctx, sanitizedHeader, index, cmd.correlationId);
}
