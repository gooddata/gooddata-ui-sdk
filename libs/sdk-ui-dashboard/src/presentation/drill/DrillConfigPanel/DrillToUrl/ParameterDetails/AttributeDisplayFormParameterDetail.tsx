// (C) 2020-2025 GoodData Corporation

import { useEffect, useState } from "react";

import { LRUCache } from "lru-cache";
import { IntlShape, defineMessages, useIntl } from "react-intl";

import { IAnalyticalBackend, IElementsQueryResult } from "@gooddata/sdk-backend-spi";
import { AttributeDisplayFormType, IAttributeElement, ObjRef, objRefToString } from "@gooddata/sdk-model";
import { emptyHeaderTitleFromIntl, useBackendStrict } from "@gooddata/sdk-ui";

import { ParameterDetail } from "./ParameterDetail.js";
import { newDisplayFormMap } from "../../../../../_staging/metadata/objRefMap.js";
import {
    selectBackendCapabilities,
    selectCatalogDateDatasets,
    useDashboardSelector,
} from "../../../../../model/index.js";

const MAX_CACHED_REQUESTS = 50;
const MAX_URL_LENGTH = 100;
const DISPLAY_FORM_ELEMENTS_LIMIT = 3;

const requestCache = new LRUCache<string, IElementsQueryResult>({ max: MAX_CACHED_REQUESTS });

const getDisplayFormLabel = (type: AttributeDisplayFormType | undefined) => {
    const messages = defineMessages({
        hyperlink: { id: "configurationPanel.drillIntoUrl.editor.urlDisplayFormTypeLabel" },
        image: { id: "configurationPanel.drillIntoUrl.editor.imageDisplayFormTypeLabel" },
        pushpin: { id: "configurationPanel.drillIntoUrl.editor.geoDisplayFormTypeLabel" },
        default: { id: "configurationPanel.drillIntoUrl.editor.defaultDisplayFormTypeLabel" },
    });

    switch (type) {
        case "GDC.link":
            return messages.hyperlink;
        case "GDC.image":
            return messages.image;
        case "GDC.geo.pin":
        case "GDC.geo.pin_latitude":
        case "GDC.geo.pin_longitude":
            return messages.pushpin;
        default:
            return messages.default;
    }
};

interface IAttributeDisplayFormParameterDetailProps {
    title: string;
    label: string;
    type: AttributeDisplayFormType | undefined;
    projectId: string;
    displayFormRef: ObjRef;
    showValues: boolean;
}

const handleEmptyValues = (values: Array<string | null>, intl: IntlShape) =>
    values.map((value: null | string) =>
        !value || value.length === 0 ? emptyHeaderTitleFromIntl(intl) : value,
    );

const prepareValues = (elements: IAttributeElement[], type?: AttributeDisplayFormType) => {
    if (type !== "GDC.link") {
        return elements.map(({ title }) => title);
    }
    return elements.map(({ title }) =>
        title && title.length > MAX_URL_LENGTH ? `${title.substr(0, MAX_URL_LENGTH)}...` : title,
    );
};

function getElements(backend: IAnalyticalBackend, projectId: string, displayFormRef: ObjRef, limit = 5) {
    return backend
        .workspace(projectId)
        .attributes()
        .elements()
        .forDisplayForm(displayFormRef)
        .withLimit(limit)
        .query();
}

const getCachedRequests = async (backend: IAnalyticalBackend, projectId: string, displayFormRef: ObjRef) => {
    const cacheKey = objRefToString(displayFormRef);
    const cachedResponse = requestCache.get(cacheKey);

    if (cachedResponse) {
        return cachedResponse;
    }

    const response = await getElements(backend, projectId, displayFormRef, DISPLAY_FORM_ELEMENTS_LIMIT);
    requestCache.set(cacheKey, response);

    return response;
};

const useSupportsEnumeration = (displayFormRef: ObjRef) => {
    const dateDatasets = useDashboardSelector(selectCatalogDateDatasets);
    const { hasTypeScopedIdentifiers, supportsEnumeratingDatetimeAttributes } =
        useDashboardSelector(selectBackendCapabilities);

    if (supportsEnumeratingDatetimeAttributes) {
        return true;
    }

    const dateAttributes = dateDatasets.flatMap((dateDataset) => dateDataset.dateAttributes);
    const displayForms = dateAttributes.flatMap((dateAttribute) => dateAttribute.attribute.displayForms);
    const displayFormMap = newDisplayFormMap(displayForms, hasTypeScopedIdentifiers);
    const isDateAttribute = Boolean(displayFormMap.get(displayFormRef));

    // datetime attributes should be skipped as they are not supporting enumeration
    return !isDateAttribute;
};

export function AttributeDisplayFormParameterDetail({
    title,
    label,
    type,
    displayFormRef,
    projectId,
    showValues,
}: IAttributeDisplayFormParameterDetailProps) {
    const intl = useIntl();
    const backend = useBackendStrict();

    const [isLoading, setIsLoading] = useState(true);
    const [values, setValues] = useState<string[]>([]);
    const [additionalValues, setAdditionalValues] = useState(0);
    const supportsEnumeration = useSupportsEnumeration(displayFormRef);

    useEffect(() => {
        let isMounted = true;

        const getValues = async () => {
            const response = await getCachedRequests(backend, projectId, displayFormRef);
            if (isMounted) {
                const additional = response.totalCount - DISPLAY_FORM_ELEMENTS_LIMIT;
                if (additional > 0) {
                    setAdditionalValues(additional);
                }
                setValues(handleEmptyValues(prepareValues(response.items, type), intl));
                setIsLoading(false);
            }
        };

        if (showValues && supportsEnumeration) {
            getValues();
        } else {
            setIsLoading(false);
        }

        return () => {
            isMounted = false;
        };
    }, [displayFormRef, type, intl, projectId, showValues, backend, supportsEnumeration]);

    return (
        <ParameterDetail
            title={title}
            label={label}
            typeName={intl.formatMessage(getDisplayFormLabel(type))}
            isLoading={isLoading}
            useEllipsis={type !== "GDC.link"}
            values={values || []}
            additionalValues={additionalValues}
        />
    );
}
