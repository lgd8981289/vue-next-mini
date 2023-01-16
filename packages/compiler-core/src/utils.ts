import { isString } from '@vue/shared'
import { NodeTypes } from './ast'
import { CREATE_ELEMENT_VNODE, CREATE_VNODE } from './runtimeHelpers'
import { TransformContext } from './transform'

export function isText(node) {
	return node.type === NodeTypes.INTERPOLATION || node.type === NodeTypes.TEXT
}

/**
 * 返回 vnode 生成函数
 */
export function getVNodeHelper(ssr: boolean, isComponent: boolean) {
	return ssr || isComponent ? CREATE_VNODE : CREATE_ELEMENT_VNODE
}

/**
 * 是否为 v-slot
 */
export function isVSlot(p) {
	return p.type === NodeTypes.DIRECTIVE && p.name === 'slot'
}

/**
 * 返回 vnode 节点
 */
export function getMemoedVNodeCall(node) {
	return node
}

/**
 * 创建对象表达式节点
 */
export function createObjectExpression(properties) {
	return {
		type: NodeTypes.JS_OBJECT_EXPRESSION,
		loc: {},
		properties
	}
}

/**
 * 填充 props
 */
export function injectProp(node, prop) {
	let propsWithInjection
	let props =
		node.type === NodeTypes.VNODE_CALL ? node.props : node.arguments[2]

	if (props == null || isString(props)) {
		propsWithInjection = createObjectExpression([prop])
	}
	if (node.type === NodeTypes.VNODE_CALL) {
		node.props = propsWithInjection
	}
}
