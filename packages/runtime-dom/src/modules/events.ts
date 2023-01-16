/**
 * 为 event 事件进行打补丁
 */
export function patchEvent(
	el: Element & { _vei?: object },
	rawName: string,
	prevValue,
	nextValue
) {
	// vei = vue event invokers
	const invokers = el._vei || (el._vei = {})
	// 是否存在缓存事件
	const existingInvoker = invokers[rawName]
	// 如果当前事件存在缓存，并且存在新的事件行为，则判定为更新操作。直接更新 invoker 的 value 即可
	if (nextValue && existingInvoker) {
		// patch
		existingInvoker.value = nextValue
	} else {
		// 获取用于 addEventListener || removeEventListener 的事件名
		const name = parseName(rawName)
		if (nextValue) {
			// add
			const invoker = (invokers[rawName] = createInvoker(nextValue))
			el.addEventListener(name, invoker)
		} else if (existingInvoker) {
			// remove
			el.removeEventListener(name, existingInvoker)
			// 删除缓存
			invokers[rawName] = undefined
		}
	}
}

/**
 * 直接返回剔除 on，其余转化为小写的事件名即可
 */
function parseName(name: string) {
	return name.slice(2).toLowerCase()
}

/**
 * 生成 invoker 函数
 */
function createInvoker(initialValue) {
	const invoker = (e: Event) => {
		invoker.value && invoker.value()
	}
	// value 为真实的事件行为
	invoker.value = initialValue
	return invoker
}
