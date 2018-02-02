import * as routes from './routes';

const transformClient = (item) => {
    const { contractId, dataProductId, domainId, segmentId } =
        routes.parse(item.client.links.self, routes.CONTRACT_DATA_PRODUCT_DOMAIN_SEGMENT_CLIENT);

    return {
        contractId,
        dataProductId,
        domainId,
        segmentId,
        ...item.client
    };
};

const transformClientUser = (user) => {
    return {
        id: user.login,
        fullName: `${user.firstName} ${user.lastName}`,
        role: user.roles[0],
        ...user
    };
};

export function createModule(xhr) {
    const getClient = (contractId, dataProductId, segmentId, domainId, clientId) => {
        const query = { stats: 'user' };
        const uri = routes.interpolate(
            routes.CONTRACT_DATA_PRODUCT_DOMAIN_SEGMENT_CLIENT,
            { contractId, dataProductId, segmentId, domainId, clientId },
            query
        );

        return xhr.get(uri).then(result => transformClient(result));
    };

    const getClients = (contractId, dataProductId, segmentId, domainId, filter, paging) => {
        const query = filter ? { clientPrefix: filter, stats: 'user' } : { stats: 'user' };
        const uri = paging ?
            paging.next :
            routes.interpolate(
                routes.CONTRACT_DATA_PRODUCT_DOMAIN_SEGMENT_CLIENTS,
                { contractId, dataProductId, segmentId, domainId },
                query
            );

        if (uri) {
            return xhr.get(uri).then(result => ({
                items: result.clients.items.map(transformClient),
                paging: result.clients.paging
            }));
        }

        return Promise.resolve({ items: [], paging: {} });
    };

    const getClientUsers = (contractId, dataProductId, domainId, segmentId, clientId, query, paging) => {
        if (paging && !paging.next) {
            return Promise.resolve({ items: [], paging: {} });
        }

        const uri = paging ?
            paging.next :
            routes.interpolate(
                routes.CONTRACT_DATA_PRODUCT_DOMAIN_SEGMENT_CLIENT_USERS,
                { contractId, dataProductId, domainId, segmentId, clientId },
                query
            );

        return xhr.get(uri).then(result => ({
            ...result.clientUsers,
            items: result.clientUsers.items.map(transformClientUser)
        }));
    };

    return {
        getClient,
        getClients,
        getClientUsers
    };
}
