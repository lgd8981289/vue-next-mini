import { NodeTypes } from './ast'

/**
 * 单个元素的根节点
 */
export function isSingleElementRoot(root, child) {
	const { children } = root
	return children.length === 1 && child.type === NodeTypes.ELEMENT
}
