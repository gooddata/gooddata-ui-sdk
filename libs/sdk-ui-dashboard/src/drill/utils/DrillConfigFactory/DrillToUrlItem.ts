// (C) 2020-2021 GoodData Corporation
import { IAvailableDrillTargets } from "@gooddata/sdk-ui";
import { isDrillToAttributeUrl, isDrillToCustomUrl } from "@gooddata/sdk-backend-spi";
import { areObjRefsEqual } from "@gooddata/sdk-model";

import {
    DRILL_TARGET_TYPE,
    IDefinitionValidationData,
    IDrillToUrl,
    IDrillToUrlConfig,
    UrlDrillTarget,
    AttributeDisplayFormType,
    IDrillToUrlPlaceholder,
} from "../../interfaces";
import { DrillItem } from "./DrilItem";

function matchAll(regex: RegExp, text: string): RegExpExecArray[] {
    const matches = [];
    let match = null;
    while ((match = regex.exec(text)) !== null) {
        matches.push(match);
    }
    return matches;
}

export const getAttributeIdentifiersPlaceholdersFromUrl = (url: string): IDrillToUrlPlaceholder[] =>
    matchAll(/{attribute_title\((.*?)\)}/g, url).map((match) => ({
        placeholder: match[0],
        identifier: match[1],
        toBeEncoded: match.index !== 0,
    }));

export class DrillToUrlItem extends DrillItem<IDrillToUrl> {
    constructor(drillData: IDrillToUrl) {
        super(drillData);
    }

    public getFromLocalIdentifier(): string {
        return this.localIdOrDie(this.data.origin.measure);
    }

    public createConfig(supportedItemsForWidget: IAvailableDrillTargets): IDrillToUrlConfig {
        return {
            type: "measure",
            localIdentifier: this.getFromLocalIdentifier(),
            title: this.getTitleFromDrillableItemPushData(
                supportedItemsForWidget,
                this.getFromLocalIdentifier(),
            ),
            attributes: this.getAttributes(supportedItemsForWidget),
            drillTargetType: DRILL_TARGET_TYPE.DRILL_TO_URL,
            urlDrillTarget: this.buildUrlDrillTarget(),
            complete: true,
        };
    }

    private buildUrlDrillTarget(): UrlDrillTarget {
        if (isDrillToCustomUrl(this.data)) {
            const customUrl = this.data.target.url;
            return {
                customUrl,
            };
        }
        if (isDrillToAttributeUrl(this.data)) {
            const {
                displayForm: insightAttributeDisplayForm,
                hyperlinkDisplayForm: drillToAttributeDisplayForm,
            } = this.data.target;

            return {
                insightAttributeDisplayForm,
                drillToAttributeDisplayForm,
            };
        }
        throw new Error("Unsupported URL drill type!");
    }

    public isItemValid(data: IDefinitionValidationData): boolean {
        if (data.attributeDisplayForms === undefined || isDrillToCustomUrl(this.data)) {
            // Consider URL drill as valid for dashboard view mode where display forms are not being fetched
            // Custom URL is "valid" when attributes are missing because it is fixable by user in edit mode
            return this.isFromLocalIdentifierValid(data);
        }
        if (isDrillToAttributeUrl(this.data)) {
            const { displayForm, hyperlinkDisplayForm } = this.data.target;
            return (
                this.isFromLocalIdentifierValid(data) &&
                data.attributeDisplayForms.some(
                    ({ ref, type }) =>
                        areObjRefsEqual(ref, hyperlinkDisplayForm) &&
                        type === AttributeDisplayFormType.HYPERLINK,
                ) &&
                data.attributeDisplayForms.some(({ ref }) => areObjRefsEqual(ref, displayForm))
            );
        }
        throw new Error("Unsupported URL drill type!");
    }

    public isCustomUrlValid(data: IDefinitionValidationData): boolean {
        if (isDrillToCustomUrl(this.data)) {
            const customUrl = this.data.target.url;
            const supportedDisplayFormIdentifiers = data.attributeDisplayForms!.map(
                (displayForm) => displayForm.identifier,
            );
            return getAttributeIdentifiersPlaceholdersFromUrl(customUrl).every((displayForm) =>
                supportedDisplayFormIdentifiers.includes(displayForm.identifier),
            );
        }
        return true;
    }
}
