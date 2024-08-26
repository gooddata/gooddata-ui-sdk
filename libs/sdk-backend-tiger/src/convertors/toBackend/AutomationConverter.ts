// (C) 2024 GoodData Corporation
import {
    ComparisonComparisonOperatorEnum,
    JsonApiAutomationIn,
    JsonApiAutomationInAttributesAlert,
} from "@gooddata/api-client-tiger";
import {
    IAutomationAlert,
    IAutomationMetadataObject,
    IAutomationMetadataObjectDefinition,
} from "@gooddata/sdk-model";
import omitBy from "lodash/omitBy.js";
import isEmpty from "lodash/isEmpty.js";
import omit from "lodash/omit.js";
import { v4 as uuidv4 } from "uuid";
import { convertMeasure } from "./afm/MeasureConverter.js";
import { convertAfmFilters } from "./afm/AfmFiltersConverter.js";

export function convertAutomation(
    automation: IAutomationMetadataObject | IAutomationMetadataObjectDefinition,
    exportDefinitionIds?: string[],
): JsonApiAutomationIn {
    const {
        id,
        type,
        description,
        schedule,
        alert,
        tags,
        title,
        recipients,
        details,
        webhook,
        dashboard,
        metadata,
    } = automation;
    const relationships = omitBy(
        {
            exportDefinitions: exportDefinitionIds?.length
                ? {
                      data:
                          exportDefinitionIds?.map((exportDefinitionId) => ({
                              type: "exportDefinition",
                              id: exportDefinitionId,
                          })) ?? [],
                  }
                : undefined,
            recipients: recipients?.length
                ? {
                      data: recipients?.map((r) => ({ type: "user", id: r.id })) ?? [],
                  }
                : undefined,
            notificationChannel: webhook
                ? {
                      data: { type: "notificationChannel", id: webhook },
                  }
                : undefined,
            analyticalDashboard: dashboard
                ? { data: { type: "analyticalDashboard", id: dashboard } }
                : undefined,
        },
        isEmpty,
    );

    const hasRelationships = !isEmpty(relationships);

    const scheduleObj = schedule ? { schedule } : {};
    const alertObj = alert
        ? {
              alert: convertAlert(alert),
          }
        : {};
    const state = alert ? alert.trigger.state : undefined;
    const metadataObj = metadata ? { metadata } : {};

    const attributes = omitBy(
        {
            title,
            description,
            tags,
            details,
            state,
            ...metadataObj,
            ...scheduleObj,
            ...alertObj,
        },
        isEmpty,
    );

    return {
        type,
        id: id ?? uuidv4(),
        attributes,
        ...(hasRelationships
            ? {
                  relationships,
              }
            : {}),
    };
}

const convertAlert = (alert: IAutomationAlert): JsonApiAutomationInAttributesAlert => {
    const { condition, execution } = alert;

    const convertedCondition = {
        comparison: {
            operator: condition.operator as ComparisonComparisonOperatorEnum,
            left: { localIdentifier: condition.left },
            right: { value: condition.right },
        },
    };

    const { filters: convertedFilters } = convertAfmFilters(execution.measures, execution.filters);

    return {
        condition: convertedCondition,
        execution: {
            filters: convertedFilters,
            measures: execution.measures.map((measure) => {
                return omit(convertMeasure(measure), "alias", "format", "title");
            }),
        },
        trigger: alert.trigger.mode,
    };
};
