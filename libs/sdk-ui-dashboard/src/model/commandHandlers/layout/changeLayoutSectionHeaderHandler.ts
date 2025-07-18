// (C) 2021-2025 GoodData Corporation
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
import { findSection, serializeLayoutSectionPath } from "../../../_staging/layout/coordinates.js";

export function* changeLayoutSectionHeaderHandler(
    ctx: DashboardContext,
    cmd: ChangeLayoutSectionHeader,
): SagaIterator<DashboardLayoutSectionHeaderChanged> {
    const layout: ReturnType<typeof selectLayout> = yield select(selectLayout);
    const { index, header, merge: mergeHeaders } = cmd.payload;

    const isLegacyCommand = typeof index === "number";

    if (isLegacyCommand) {
        if (!validateSectionExists(layout, index)) {
            throw invalidArgumentsProvided(
                ctx,
                cmd,
                `Attempting to modify header of non-existent section at ${index}. There are currently ${layout.sections.length} sections.`,
            );
        }
    } else {
        if (!validateSectionExists(layout, index)) {
            throw invalidArgumentsProvided(
                ctx,
                cmd,
                `Attempting to modify header of non-existent section at ${serializeLayoutSectionPath(
                    index,
                )}.`,
            );
        }
    }

    const existingHeader: IDashboardLayoutSectionHeader = isLegacyCommand
        ? (layout.sections[index]!.header ?? {})
        : (findSection(layout, index).header ?? {});
    const newHeader = mergeHeaders ? merge({}, existingHeader, header) : header;
    const sanitizedHeader = sanitizeHeader(newHeader);
    const sectionPath = isLegacyCommand ? { parent: undefined, sectionIndex: index } : index;

    yield put(
        layoutActions.changeSectionHeader({
            index: sectionPath,
            header: sanitizedHeader,
            undo: {
                cmd,
            },
        }),
    );

    return layoutSectionHeaderChanged(
        ctx,
        sanitizedHeader,
        sectionPath.sectionIndex,
        sectionPath,
        cmd.correlationId,
    );
}
