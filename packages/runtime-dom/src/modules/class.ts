/**
 * 为 class 打补丁
 */
export function patchClass(el: Element, value: string | null) {
	if (value == null) {
		el.removeAttribute('class')
	} else {
		el.className = value
	}
}
