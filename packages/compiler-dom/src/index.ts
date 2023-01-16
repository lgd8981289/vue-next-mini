import { baseCompile } from 'packages/compiler-core/src/compile'

export function compile(template: string, options) {
	return baseCompile(template, options)
}
