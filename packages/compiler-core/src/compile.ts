import { extend } from '@vue/shared'
import { generate } from './codegen'
import { baseParse } from './parse'
import { transform } from './transform'
import { transformElement } from './transforms/transformElement'
import { transformText } from './transforms/transformText'
import { transformIf } from './transforms/vIf'

export function baseCompile(template: string, options = {}) {
  /**
   * template.trim() 简单处理两侧空格，比如：
   * template: `
      <div>
        hello world,
          <h1 v-if="isShow">
          {{ msg }}
        </h1>
      </div>
      `
   */
  const ast = baseParse(template.trim())

  transform(
    ast,
    extend(options, {
      nodeTransforms: [transformElement, transformText, transformIf]
    })
  )
  console.log(ast)

  return generate(ast)
}
