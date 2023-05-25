// (C) 2020-2023 GoodData Corporation
import React, { useState, useEffect } from "react";
import { defineMessages, IntlShape, useIntl } from "react-intl";
import { LRUCache } from "lru-cache";
import { AttributeDisplayFormType, IAttributeElement, ObjRef, objRefToString } from "@gooddata/sdk-model";
import { ParameterDetail } from "./ParameterDetail.js";
import { emptyHeaderTitleFromIntl, useBackendStrict } from "@gooddata/sdk-ui";
import { IAnalyticalBackend, IElementsQueryResult } from "@gooddata/sdk-backend-spi";

const MAX_CACHED_REQUESTS = 50;
const MAX_URL_LENGTH = 100;
const DISPLAY_FORM_ELEMENTS_LIMIT = 3;

const requestCache = new LRUCache<string, IElementsQueryResult>({ max: MAX_CACHED_REQUESTS });

const getDisplayFormLabel = (type: AttributeDisplayFormType | undefined) => {
    const messages = defineMessages({
        hyperlink: { id: "configurationPanel.drillIntoUrl.editor.urlDisplayFormTypeLabel" },
        pushpin: { id: "configurationPanel.drillIntoUrl.editor.geoDisplayFormTypeLabel" },
        default: { id: "configurationPanel.drillIntoUrl.editor.defaultDisplayFormTypeLabel" },
    });

    switch (type) {
        case "GDC.link":
            return messages.hyperlink;
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

export const AttributeDisplayFormParameterDetail: React.FC<IAttributeDisplayFormParameterDetailProps> = (
    props,
) => {
    const { title, label, type, displayFormRef, projectId, showValues } = props;
    const intl = useIntl();
    const backend = useBackendStrict();

    const [isLoading, setIsLoading] = useState(true);
    const [values, setValues] = useState<string[]>([]);
    const [additionalValues, setAdditionalValues] = useState(0);

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

        if (showValues) {
            getValues();
        } else {
            setIsLoading(false);
        }

        return () => {
            isMounted = false;
        };
    }, [displayFormRef, type, intl, projectId, showValues, backend]);

    return (
        <ParameterDetail
            title={title}
            label={label}
            typeName={intl.formatMessage(getDisplayFormLabel(type))}
            isLoading={isLoading}
            useEllipsis={type !== "GDC.link"}
            values={values ? values : []}
            additionalValues={additionalValues}
        />
    );
};
