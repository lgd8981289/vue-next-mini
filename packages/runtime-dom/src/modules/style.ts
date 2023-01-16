import { isString } from '@vue/shared'

/**
 * 为 style 属性进行打补丁
 */
export function patchStyle(el: Element, prev, next) {
	// 获取 style 对象
	const style = (el as HTMLElement).style
	// 判断新的样式是否为纯字符串
	const isCssString = isString(next)
	if (next && !isCssString) {
		// 赋值新样式
		for (const key in next) {
			setStyle(style, key, next[key])
		}
		// 清理旧样式
		if (prev && !isString(prev)) {
			for (const key in prev) {
				if (next[key] == null) {
					setStyle(style, key, '')
				}
			}
		}
	}
}

/**
 * 赋值样式
 */
function setStyle(
	style: CSSStyleDeclaration,
	name: string,
	val: string | string[]
) {
	style[name] = val
}
