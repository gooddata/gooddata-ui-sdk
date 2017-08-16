import { get } from '../xhr';
import * as routes from './routes';

const transformDomain = (item) => {
    const { domainId, contractId } = routes.parse(item.domain.links.self, routes.CONTRACT_DOMAIN);
    return {
        id: domainId,
        contractId,
        ...item.domain
    };
};

export const getDomain = (contractId, domainId, query) => {
    const uri = routes.interpolate(routes.CONTRACT_DOMAIN, { contractId, domainId }, query);

    return get(uri).then(transformDomain);
};

export const getDomains = (contractId, query) => {
    return get(routes.interpolate(routes.CONTRACT_DOMAINS, { contractId }, query))
        .then(result => ({ items: result.domains.items.map(transformDomain) })); // TODO: paging?
};

const transformDomainUser = ({ user }) => {
    const params = routes.parse(user.links.domain, routes.CONTRACT_DOMAIN);
    return {
        id: user.login,
        ...params,
        fullName: `${user.firstName} ${user.lastName}`,
        ...user
    };
};

export const getDomainUsers = (contractId, domainId, query, paging) => {
    if (paging && !paging.next) {
        return Promise.resolve({ items: [], paging: {} });
    }

    const uri = paging ?
        paging.next : routes.interpolate(routes.CONTRACT_DOMAIN_USERS, { contractId, domainId }, query);

    return get(uri).then(result => ({
        ...result.domainUsers,
        items: result.domainUsers.items.map(transformDomainUser)
    }));
};

export const getDomainProjects = (contractId, domainId, query, paging) => {
    if (paging && !paging.next) {
        return Promise.resolve({ items: [], paging: {} });
    }

    const uri = paging ?
        paging.next : routes.interpolate(
            routes.CONTRACT_DOMAIN_PROJECTS,
            { contractId, domainId }, query && { prefixSearch: query }
        );

    return get(uri).then(result => ({
        ...result.domainProjects,
        items: result.domainProjects.items.map(item => item.project)
    }));
};
