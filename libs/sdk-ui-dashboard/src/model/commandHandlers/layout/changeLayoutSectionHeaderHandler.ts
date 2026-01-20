// (C) 2021-2026 GoodData Corporation

import { merge } from "lodash-es";
import { type SagaIterator } from "redux-saga";
import { put, select } from "redux-saga/effects";

import { type IDashboardLayoutSectionHeader } from "@gooddata/sdk-model";

import { sanitizeHeader } from "./utils.js";
import { validateSectionExists } from "./validation/layoutValidation.js";
import { findSection, serializeLayoutSectionPath } from "../../../_staging/layout/coordinates.js";
import { type ChangeLayoutSectionHeader } from "../../commands/index.js";
import { invalidArgumentsProvided } from "../../events/general.js";
import {
    type IDashboardLayoutSectionHeaderChanged,
    layoutSectionHeaderChanged,
} from "../../events/layout.js";
import { tabsActions } from "../../store/tabs/index.js";
import { selectLayout } from "../../store/tabs/layout/layoutSelectors.js";
import { type DashboardContext } from "../../types/commonTypes.js";

export function* changeLayoutSectionHeaderHandler(
    ctx: DashboardContext,
    cmd: ChangeLayoutSectionHeader,
): SagaIterator<IDashboardLayoutSectionHeaderChanged> {
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
        ? (layout.sections[index].header ?? {})
        : (findSection(layout, index).header ?? {});
    const newHeader = mergeHeaders ? merge({}, existingHeader, header) : header;
    const sanitizedHeader = sanitizeHeader(newHeader);
    const sectionPath = isLegacyCommand ? { parent: undefined, sectionIndex: index } : index;

    yield put(
        tabsActions.changeSectionHeader({
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
