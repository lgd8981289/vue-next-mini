export const enum ShapeFlags {
	/**
	 * type = Element
	 */
	ELEMENT = 1,
	/**
	 * 函数组件
	 */
	FUNCTIONAL_COMPONENT = 1 << 1,
	/**
	 * 有状态（响应数据）组件
	 */
	STATEFUL_COMPONENT = 1 << 2,
	/**
	 * children = Text
	 */
	TEXT_CHILDREN = 1 << 3,
	/**
	 * children = Array
	 */
	ARRAY_CHILDREN = 1 << 4,
	/**
	 * children = slot
	 */
	SLOTS_CHILDREN = 1 << 5,
	/**
	 * 组件：有状态（响应数据）组件 | 函数组件
	 */
	COMPONENT = ShapeFlags.STATEFUL_COMPONENT | ShapeFlags.FUNCTIONAL_COMPONENT
}
