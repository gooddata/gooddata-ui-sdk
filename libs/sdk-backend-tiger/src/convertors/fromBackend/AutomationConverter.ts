// (C) 2024 GoodData Corporation
import {
    JsonApiAutomationOutIncludes,
    JsonApiAutomationOutList,
    JsonApiAutomationOutWithLinks,
    JsonApiExportDefinitionOutWithLinks,
    JsonApiUserLinkage,
    JsonApiUserOutWithLinks,
} from "@gooddata/api-client-tiger";
import {
    IAutomationMetadataObject,
    IAutomationRecipient,
    idRef,
    isAutomationUserRecipient,
} from "@gooddata/sdk-model";
import { convertExportDefinitionMdObject as convertExportDefinitionMdObjectFromBackend } from "./ExportDefinitionsConverter.js";
import compact from "lodash/compact.js";
import { convertUserIdentifier } from "./UsersConverter.js";

function convertRecipient(
    userLinkage: JsonApiUserLinkage,
    included: JsonApiAutomationOutIncludes[],
): IAutomationRecipient | undefined {
    const linkedUser = included.find(
        (i) => i.type === "user" && i.id === userLinkage.id,
    ) as JsonApiUserOutWithLinks;
    if (!linkedUser) {
        return undefined;
    }

    const userFirstName = linkedUser.attributes?.firstname;
    const userLastName = linkedUser.attributes?.lastname;
    const userName = userFirstName && userLastName ? `${userFirstName} ${userLastName}` : undefined;
    return {
        type: "user",
        id: linkedUser.id,
        name: userName,
        email: linkedUser.attributes?.email,
    };
}

export function convertAutomation(
    automation: JsonApiAutomationOutWithLinks,
    included: JsonApiAutomationOutIncludes[],
): IAutomationMetadataObject {
    const { id, attributes = {}, relationships = {} } = automation;
    const { title, description, tags, schedule, details, createdAt, modifiedAt } = attributes;
    const { createdBy, modifiedBy } = relationships;

    const webhook = relationships?.notificationChannel?.data?.id;
    const exportDefinitionsIds = relationships?.exportDefinitions?.data?.map((ed) => ed.id) ?? [];
    const includedExportDefinitions = compact(
        exportDefinitionsIds.map((exportDefinitionId) =>
            included.find((i) => i.type === "exportDefinition" && i.id === exportDefinitionId),
        ),
    );

    const exportDefinitions = includedExportDefinitions.map((ed) =>
        convertExportDefinitionMdObjectFromBackend(ed as JsonApiExportDefinitionOutWithLinks),
    );

    const recipients =
        relationships?.recipients?.data
            ?.map((r) => convertRecipient(r, included))
            .filter(isAutomationUserRecipient) ?? [];

    const dashboard = relationships?.analyticalDashboard?.data?.id;

    return {
        // Common metadata object properties
        type: "automation",
        id,
        ref: idRef(id, "automation"),
        uri: id,
        title: title ?? "",
        description: description ?? "",
        tags,
        // Details
        schedule,
        details,
        // Relationships
        exportDefinitions,
        recipients,
        webhook,
        createdBy: convertUserIdentifier(createdBy, included),
        updatedBy: convertUserIdentifier(modifiedBy, included),
        created: createdAt,
        updated: modifiedAt,
        dashboard,
        // Bear legacy props
        unlisted: false,
        production: true,
        deprecated: false,
    };
}

export const convertAutomationListToAutomations = (
    automationList: JsonApiAutomationOutList,
): IAutomationMetadataObject[] => {
    return automationList.data.map((automationObject) =>
        convertAutomation(automationObject, automationList.included ?? []),
    );
};
