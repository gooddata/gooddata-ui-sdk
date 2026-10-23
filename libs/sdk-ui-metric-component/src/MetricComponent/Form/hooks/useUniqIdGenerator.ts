// (C) 2021-2026 GoodData Corporation

import { useEffect, useMemo, useState } from "react";

import { isEmpty } from "lodash-es";

import { generateUniqId } from "../../metric/nameGenerators.js";
import { FormField } from "../data.js";
import { useOtherMetrics } from "../OtherMetrics/useOtherMetrics.js";
import { usePrefixes } from "../Prefixes/usePrefixes.js";

import { useMetricFormField } from "./useMetricFormField.js";

export function useUniqIdGenerator(regenerateId = false): string {
    const { value } = useMetricFormField(FormField.title);
    const { id, defaultId } = useIdOrDefaultId();

    useGenerateId(value, defaultId, regenerateId);

    return id;
}

function useIdOrDefaultId() {
    const idField = useMetricFormField(FormField.id);
    const titleField = useMetricFormField(FormField.title);

    // oxlint-disable-next-line react-hooks/exhaustive-deps
    const defaultId = useMemo(() => idField.value, [idField.defaultValues]);
    const defaultIdByTitle = useDefaultIdByTitle(titleField.value, defaultId);

    return {
        id: defaultId || defaultIdByTitle,
        defaultId,
    };
}

function useGenerateId(title: string, defaultId: string, regenerateId = false) {
    const { changed, setValue } = useMetricFormField(FormField.id);
    const prefix = useMetricFormField(FormField.prefix);
    const { otherMetrics } = useOtherMetrics();
    const { parents } = usePrefixes();

    useEffect(() => {
        if (!changed && (isEmpty(defaultId) || regenerateId)) {
            setValue(generateUniqId(title, prefix.value, otherMetrics, parents));
        }
    }, [defaultId, changed, otherMetrics, title, regenerateId, setValue, prefix.value, parents]);
}

function useDefaultIdByTitle(title: string, defaultId: string) {
    const prefix = useMetricFormField(FormField.prefix);
    const { otherMetrics } = useOtherMetrics();
    const { parents } = usePrefixes();
    const [defaultIdByTitle, setId] = useState(generateUniqId(title, prefix.value, otherMetrics, parents));

    useEffect(() => {
        if (isEmpty(defaultId)) {
            setId(generateUniqId(title, prefix.value, otherMetrics, parents));
        }
    }, [defaultId, otherMetrics, setId, title, prefix.value, parents]);

    return defaultIdByTitle;
}
