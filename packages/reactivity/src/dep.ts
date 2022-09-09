import { ReactiveEffect } from './effect'

export type Dep = Set<ReactiveEffect>

/**
 * 依据 effects 生成 dep 实例
 */
export const createDep = (effects?: ReactiveEffect[]): Dep => {
	const dep = new Set<ReactiveEffect>(effects) as Dep
	return dep
}
