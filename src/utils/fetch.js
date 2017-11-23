import invariant from 'invariant';

let realFetch;

export function setFetch(f) {
    realFetch = f;
}

export default function fetch(url, options) {
    invariant(realFetch, 'You have to define fetch implementation' +
        '(node-fetch, isomorphic-fetch) before using it.');

    return realFetch(url, options);
}
