const doc = document

export const nodeOps = {
	/**
	 * 插入指定元素到指定位置
	 */
	insert: (child, parent, anchor) => {
		parent.insertBefore(child, anchor || null)
	},

	/**
	 * 创建指定 Element
	 */
	createElement: (tag): Element => {
		const el = doc.createElement(tag)

		return el
	},

	/**
	 * 为指定的 element 设置 textContent
	 */
	setElementText: (el, text) => {
		el.textContent = text
	},

	/**
	 * 删除指定元素
	 */
	remove: (child) => {
		const parent = child.parentNode
		if (parent) {
			parent.removeChild(child)
		}
	},

	/**
	 * 创建 Text 节点
	 */
	createText: (text) => doc.createTextNode(text),

	/**
	 * 设置 text
	 */
	setText: (node, text) => {
		node.nodeValue = text
	},

	/**
	 * 创建 Comment 节点
	 */
	createComment: (text) => doc.createComment(text)
}
