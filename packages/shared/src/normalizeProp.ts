import { isArray, isObject, isString } from '.'

/**
 * 规范化 class 类，处理 class 的增强
 */
export function normalizeClass(value: unknown): string {
	let res = ''
	// 判断是否为 string，如果是 string 就不需要专门处理
	if (isString(value)) {
		res = value
	}
	// 额外的数组增强。官方案例：https://cn.vuejs.org/guide/essentials/class-and-style.html#binding-to-arrays
	else if (isArray(value)) {
		// 循环得到数组中的每个元素，通过 normalizeClass 方法进行迭代处理
		for (let i = 0; i < value.length; i++) {
			const normalized = normalizeClass(value[i])
			if (normalized) {
				res += normalized + ' '
			}
		}
	}
	// 额外的对象增强。官方案例：https://cn.vuejs.org/guide/essentials/class-and-style.html#binding-html-classes
	else if (isObject(value)) {
		// for in 获取到所有的 key，这里的 key（name） 即为 类名。value 为 boolean 值
		for (const name in value as object) {
			// 把 value 当做 boolean 来看，拼接 name
			if ((value as object)[name]) {
				res += name + ' '
			}
		}
	}
	// 去左右空格
	return res.trim()
}
