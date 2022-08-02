// (C) 2020-2022 GoodData Corporation
import React, { useState, useEffect } from "react";
import { IntlShape, useIntl } from "react-intl";
import LRUCache from "lru-cache";
import { IElementsQueryResult, IAttributeElement } from "@gooddata/sdk-backend-spi";
import { objRefToString, ObjRef } from "@gooddata/sdk-model";

// import { getElements } from "../../../../../../modules/Core/utils/api";

import { ParameterDetail } from "./ParameterDetail";
import { AttributeDisplayFormType } from "../../../../types";

const DISPLAY_FORM_ELEMENTS_LIMIT = 3;
const MAX_URL_LENGTH = 100;
const MAX_CACHED_REQUESTS = 50;

const handleEmptyValues = (values: string[], intl: IntlShape) =>
    values.map((value: string) =>
        value.length === 0 ? `(${intl.formatMessage({ id: "visualization.emptyValue" })})` : value,
    );

const prepareValues = (elements: IAttributeElement[], type: string) => {
    if (type !== AttributeDisplayFormType.HYPERLINK) {
        return elements.map(({ title }) => title);
    }
    return elements.map(({ title }) =>
        title.length > MAX_URL_LENGTH ? `${title.substr(0, MAX_URL_LENGTH)}...` : title,
    );
};

const requestCache = new LRUCache<string, IElementsQueryResult>({ max: MAX_CACHED_REQUESTS });

const getCachedRequests = async (projectId: string, displayFormRef: ObjRef) => {
    const cacheKey = objRefToString(displayFormRef);
    const cachedResponse = requestCache.get(cacheKey);

    if (cachedResponse) {
        return cachedResponse;
    }

    const response = await getElements(projectId, displayFormRef, DISPLAY_FORM_ELEMENTS_LIMIT);
    requestCache.set(cacheKey, response);

    return response;
};

const getDisplayFormLabel = (type: string) => {
    switch (type) {
        case AttributeDisplayFormType.HYPERLINK:
            return "configurationPanel.drillIntoUrl.editor.urlDisplayFormTypeLabel";
        case AttributeDisplayFormType.GEO_PUSHPIN:
            return "configurationPanel.drillIntoUrl.editor.geoDisplayFormTypeLabel";
        default:
            return "configurationPanel.drillIntoUrl.editor.defaultDisplayFormTypeLabel";
    }
};

interface IAttributeDisplayFormParameterDetailProps {
    title: string;
    label: string;
    type: string;
    projectId: string;
    displayFormRef: ObjRef;
}

export const AttributeDisplayFormParameterDetail: React.FC<IAttributeDisplayFormParameterDetailProps> = (
    props,
) => {
    const { title, label, type, displayFormRef, projectId } = props;
    const intl = useIntl();

    const [isLoading, setIsLoading] = useState(true);
    const [values, setValues] = useState<string[]>();
    const [additionalValues, setAdditionalValues] = useState<number>();

    useEffect(() => {
        let isMounted = true;

        const getValues = async () => {
            const response = await getCachedRequests(projectId, displayFormRef);
            if (isMounted) {
                const additional = response.totalCount - DISPLAY_FORM_ELEMENTS_LIMIT;
                if (additional > 0) {
                    setAdditionalValues(additional);
                }
                setValues(handleEmptyValues(prepareValues(response.items, type), intl));
                setIsLoading(false);
            }
        };

        getValues();

        return () => {
            isMounted = false;
        };
    }, [displayFormRef, type, intl, projectId]);

    return (
        <ParameterDetail
            title={title}
            label={label}
            typeName={intl.formatMessage({ id: getDisplayFormLabel(type) })}
            isLoading={isLoading}
            useEllipsis={type !== AttributeDisplayFormType.HYPERLINK}
            values={values ? values : []}
            additionalValues={additionalValues}
        />
    );
};
