// (C) 2021-2026 GoodData Corporation

import { type ReactElement } from "react";

import { FormProvider, type FormProviderComponent } from "../../shared/Form/Form.js";
import { emptyMetric } from "../metric/emptyMetric.js";
import { type IMeasureDef } from "../metric/metricHelpers.js";

import { type ValidationSpecialInfo } from "./data.js";

const FormComponent = FormProvider as FormProviderComponent<IMeasureDef, ValidationSpecialInfo>;

export function TestFormProvider({
    children,
    metric = emptyMetric,
    canManageProject = true,
    locked = false,
    onValueChange,
}: {
    children: ReactElement;
    metric?: IMeasureDef;
    canManageProject?: boolean;
    locked?: boolean;
    onValueChange?: (metric: IMeasureDef, valid: boolean) => void;
}): ReactElement {
    return (
        <FormComponent
            data={metric}
            writeable={canManageProject}
            editable={canManageProject}
            locked={locked}
            onClose={() => {}}
            onSave={() => Promise.resolve()}
            onSaveAs={() => Promise.resolve()}
            onValueChange={onValueChange}
        >
            {children}
        </FormComponent>
    );
}
