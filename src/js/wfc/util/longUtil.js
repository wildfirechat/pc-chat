import Long from 'long'

/**
 * 比较数值大小
 * @param {long | number | string} a
 * @param {long | number | string} b
 * @return {number} 相等返回0，a 大于 b 返回1，a 小于 b 返回-1
 */
function compare (a, b) {
    const longA = Long.fromValue(a)
    const longB = Long.fromValue(b)
    return longA.compare(longB)
}

/**
 * 判断数值是否相等
 * @param {long | number | string} a
 * @param {long | number | string} b
 * @return {boolean} 相等返回true；否则返回false
 */
function eq (a, b) {
    return compare(a, b) === 0
}

/**
 * 判断数值a是否大于b
 * @param {long | number | string} a
 * @param {long | number | string} b
 * @return {boolean} a大于b返回true；否则返回false
 */
function gt (a, b) {
    return compare(a, b) === 1
}

/**
 * 判断数值a是否大于或等于b
 * @param {long | number | string} a
 * @param {long | number | string} b
 * @return {boolean} a大于或等于b返回true；否则返回false
 */
function gte (a, b) {
    return compare(a, b) >= 0
}

/**
 * 判断数值a是否小于b
 * @param {long | number | string} a
 * @param {long | number | string} b
 * @return {boolean} a小于b返回true；否则返回false
 */
function lt (a, b) {
    return compare(a, b) === -1
}

/**
 * 判断数值a是否小于或等于b
 * @param {long | number | string} a
 * @param {long | number | string} b
 * @return {boolean} a小于或者等于b返回true；否则返回false
 */
function lte (a, b) {
    return compare(a, b) <= 0
}

/**
 * 将数值l转换成string类型
 * @param {long |  number | string} l
 * @return {string} 数值表示
 */
function stringValue(l){
    const longl = Long.fromValue(l);
    return longl.toString();
}

/**
 * 将数值l转换成number类型
 * @param {long | number | string} l
 * @return {number|l} 如果数值l小于等于{@code Number.MAX_SAFE_INTEGER}则返回对应的number，否则原样返回
 */
function numberValue(l){
    if(lte(l, Number.MAX_SAFE_INTEGER)){
        const longl = Long.fromValue(l);
        return longl.toNumber();
    }else {
        console.log(l, 'is large than Number.MAX_SAFE_INTEGER, do nothing')
        return l;
    }
}

module.exports = compare
module.exports.compare = compare
module.exports.eq = eq
module.exports.gt = gt
module.exports.gte = gte
module.exports.lt = lt
module.exports.lte = lte
module.exports.stringValue = stringValue
module.exports.numberValue = numberValue
