import * as routes from './routes';

const transformDomain = (item) => {
    const { domainId, contractId } = routes.parse(item.domain.links.self, routes.CONTRACT_DOMAIN);
    return {
        id: domainId,
        contractId,
        ...item.domain
    };
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

export function createModule(xhr) {
    const getDomain = (contractId, domainId, query) => {
        const uri = routes.interpolate(routes.CONTRACT_DOMAIN, { contractId, domainId }, query);

        return xhr.get(uri).then(transformDomain);
    };

    const getDomains = (contractId, query) => {
        return xhr.get(routes.interpolate(routes.CONTRACT_DOMAINS, { contractId }, query))
            .then(result => ({ items: result.domains.items.map(transformDomain) })); // TODO: paging?
    };

    const getDomainUsers = (contractId, domainId, query, paging) => {
        if (paging && !paging.next) {
            return Promise.resolve({ items: [], paging: {} });
        }

        const uri = paging ?
            paging.next : routes.interpolate(routes.CONTRACT_DOMAIN_USERS, { contractId, domainId }, query);

        return xhr.get(uri).then(result => ({
            ...result.domainUsers,
            items: result.domainUsers.items.map(transformDomainUser)
        }));
    };

    const getDomainProjects = (contractId, domainId, state, query, paging) => {
        if (paging && !paging.next) {
            return Promise.resolve({ items: [], paging: {} });
        }

        const uri = paging ?
            paging.next : routes.interpolate(
                routes.CONTRACT_DOMAIN_PROJECTS,
                { contractId, domainId }, state || query ?
                    Object.assign(state && { state }, query && { prefixSearch: query }) : null
            );

        return xhr.get(uri).then(result => ({
            ...result.domainProjects,
            items: result.domainProjects.items.map(item => item.project)
        }));
    };

    return {
        getDomain,
        getDomains,
        getDomainUsers,
        getDomainProjects
    };
}
