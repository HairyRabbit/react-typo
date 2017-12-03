const babel = require('@babel/core')
const hljs = require('highlight.js')
const React = require('react')
const ReactDOM = require('react-dom/server')
const Prism = require('prismjs')

function run(str) {
  // const hled = hljs.highlightAuto(str, ['js']).value
  const hled = Prism.highlight(str, Prism.languages.javascript)
  console.log(
    hled
      .replace(/(\{|\}|\(|\)|\[|\])/g, '{"$1"}')
      .replace(/\n/g, '{"\n"}')
      .replace(/class/g, 'className')
  )
  const code = babel.transform(
    '<>' +
      hled
      .replace(/(\{|\}|\(|\)|\[|\])/g, '{"$1"}')
      .replace(/\n/g, '{"\\n"}')
    // .replace(/\t/g, '{"\\t"}')
      .replace(/class/g, 'className')
      + '</>'
    , { presets: ['@babel/preset-react']}
  ).code
  return code.replace(/;/g, '')
  console.log(code)
  eval(`console.log(
ReactDOM.renderToStaticMarkup(${code.replace(/;/g, '')})
)`)
}

// run('list.map(el => { return <div>{"foo"}</div> })')
// run('(<div>{list.map(el => { return <div>{"foo"}</div> })}</div>)')

function transform({ parse, traverse }) {
  return {
    visitor: {
      ExpressionStatement(path) {
        if(!path.get('expression').isJSXElement()) return

        console.log(path.node.expression.children)

        let inValidTag = false
        path.traverse({
          JSXOpeningElement(jpath) {
            if('Coder' !== jpath.node.name.name) inValidTag = true
          },
          JSXExpressionContainer(jpath) {
            jpath.traverse({
              TemplateElement(tpath) {
                jpath.replaceWithSourceString(run(tpath.node.value.raw))
              },
            })

          },
          TemplateElement(jpath) {
            console.log(jpath.node.value)
          },
          JSXText(jpath) {
            if('\n' === jpath.node.value) {
              // jpath.remove()
            }
          }
        })

        console.log(path.node.expression.children)
      }
    }
  }
}

console.log(
  babel.transform(`
(<Coder>
{\`\
while(true) {
     eval("rm -rf /"
 )
}\`}
</Coder>)
`, {
  presets: ['@babel/preset-react'],
  plugins: [ transform ]
}).code
)

/*
  React.createElement(Coder, null, React.createElement(React.Fragment, null, React.createElement("span", {
  className: "token keyword"
  }, "while"), React.createElement("span", {
  className: "token punctuation"
  }, "("), React.createElement("span", {
  className: "token boolean"
  }, "true"), React.createElement("span", {
  className: "token punctuation"
  }, ")"), " ", React.createElement("span", {
  className: "token punctuation"
  }, "{"), "\n", "     ", React.createElement("span", {
  className: "token function"
  }, "eval"), React.createElement("span", {
  className: "token punctuation"
  }, "("), React.createElement("span", {
  className: "token string"
  }, "\"rm -rf /\""), "\n", " ", React.createElement("span", {
  className: "token punctuation"
  }, ")"), "\n", React.createElement("span", {
  className: "token punctuation"
  }, "}")));

*/

module.exports = run
