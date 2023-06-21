/**
 * @author: 长歌; 
 * @lastEditTime: 2023.06.21 17:00; 
 * @Editorial content: 完成对模板部分的信息提取
 */
const compilerDom = require("@vue/compiler-dom");
const path = require("path");
const fs = require("fs");

interface EmitEvent {
  name: string
}
interface Slot {
  name: string
}

const REGRULE = {
  VARNAMEREG: /^([^\x00-\xff]|[a-zA-Z_$])([^\x00-\xff]|[a-zA-Z0-9_$])*$/,
  EMITREG: /\$emit\([\w\s,'"\$]+\)/g,
};

fs.readFile(
  // path.resolve(__dirname, "../../src/components/Schedule/index.vue"),
  path.resolve(__dirname, "./components/Schedule/e2.vue"),
  "utf-8",
  (err: Error, data: string) => {
    if (err) console.error("文件读取失败！", err);
    try {
      const ts = data.match(/<template[\s\w]*>/);
      const te = data.match(/<\/\s*template>/);
      let templateModuleStr, scriptModuleStr, styleModuleStr;
      const emitEvents: { type: number; name: string }[] = [];
      const slots: any[] = [];
      if (ts && te) {
        templateModuleStr = data.slice(
          (ts.index as number) + ts[0].length,
          te.index
        );
      } else throw Error("查找不到模板");
      // const ss = data.match(/<script[\s\w]*>/);
      // const se = data.match(/<\/\s*script>/);
      // if (ss) {
      //   if (se) {
      //     scriptModuleStr = data.slice(ss.index as number + ss[0].length, se.index)
      //   } else throw Error('查找不到</script>')
      // }
      // const styleStart = data.match(/<script[\s\w]*>/);
      // const styleEnd = data.match(/<\/\s*script>/);
      // if (styleStart) {
      //   if (styleEnd) {
      //     styleModuleStr = data.slice(styleStart.index as number + styleStart[0].length, styleEnd.index)
      //   } else throw Error('查找不到</style>')
      // }
      let parse = compilerDom.parse(templateModuleStr);
      console.log(parse.children[0].props);
      
      (function search(ast: any = parse) {
        ast.children.forEach((e: any, index: number) => {
          /**1标签、2.包含字面量表达式的文本节点、 3.注释与普通文本 */
          if (e.type === 1) {
            // console.log(e);
             /** tagType: 0 原生、 1 组件、 2 slot */
            if (e.tagType === 0 || e.tagType === 2) {
              e.props.forEach((pi: any) => {
                /** type 6. 值类型（class，style，name）、7. 指令 on与bind与for */
                if (pi.type === 7 && pi.name === "on") {
                  /** arg指令后面的参数对象（:与=之间） */
                  /** exp指令后面的内容对象（=后部分） */
                  console.log(pi);
                  if (REGRULE.EMITREG.test(pi.exp.content)) {
                    pi.exp.content.match(REGRULE.EMITREG).forEach((e: any) => {
                      const param = e.match(/(?<=\()[^\)]+/)[0].split(",");
                      if (/^'[^']+'$/.test(param[0])) {
                        if (!emitEvents.some((e) => e.name == param[0])) {
                          emitEvents.push({ type: 1, name: param[0] });
                        }
                      }
                    });
                  }
                }
                if(e.tag === 'slot'){
                  if (pi.type === 6 && pi.name === "name") {
                    /**这个type没想出来是啥，如果为变量的话那就是指令了吧(事实上就是这样，所以这个type慢慢猜吧) */
                    if(pi.value.type === 2){
                      console.log(pi);
                      slots.push({ name: pi.value.content })
                    }
                  }else if(pi.type === 7 && pi.name === 'bind'){
                    if(pi.arg.content === 'name'){
                      console.log(pi);
                    }
                  }
                }
              });
            }
            search(e);
          }
        });
      })();
      console.log(emitEvents);
      console.log(slots);
    } catch (err) {
      throw err;
    }
  }
);
