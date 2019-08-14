export function addClass(el, className){
    if(hasClass(el, className)) return;
    let newClass = el.className.split(' ');
    newClass.push(className);
    el.className = newClass.join(' ');
}
export function hasClass(el, className){
    let reg = new RegExp('(^|\\s)' + className + '(\\s|$)')
    return reg.test(el.className)
}
//设置或获取html data属性
export function getData(el, name, val){
    const prefix = 'data-';
    let n = prefix + name
    if(val){
        return el.setAttribute(n, val)
    }else{
        return el.getAttribute(n)
    }
}

//获取当前浏览器支持的style
let elementStyle = document.createElement('div').style

let vendor = (()=>{
    let transformNames = {
        webkit: 'webkitTransform',
        Moz: 'MozTransform',
        O: 'OTransform',
        ms: 'msTransform',
        standard: 'transform'
      }

    //遍历当前浏览器支持哪种
    for (let key in transformNames) {
        if (elementStyle[transformNames[key]] !== undefined) {
          return key
        }
      }
    

    //没有就报错返回false
    return false
})()

//浏览器支持的css3样式
export function prefixStyle(style){
    if (vendor === false) {
    return false
  }

  if (vendor === 'standard') {
    return style
  }

  return vendor + style.charAt(0).toUpperCase() + style.substr(1)
}