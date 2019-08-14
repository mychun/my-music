//工具库

function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1) + min)
}

//打乱数组
export function shuffle(arr) {
    let _arr = arr.slice()
    for (let i = 0; i < _arr.length; i++) {
        let j = getRandomInt(0, i)
        let t = _arr[i]
        _arr[i] = _arr[j]
        _arr[j] = t
    }
    return _arr
}

// //预防不断重复触发函数
export function debounce(func, delay) {
    let timer
    return function (...args) {
        console.log(1, timer) //undefined
      if (timer) {
        clearTimeout(timer)
      }
      timer = setTimeout(() => {
        func.apply(this, args)
      }, delay)
    }
  }

  //预防不断重复触发函数
// export function debounce() {
//     console.log(1)
//     return function(){
//         console.log(2)
//         return function(){
//             console.log(3)
//         }
//     }
//   }