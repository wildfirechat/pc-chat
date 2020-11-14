/*
 * Copyright (c) 2020 WildFireChat. All rights reserved.
 */

import Long from 'long'

// 说明
// 1. 由于PC SDK 和 Web SDK 对java long类型的处理不一致 ，故引入本系列函数
// 2. PC SDK，messageUid转换为long类型（可参考long.js)，其他所有时间相关的字段，都转换成number
// 3. Web SDK，messageUid 以及所有时间相关的字段都转换为long类型
// 4. 为了将UI层代码统一，对所有相关字段进行比较 、运算等操作时，都必须由本序列函数处理
/**
 * 比较数值大小
 * @param {long | number | string} a
 * @param {long | number | string} b
 * @return {number} 相等返回0，a 大于 b 返回1，a 小于 b 返回-1
 */
export function compare (a, b) {
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
export function eq (a, b) {
    return compare(a, b) === 0
}

/**
 * 判断数值a是否大于b
 * @param {long | number | string} a
 * @param {long | number | string} b
 * @return {boolean} a大于b返回true；否则返回false
 */
export function gt (a, b) {
    return compare(a, b) === 1
}

/**
 * 判断数值a是否大于或等于b
 * @param {long | number | string} a
 * @param {long | number | string} b
 * @return {boolean} a大于或等于b返回true；否则返回false
 */
export function gte (a, b) {
    return compare(a, b) >= 0
}

/**
 * 判断数值a是否小于b
 * @param {long | number | string} a
 * @param {long | number | string} b
 * @return {boolean} a小于b返回true；否则返回false
 */
export function lt (a, b) {
    return compare(a, b) === -1
}

/**
 * 判断数值a是否小于或等于b
 * @param {long | number | string} a
 * @param {long | number | string} b
 * @return {boolean} a小于或者等于b返回true；否则返回false
 */
export function lte (a, b) {
    return compare(a, b) <= 0
}

/**
 * 将数值l转换成string类型
 * @param {long |  number | string} l
 * @return {string} 数值表示
 */
export function stringValue(l){
    const longl = Long.fromValue(l);
    return longl.toString();
}

/**
 * 将数值l转换成long类型
 * @param {long |  number | string} l
 * @return {long} 数值表示
 */
export function longValue(value){
    return Long.fromValue(value);
}

/**
 * 将数值l转换成number类型
 * @param {long | number | string} l
 * @return {number|l} 如果数值l小于等于{@code Number.MAX_SAFE_INTEGER}则返回对应的number，否则原样返回
 */
export function numberValue(l){
    if(lte(l, Number.MAX_SAFE_INTEGER)){
        const longl = Long.fromValue(l);
        return longl.toNumber();
    }else {
        console.log(l, 'is large than Number.MAX_SAFE_INTEGER, do nothing')
        return l;
    }
}

