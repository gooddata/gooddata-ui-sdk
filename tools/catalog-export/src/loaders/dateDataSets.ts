// (C) 2007-2020 GoodData Corporation
import gooddata from "@gooddata/gd-bear-client";
import { GdcDataSets } from "@gooddata/gd-bear-model";
import { get } from "lodash";
import { Attribute, DateDataSet, DisplayForm } from "../base/types";

/**
 * Loads date data sets defined in the provided project. This function retrieves the minimum
 * descriptive information about the data set, its attributes and display forms.
 *
 * @param projectId - project to get date data sets from
 * @returns list of date data sets
 */
export async function loadDateDataSets(projectId: string): Promise<DateDataSet[]> {
    const dateDataSets: DateDataSet[] = [];
    const attributeUriToDs: { [uri: string]: DateDataSet } = {};

    const dataSets = await gooddata.md.getObjectsByQuery<GdcDataSets.IWrappedDataSet>(projectId, {
        category: "dataSet",
    });

    dataSets
        .filter(ds => get(ds, "dataSet.content.urn", "").endsWith(":date"))
        .forEach(ds => {
            const newDs: DateDataSet = {
                dateDataSet: {
                    meta: {
                        identifier: ds.dataSet.meta.identifier,
                        tags: ds.dataSet.meta.tags!,
                        title: ds.dataSet.meta.title,
                    },
                    content: {
                        attributes: [],
                    },
                },
            };

            dateDataSets.push(newDs);

            const attributeUris: string[] = ds.dataSet.content.attributes;
            attributeUris.forEach((attrUri: string) => {
                attributeUriToDs[attrUri] = newDs;
            });
        });

    const objects = await gooddata.md.getObjects(projectId, Object.keys(attributeUriToDs));

    objects.forEach((attr: any) => {
        const dataSet = attributeUriToDs[attr.attribute.meta.uri];
        const newDfs: DisplayForm[] = attr.attribute.content.displayForms.map((df: any) => {
            return {
                meta: {
                    identifier: df.meta.identifier,
                    tags: df.meta.tags,
                    title: df.meta.title,
                },
            };
        });
        const newAttr: Attribute = {
            attribute: {
                meta: {
                    identifier: attr.attribute.meta.identifier,
                    tags: attr.attribute.meta.tags,
                    title: attr.attribute.meta.title,
                },
                content: {
                    displayForms: newDfs,
                },
            },
        };

        dataSet.dateDataSet.content.attributes.push(newAttr);
    });

    return dateDataSets;
}
