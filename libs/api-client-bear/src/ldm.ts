// (C) 2020 GoodData Corporation
import { XhrModule } from "./xhr.js";

export class LdmModule {
    constructor(private xhr: XhrModule) {}

    /**
     * Get closest connecting attributes in the LDM by calling the "attributeupperbound" endpoint
     *
     * @param projectId - A project identifier
     * @param attributeUris - Input list of attribute URIs
     * @returns Resolves with result list of attribute URIs
     */
    public getCommonAttributes(projectId: string, attributeUris: ReadonlyArray<string>): Promise<string[]> {
        return this.xhr
            .post(`/gdc/md/${projectId}/ldm/attributeupperbound`, {
                body: {
                    attributeUpperBounds: {
                        attributes: attributeUris,
                    },
                },
            })
            .then((response) => response.getData())
            .then((data) => {
                if (data.attributeUpperBoundsResponse) {
                    return data.attributeUpperBoundsResponse.upperbounds;
                }
            });
    }
}
