export * from './toDisplayString'

/**
 * 判断是否为一个数组
 */
export const isArray = Array.isArray

/**
 * 判断是否为一个对象
 */
export const isObject = (val: unknown) =>
	val !== null && typeof val === 'object'

/**
 * 对比两个数据是否发生了改变
 */
export const hasChanged = (value: any, oldValue: any): boolean =>
	!Object.is(value, oldValue)

/**
 * 是否为一个 function
 */
export const isFunction = (val: unknown): val is Function =>
	typeof val === 'function'

/**
 * Object.assign
 */
export const extend = Object.assign

/**
 * 只读的空对象
 */
export const EMPTY_OBJ: { readonly [key: string]: any } = {}

/**
 * 判断是否为一个 string
 */
export const isString = (val: unknown): val is string => typeof val === 'string'

const onRE = /^on[^a-z]/
/**
 * 是否 on 开头
 */
export const isOn = (key: string) => onRE.test(key)

/**
 * 永远返回 false
 */
export const NO = () => false
