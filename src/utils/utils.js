/**
 * Created by zayinkrige on 2017/03/09.
 */

export function stringify(object) {
    let cache = [];
    let toRet = JSON.stringify(object, function(key, value) {
        if (typeof value === 'object' && value !== null) {
            if (cache.indexOf(value) !== -1) {
                // Circular reference found, discard key
                return;
            }
            // Store value in our collection
            cache.push(value);
        }
        return value;
    });
    cache = null;
    return toRet;
}