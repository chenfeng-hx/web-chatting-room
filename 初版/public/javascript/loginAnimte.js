// 定义一个anime对象
var an=null;
// 绑定账号输入框的点击事件
document.querySelector('#username').addEventListener('click',function(){
    if(an){
        // 如果已存在anime动画,先暂停正在运行的动画
        an.pause();
    }
    // 构造一个动画对象
    an=anime({
        targets:'path',
        strokeDashoffset:{
            value:0,
            duration:700,
            easing:'easeOutQuart'
        },
        strokeDasharray:{
            value:'240 1386',
            duration:700,
            easing:'easeOutQuart'
        }
    });
});
// 绑定密码输入框的点击事件
document.querySelector('#password').addEventListener('click',function(){
    if(an){
        // 如果已存在anime动画,先暂停正在运行的动画
        an.pause();
    }
    // 构造一个动画对象
    an=anime({
        targets:'path',
        strokeDashoffset:{
            value:-336,
            duration:700,
            easing:'easeOutQuart'
        },
        strokeDasharray:{
            value:'240 1386',
            duration:700,
            easing:'easeOutQuart'
        }
    });
});
// 绑定登录按钮的鼠标移入事件
document.querySelector('#submit').addEventListener('mouseover',function(){
    if(an){
        // 如果已存在anime动画,先暂停正在运行的动画
        an.pause();
    }
    // 构造一个动画对象
    an=anime({
        targets:'path',
        strokeDashoffset:{
            value:-730,
            duration:700,
            easing:'easeOutQuart'
        },
        strokeDasharray:{
            value:'530 1386',
            duration:700,
            easing:'easeOutQuart'
        }
    });
});
// 优化一下,输入框和登录按钮获取焦点也给动画
// 绑定账号输入框的获取焦点事件
document.querySelector('#username').addEventListener('focus',function(){
    if(an){
        // 如果已存在anime动画,先暂停正在运行的动画
        an.pause();
    }
    // 构造一个动画对象
    an=anime({
        targets:'path',
        strokeDashoffset:{
            value:0,
            duration:700,
            easing:'easeOutQuart'
        },
        strokeDasharray:{
            value:'240 1386',
            duration:700,
            easing:'easeOutQuart'
        }
    });
});
// 绑定密码输入框的获取焦点事件
document.querySelector('#password').addEventListener('focus',function(){
    if(an){
        // 如果已存在anime动画,先暂停正在运行的动画
        an.pause();
    }
    // 构造一个动画对象
    an=anime({
        targets:'path',
        strokeDashoffset:{
            value:-336,
            duration:700,
            easing:'easeOutQuart'
        },
        strokeDasharray:{
            value:'240 1386',
            duration:700,
            easing:'easeOutQuart'
        }
    });
});
// 绑定登录按钮的获取焦点事件
document.querySelector('#submit').addEventListener('focus',function(){
    if(an){
        // 如果已存在anime动画,先暂停正在运行的动画
        an.pause();
    }
    // 构造一个动画对象
    an=anime({
        targets:'path',
        strokeDashoffset:{
            value:-730,
            duration:700,
            easing:'easeOutQuart'
        },
        strokeDasharray:{
            value:'530 1386',
            duration:700,
            easing:'easeOutQuart'
        }
    });
});

// // 切换动画，改变文字
// var left = document.querySelector('.left');
// var p = left.children[1];
// left.addEventListener('mouseover', function () {
    
//     p.innerHTML = '欢迎光临, 请输入您的基本信息进行账号注册!';
// });
// left.addEventListener('mouseout', function () {
//     p.innerHTML = '欢迎光临, 请输入您的账号和密码进行登录!';
// });

