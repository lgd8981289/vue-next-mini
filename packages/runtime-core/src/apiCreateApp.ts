import { createVNode } from './vnode'

/**
 * 创建 app 实例，这是一个闭包函数
 */
export function createAppAPI<HostElement>(render) {
	return function createApp(rootComponent, rootProps = null) {
		const app = {
			_component: rootComponent,
			_container: null,
			// 挂载方法
			mount(rootContainer: HostElement): any {
				// 直接通过 createVNode 方法构建 vnode
				const vnode = createVNode(rootComponent, rootProps)
				// 通过 render 函数进行挂载
				render(vnode, rootContainer)
			}
		}

		return app
	}
}
