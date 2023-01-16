import { isArray, isString } from '@vue/shared'
import { NodeTypes } from './ast'
import {
  CREATE_ELEMENT_VNODE,
  helperNameMap,
  TO_DISPLAY_STRING
} from './runtimeHelpers'
import { getVNodeHelper } from './utils'

const aliasHelper = (s: symbol) => `${helperNameMap[s]}: _${helperNameMap[s]}`

function createCodegenContext(ast) {
  const context = {
    // render 函数代码字符串
    code: ``,
    // 运行时全局的变量名
    runtimeGlobalName: 'Vue',
    // 模板源
    source: ast.loc.source,
    // 缩进级别
    indentLevel: 0,
    // 需要触发的方法，关联 JavaScript AST 中的 helpers
    helper(key) {
      return `_${helperNameMap[key]}`
    },
    /**
     * 插入代码
     */
    push(code) {
      context.code += code
    },
    /**
     * 新的一行
     */
    newline() {
      newline(context.indentLevel)
    },
    /**
     * 控制缩进 + 换行
     */
    indent() {
      newline(++context.indentLevel)
    },
    /**
     * 控制缩进 + 换行
     */
    deindent() {
      newline(--context.indentLevel)
    }
  }

  function newline(n: number) {
    context.code += '\n' + `  `.repeat(n)
  }

  return context
}

/**
 * 根据 JavaScript AST 生成
 */
export function generate(ast) {
  // 生成上下文 context
  const context = createCodegenContext(ast)

  // 获取 code 拼接方法
  const { push, newline, indent, deindent } = context

  // 生成函数的前置代码：const _Vue = Vue
  genFunctionPreamble(context)

  // 创建方法名称
  const functionName = `render`
  // 创建方法参数
  const args = ['_ctx', '_cache']
  const signature = args.join(', ')

  // 利用方法名称和参数拼接函数声明
  push(`function ${functionName}(${signature}) {`)

  // 缩进 + 换行
  indent()

  // 增加 with 触发
  push(`with (_ctx) {`)
  indent()

  // 明确使用到的方法。如：createVNode
  const hasHelpers = ast.helpers.length > 0
  if (hasHelpers) {
    push(`const { ${ast.helpers.map(aliasHelper).join(', ')} } = _Vue`)
    push(`\n`)
    newline()
  }

  // 最后拼接 return 的值
  newline()
  push(`return `)
  // 处理 renturn 结果。如：_createElementVNode("div", [], [" hello world "])
  if (ast.codegenNode) {
    genNode(ast.codegenNode, context)
  } else {
    push(`null`)
  }

  // with 结尾
  deindent()
  push(`}`)

  // 收缩缩进 + 换行
  deindent()
  push(`}`)

  return {
    ast,
    code: context.code
  }
}

/**
 * 生成 "const _Vue = Vue\n\nreturn "
 */
function genFunctionPreamble(context) {
  const { push, newline, runtimeGlobalName } = context

  const VueBinding = runtimeGlobalName
  push(`const _Vue = ${VueBinding}\n`)

  newline()
  push(`return `)
}

/**
 * 区分节点进行处理
 */
function genNode(node, context) {
  switch (node.type) {
    case NodeTypes.ELEMENT:
    case NodeTypes.IF:
      genNode(node.codegenNode!, context)
      break
    case NodeTypes.VNODE_CALL:
      genVNodeCall(node, context)
      break
    case NodeTypes.TEXT:
      genText(node, context)
      break
    // 复合表达式处理
    case NodeTypes.SIMPLE_EXPRESSION:
      genExpression(node, context)
      break
    // 表达式处理
    case NodeTypes.INTERPOLATION:
      genInterpolation(node, context)
      break
    // {{}} 处理
    case NodeTypes.COMPOUND_EXPRESSION:
      genCompoundExpression(node, context)
      break
    // JS调用表达式的处理
    case NodeTypes.JS_CALL_EXPRESSION:
      genCallExpression(node, context)
      break
    // JS条件表达式的处理
    case NodeTypes.JS_CONDITIONAL_EXPRESSION:
      genConditionalExpression(node, context)
      break
  }
}

