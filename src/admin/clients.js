import { get } from '../xhr';
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

export const getClient = (contractId, dataProductId, segmentId, domainId, clientId) => {
    const query = { stats: 'user' };
    const uri = routes.interpolate(
        routes.CONTRACT_DATA_PRODUCT_DOMAIN_SEGMENT_CLIENT,
        { contractId, dataProductId, segmentId, domainId, clientId },
        query
    );

    return get(uri).then(result => transformClient(result));
};

export const getClients = (contractId, dataProductId, segmentId, domainId, filter, paging) => {
    const query = filter ? { clientPrefix: filter, stats: 'user' } : { stats: 'user' };
    const uri = paging ?
        paging.next :
        routes.interpolate(
            routes.CONTRACT_DATA_PRODUCT_DOMAIN_SEGMENT_CLIENTS,
            { contractId, dataProductId, segmentId, domainId },
            query
        );

    if (uri) {
        return get(uri).then(result => ({
            items: result.clients.items.map(transformClient),
            paging: result.clients.paging
        }));
    }

    return Promise.resolve({ items: [], paging: {} });
};

const transformClientUser = (user) => {
    return {
        id: user.login,
        fullName: `${user.firstName} ${user.lastName}`,
        role: user.roles[0],
        ...user
    };
};

export const getClientUsers = (contractId, dataProductId, domainId, segmentId, clientId, query, paging) => {
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

    return get(uri).then(result => ({
        ...result.clientUsers,
        items: result.clientUsers.items.map(transformClientUser)
    }));
};
