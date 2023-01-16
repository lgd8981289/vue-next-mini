/**
 * 通过 DOM Properties 指定属性
 */
export function patchDOMProp(el: any, key: string, value: any) {
	try {
		el[key] = value
	} catch (e: any) {}
}
