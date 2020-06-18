// (C) 2007-2020 GoodData Corporation
import {
    interpolate,
    parse,
    CONTRACT_DOMAIN,
    CONTRACT_DOMAINS,
    CONTRACT_DOMAIN_USERS,
    CONTRACT_DOMAIN_PROJECTS,
} from "./routes";
import { XhrModule } from "../xhr";

const transformDomain = (item: any) => {
    const { domainId, contractId }: any = parse(item.domain.links.self, CONTRACT_DOMAIN);
    return {
        id: domainId,
        contractId,
        ...item.domain,
    };
};

const transformDomainUser = ({ user }: any) => {
    const params = parse(user.links.domain, CONTRACT_DOMAIN);
    return {
        id: user.login,
        ...params,
        fullName: `${user.firstName} ${user.lastName}`,
        ...user,
    };
};

export class DomainsModule {
    constructor(private xhr: XhrModule) {}

    public getDomain(contractId: string, domainId: string, query: string | null) {
        const uri = interpolate(CONTRACT_DOMAIN, { contractId, domainId }, query);

        return this.xhr
            .get(uri)
            .then((r: any) => r.getData())
            .then(transformDomain);
    }

    public getDomains(contractId: string, query: string | null) {
        return this.xhr
            .get(interpolate(CONTRACT_DOMAINS, { contractId }, query))
            .then((r) => r.getData())
            .then((result: any) => ({ items: result.domains.items.map(transformDomain) })); // TODO: paging?
    }

    public getDomainUsers(contractId: string, domainId: string, query: any, paging: any) {
        if (paging && !paging.next) {
            return Promise.resolve({ items: [], paging: {} });
        }

        const uri = paging
            ? paging.next
            : interpolate(CONTRACT_DOMAIN_USERS, { contractId, domainId }, query);

        return this.xhr
            .get(uri)
            .then((r) => r.getData())
            .then((result: any) => ({
                ...result.domainUsers,
                items: result.domainUsers.items.map(transformDomainUser),
            }));
    }

    public getDomainProjects(contractId: string, domainId: string, state: any, query: any, paging: any) {
        let uri = null;

        if (paging) {
            if (!paging.next) {
                return Promise.resolve({ items: [], paging: {} });
            }
            uri = paging.next;
        } else {
            const queryObject =
                state || query
                    ? {
                          ...(state ? { state } : undefined),
                          ...(query ? { prefixSearch: query } : undefined),
                      }
                    : null;
            uri = interpolate(CONTRACT_DOMAIN_PROJECTS, { contractId, domainId }, queryObject);
        }

        return this.xhr
            .get(uri)
            .then((r) => r.getData())
            .then((result: any) => ({
                ...result.domainProjects,
                items: result.domainProjects.items.map((item: any) => item.project),
            }));
    }
}
