// (C) 2022 GoodData Corporation
import {
    areObjRefsEqual,
    IDrillToCustomUrl,
    IInsightWidget,
    isDrillFromAttribute,
    isDrillToCustomUrl,
    widgetRef,
} from "@gooddata/sdk-model";
import { SagaIterator } from "redux-saga";
import { all, call, put, SagaReturnType, select } from "redux-saga/effects";
import { extractDisplayFormIdentifiers } from "../widgets/validation/insightDrillDefinitionUtils";
import { uiActions } from "../../store/ui";
import {
    getLocalIdentifierOrDie,
    getValidDrillOriginAttributes,
} from "../../../_staging/drills/drillingUtils";
import { selectDrillTargetsByWidgetRef } from "../../store/drillTargets/drillTargetsSelectors";
import { selectAllCatalogDisplayFormsMap } from "../../store/catalog/catalogSelectors";

interface IInvalidParamsInfo {
    widget: IInsightWidget;
    invalidDrills: IDrillToCustomUrl[];
}

export function* validateDrillToCustomUrlParams(widgets: IInsightWidget[]) {
    const widgetsWithDrills = widgets.filter((widget) => widget.drills.length > 0);
    if (!widgetsWithDrills.length) {
        return;
    }

    const possibleInvalidDrills: SagaReturnType<typeof validateWidgetDrillToCustomUrlParams>[] = yield all(
        widgetsWithDrills.map((widget) => call(validateWidgetDrillToCustomUrlParams, widget)),
    );

    const invalidDrills = possibleInvalidDrills.filter(({ invalidDrills }) => invalidDrills.length > 0);

    if (invalidDrills.length === 0) {
        yield put(uiActions.removeInvalidUrlDrillWidgetRefs(widgetsWithDrills.map(widgetRef)));
    } else {
        // TODO be more specific about which drills have the problem, this is useful in the warning
        yield put(uiActions.addInvalidUrlDrillWidgetRefs(invalidDrills.map((drill) => drill.widget.ref)));
    }
}

function* validateWidgetDrillToCustomUrlParams(widget: IInsightWidget): SagaIterator<IInvalidParamsInfo> {
    const selectDrillTargetsByWidgetRefSelector = selectDrillTargetsByWidgetRef(widgetRef(widget));
    const drillTargets: ReturnType<typeof selectDrillTargetsByWidgetRefSelector> = yield select(
        selectDrillTargetsByWidgetRefSelector,
    );

    if (!drillTargets?.availableDrillTargets) {
        // skip this part of the validation in case the drill targets are not available yet
        return {
            widget,
            invalidDrills: [],
        };
    }

    const displayForms = yield select(selectAllCatalogDisplayFormsMap);

    return widget.drills.filter(isDrillToCustomUrl).reduce(
        (acc: IInvalidParamsInfo, drillDefinition) => {
            const ids = extractDisplayFormIdentifiers([drillDefinition]);

            const hasInvalidParam = ids.some((identifier) => {
                const displayForm = displayForms.get(identifier);
                if (!displayForm) {
                    // the drill as a whole is invalid, no reason to validate the parameters
                    return false;
                }

                const attributeRef = isDrillFromAttribute(drillDefinition.origin)
                    ? drillDefinition.origin?.attribute
                    : drillDefinition.origin?.measure;

                const localId = getLocalIdentifierOrDie(attributeRef);

                const relevantAttributes = getValidDrillOriginAttributes(
                    drillTargets.availableDrillTargets!,
                    localId,
                );

                const isValidDrillParameter = relevantAttributes.some((attribute) =>
                    areObjRefsEqual(displayForm.attribute, attribute.attributeHeader.formOf),
                );

                return !isValidDrillParameter;
            });

            if (hasInvalidParam) {
                acc.invalidDrills.push(drillDefinition);
            }

            return acc;
        },
        { widget, invalidDrills: [] },
    );
}
