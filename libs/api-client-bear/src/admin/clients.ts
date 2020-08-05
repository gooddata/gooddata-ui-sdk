// (C) 2007-2020 GoodData Corporation
/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
import {
    interpolate,
    parse,
    CONTRACT_DATA_PRODUCT_DOMAIN_SEGMENT_CLIENT,
    CONTRACT_DATA_PRODUCT_DOMAIN_SEGMENT_CLIENTS,
    CONTRACT_DATA_PRODUCT_DOMAIN_SEGMENT_CLIENT_USERS,
} from "./routes";
import { XhrModule } from "../xhr";

export class ClientsModule {
    constructor(private xhr: XhrModule) {}

    public getClient(
        contractId: string,
        dataProductId: string,
        segmentId: string,
        domainId: string,
        clientId: string,
    ) {
        const query = { stats: "user" };
        const uri = interpolate(
            CONTRACT_DATA_PRODUCT_DOMAIN_SEGMENT_CLIENT,
            { contractId, dataProductId, segmentId, domainId, clientId },
            query,
        );

        return this.xhr
            .get(uri)
            .then((r: any) => r.getData())
            .then((result: any) => this.transformClient(result));
    }

    public getClients(
        contractId: string,
        dataProductId: string,
        segmentId: string,
        domainId: string,
        filter: any,
        paging: any,
    ) {
        const query = filter ? { clientPrefix: filter, stats: "user" } : { stats: "user" };
        const uri = paging
            ? paging.next
            : interpolate(
                  CONTRACT_DATA_PRODUCT_DOMAIN_SEGMENT_CLIENTS,
                  { contractId, dataProductId, segmentId, domainId },
                  query,
              );

        if (uri) {
            return this.xhr
                .get(uri)
                .then((r: any) => r.getData())
                .then((result: any) => ({
                    items: result.clients.items.map(this.transformClient),
                    paging: result.clients.paging,
                }));
        }

        return Promise.resolve({ items: [], paging: {} });
    }

    public getClientUsers(
        contractId: string,
        dataProductId: string,
        domainId: string,
        segmentId: string,
        clientId: string,
        query: any,
        paging: any,
    ) {
        if (paging && !paging.next) {
            return Promise.resolve({ items: [], paging: {} });
        }

        const uri = paging
            ? paging.next
            : interpolate(
                  CONTRACT_DATA_PRODUCT_DOMAIN_SEGMENT_CLIENT_USERS,
                  { contractId, dataProductId, domainId, segmentId, clientId },
                  query,
              );

        return this.xhr
            .get(uri)
            .then((r: any) => r.getData())
            .then((result: any) => ({
                ...result.clientUsers,
                items: result.clientUsers.items.map(this.transformClientUser),
            }));
    }

    private transformClient(item: any) {
        const { contractId, dataProductId, domainId, segmentId }: any = parse(
            item.client.links.self,
            CONTRACT_DATA_PRODUCT_DOMAIN_SEGMENT_CLIENT,
        );

        return {
            contractId,
            dataProductId,
            domainId,
            segmentId,
            ...item.client,
        };
    }

    private transformClientUser(user: any) {
        return {
            id: user.login,
            fullName: `${user.firstName} ${user.lastName}`,
            role: user.roles[0],
            ...user,
        };
    }
}
