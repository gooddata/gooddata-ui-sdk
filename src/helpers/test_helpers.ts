export function postpone(fn, timeout = 1) {
    setTimeout(() => {
        try {
            fn();
        } catch (error) {
            console.error(error);
        }
    }, timeout);
}
