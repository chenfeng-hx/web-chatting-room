// 一些程序写法的尝试

// 正则表达式创建
// let reg = /^[0-9a-zA-Z\u4E00-\u9FA5\_]{0,20}/;
// // let reg = /(^[\u4E00-\u9FA5])/;
// let str = '你好啊';
// console.log(str.length);
// console.log(reg.test(str))

// const time = new Date();
// const year = time.getFullYear();
// console.log(year > '2025');
// console.log('02' > '03');
// console.log(time.getMonth() + 1);
// console.log(time.getMonth() + 1 > '2');
// console.log(year - 10);    //经过试验，存在一些性能问题，能明显感受到2—3秒的时差
// console.log('2022 03'.length);
// console.log('2022 03'.slice(0, 4));

// userDateYear < year
// userDateYear == year && userDateMonth < month
// userDateYear > yearBefore
// userDateYear == yearBefore && userDateMonth > month

// console.log(userDateYear < year)
// console.log(userDateYear == year && userDateMonth < month)
// console.log(userDateYear > yearBefore)
// console.log(userDateYear == yearBefore && userDateMonth > month)

users = [{username: '张三', parse: '1'}];
const nh = users.find(item => item.username === '张三')
console.log(nh)