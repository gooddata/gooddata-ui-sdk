// (C) 2024 GoodData Corporation
import {
    ComparisonComparisonOperatorEnum,
    JsonApiAutomationIn,
    JsonApiAutomationPatchAttributesAlert,
} from "@gooddata/api-client-tiger";
import {
    IAutomationAlert,
    IAutomationMetadataObject,
    IAutomationMetadataObjectDefinition,
} from "@gooddata/sdk-model";
import omitBy from "lodash/omitBy.js";
import isEmpty from "lodash/isEmpty.js";
import { v4 as uuidv4 } from "uuid";
import { convertMeasure } from "./afm/MeasureConverter.js";
import { convertFilter } from "./afm/FilterConverter.js";
import compact from "lodash/compact.js";
import omit from "lodash/omit.js";

export function convertAutomation(
    automation: IAutomationMetadataObject | IAutomationMetadataObjectDefinition,
    exportDefinitionIds?: string[],
): JsonApiAutomationIn {
    const { id, type, description, schedule, alert, tags, title, recipients, details, webhook, dashboard } =
        automation;
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

    const attributes = omitBy(
        {
            title,
            description,
            tags,
            details,
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

const convertAlert = (alert: IAutomationAlert): JsonApiAutomationPatchAttributesAlert => {
    const { condition, execution } = alert;

    const convertedCondition = {
        comparison: {
            operator: condition.operator as ComparisonComparisonOperatorEnum,
            left: { localIdentifier: condition.left },
            right: { value: condition.right },
        },
    };

    return {
        condition: convertedCondition,
        execution: {
            filters: compact(execution.filters.map(convertFilter)),
            measures: execution.measures.map((measure) => {
                return omit(convertMeasure(measure), "alias", "format", "title");
            }),
        },
    };
};