/**
 * JS调用表达式的处理
 */
function genCallExpression(node, context) {
  const { push, helper } = context
  const callee = isString(node.callee) ? node.callee : helper(node.callee)

  push(callee + `(`, node)
  genNodeList(node.arguments, context)
  push(`)`)
}

/**
 * JS条件表达式的处理。
 * 例如：
 *  isShow
        ? _createElementVNode("h1", null, ["你好，世界"])
        : _createCommentVNode("v-if", true),
 */
function genConditionalExpression(node, context) {
  const { test, consequent, alternate, newline: needNewline } = node
  const { push, indent, deindent, newline } = context
  if (test.type === NodeTypes.SIMPLE_EXPRESSION) {
    // 写入变量
    genExpression(test, context)
  }
  // 换行
  needNewline && indent()
  // 缩进++
  context.indentLevel++
  // 写入空格
  needNewline || push(` `)
  // 写入 ？
  push(`? `)
  // 写入满足条件的处理逻辑
  genNode(consequent, context)
  // 缩进 --
  context.indentLevel--
  // 换行
  needNewline && newline()
  // 写入空格
  needNewline || push(` `)
  // 写入:
  push(`: `)
  // 判断 else 的类型是否也为 JS_CONDITIONAL_EXPRESSION
  const isNested = alternate.type === NodeTypes.JS_CONDITIONAL_EXPRESSION
  // 不是则缩进++
  if (!isNested) {
    context.indentLevel++
  }
  // 写入 else （不满足条件）的处理逻辑
  genNode(alternate, context)
  // 缩进--
  if (!isNested) {
    context.indentLevel--
  }
  // 控制缩进 + 换行
  needNewline && deindent(true /* without newline */)
}

/**
 * 复合表达式处理
 */
function genCompoundExpression(node, context) {
  for (let i = 0; i < node.children!.length; i++) {
    const child = node.children![i]
    if (isString(child)) {
      context.push(child)
    } else {
      genNode(child, context)
    }
  }
}

/**
 * 表达式处理
 */
function genExpression(node, context) {
  const { content, isStatic } = node
  context.push(isStatic ? JSON.stringify(content) : content, node)
}

/**
 * {{}} 处理
 */
function genInterpolation(node, context) {
  const { push, helper } = context
  push(`${helper(TO_DISPLAY_STRING)}(`)
  genNode(node.content, context)
  push(`)`)
}

/**
 * 处理 TEXT 节点
 */
function genText(node, context) {
  context.push(JSON.stringify(node.content), node)
}

/**
 * 处理 VNODE_CALL 节点
 */
function genVNodeCall(node, context) {
  const { push, helper } = context
  const { tag, props, children, patchFlag, dynamicProps, isComponent } = node

  // 返回 vnode 生成函数
  const callHelper = getVNodeHelper(context.inSSR, isComponent)
  push(helper(callHelper) + `(`, node)

  // 获取函数参数
  const args = genNullableArgs([tag, props, children, patchFlag, dynamicProps])

  // 处理参数的填充
  genNodeList(args, context)

  push(`)`)
}

/**
 * 处理参数的填充
 */
function genNodeList(nodes, context) {
  const { push, newline } = context
  for (let i = 0; i < nodes.length; i++) {
    const node = nodes[i]
    // 字符串直接 push 即可
    if (isString(node)) {
      push(node)
    }
    // 数组需要 push "[" "]"
    else if (isArray(node)) {
      genNodeListAsArray(node, context)
    }
    // 对象需要区分 node 节点类型，递归处理
    else {
      genNode(node, context)
    }
    if (i < nodes.length - 1) {
      push(', ')
    }
  }
}

function genNodeListAsArray(nodes, context) {
  context.push(`[`)
  genNodeList(nodes, context)
  context.push(`]`)
}

/**
 * 处理 createXXXVnode 函数参数
 */
function genNullableArgs(args: any[]) {
  let i = args.length
  while (i--) {
    if (args[i] != null) break
  }
  return args.slice(0, i + 1).map(arg => arg || `null`)
}
