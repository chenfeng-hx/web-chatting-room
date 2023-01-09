// 前端网页与服务器端在同域中提供服务，直接导入即可
const socket = io('http://127.0.0.1:8080');
socket.on('connect', () => {
    console.log('客户端连接成功！');
});

// 定义用户名和头像并存储用于向其他用户发送消息时使用
var username = "";
var hdImg = "";
var toName = '群聊';

// 点击按钮发送数据
$('#submit').click(() => {
    // 先对输入的数据进行判断，是否满足格式要求，满足则发送服务端，否则重新输入
    let flag = 1;
    // 对用户名进行判断
    if ($('#username').val() === '' && flag) {
        alert('请输入用户名！');
        flag = 0;
    } else if (flag) {
        let reg = /^[0-9a-zA-Z\u4E00-\u9FA5\_]{2,20}$/;
        if (!(reg.test($('#username').val()))) {
            flag = 0;
            alert('请输入正确格式的昵称：大小写字母数字汉字及 _ ,长度2到20个字符！');
        } else if (flag && $('#username').val() === '群聊') {
            flag = 0;
            alert('用户名已存在！')
        }
    };

    // 对密码进行判断
    if ($('#password').val() === '' && flag) {
        alert('请输入密码！');
        flag = 0;
    } else if (flag) {
        let reg = /^[0-9a-zA-Z\!\_]{7,20}$/;
        if (!(reg.test($('#password').val()))) {
            flag = 0;
            alert('请输入正确格式的密码：大小写字母数字及 _ !(英文感叹号),长度7到20个字符！');
        };
    };

    // 格式验证正确，向服务器发送数据
    if (flag) {
        socket.emit('login', {
            username: $('#username').val(),
            password: $('#password').val(),
            hdImg: ""
        });
    };
});

// 注册事件，接收服务端返回的登录状态信息
socket.on('loginResults', data => {
    if (data.userLogin !== 0 && !data.status) {
        // 排除返回值为空的场景
        alert('登陆成功！');
        // 存储登录的用户名,登录状态
        username = data.username;
        // 登录盒子隐藏，头像选择盒子淡入
        $('.container_login').hide();
        $('.head_profile_select').fadeIn();
    } else if (data.userLogin !== 0 && data.status) {
        alert('您的账户已在线！');
    } else {
        alert('用户名或密码输入错误！');
        // location.reload();
    }
});

// 发出找回密码的请求找回密码
$('#forgetPwd').click(() => {
    let telString = prompt('请输入您的电话号码用来找回密码！').trim();
    // 对输入的内容进行格式匹配，满足则发送服务器查询，否则重新输入
    let reg = /^1[3-9][0-9]{9}$/;
    if (telString === '') {
        alert('请输入您的电话号码！');
    } else if (!(reg.test(telString))) {
        alert('您输入号码的格式不正确！');
    } else {
        socket.emit('forgetPwdReq', telString);
    }
});
// 接收找回密码请求的服务端响应
socket.on('forgetPwdRes', data => {
    if (data) {
        alert('您的密码是：' + data + '\n请妥善保管您的密码！');
    } else {
        alert('您输入的电话号码不存在！请重新输入！');
    }
});

// 为选定的头像绑定选定样式事件
$('.head_profile_select li').on('click', function () {
    $(this).addClass('selecting').siblings().removeClass('selecting');
});

// 记录选择的头像并发送给服务端进行存储
$('#hdImgBtn').click(() => {
    let imgPath = $('li.selecting img').attr('src');
    hdImg = imgPath;
    socket.emit('hdImgSelect', imgPath);
    $('.head_profile_select').hide();
    $('.container').fadeIn();
    $('.user-list .header img').attr('src', hdImg);
    $('.user-list .header .username').text(username);
});

// 注册事件，当有用户上线时进行全局广播,让所有用户知道
socket.on('addUser', data => {
    // 添加一条系统消息
    $('.box-bd').append(`
        <div class="system">
            <p class="message_system">
            <span class="content">${data} 上线了</span>
            </p>
        </div>
    `);
    scrollIntoView();
})

// 注册事件获取聊天室总人数
socket.on('userList', data => {
    $('.user-list ul').html('')
    $('.user-list ul').append(`
        <li class="user">
            <div class="avatar"><img src="imgs/群聊.jpg" alt=""></div>
            <div class="name">群聊(<span id="userCount">3</span>)</div>
        </li>
    `);
    data.forEach(item => {
        $('.user-list ul').append(`
        <li class="user">
            <div class="avatar"><img src="${item.hdImg}" alt=""></div>
            <div class="name">${item.username}</div>
        </li>
        `);
    });
    $('#userCount').text(data.length);
    clickUser();
});

// 监听用户离开的消息，进行全局广播
socket.on('userLeave', data => {
    // 添加一条系统消息
    if (data.username !== undefined) {
        $('.box-bd').append(`
        <div class="system leave">
            <p class="message_system">
                <span class="content">${data.username} 下线了</span>
            </p>
        </div>
    `);
    };
    scrollIntoView();
})

// 点击用户事件绑定
function clickUser() {
    $('.user').on('click', function () {
        $(this).addClass('active').siblings().removeClass('active');
        var to = $(this).children('.name').html();
        $('#chatName').html(to);
        toName = to;
    })
}

// 注册受到信息事件，对不同的用户发送的信息进行相应的处理
socket.on('receiveMessage', data => {
    console.log('收到了一条消息', data);
    if (data.toName === '群聊') {
        if (username === data.username) {
            // 自己的消息
            $('.box-bd').append(`
                <div class="message-box">
                    <div class="my message">
                        <img src="${data.hdImg}" alt="" class="avatar">
                        <div class="content">
                            <div class="bubble">
                                <div class="bubble_cont">${data.msg}</div>
                            </div>
                        </div>
                    </div>
                </div>
            `);
        } else {
            // 别人的消息
            $('.box-bd').append(`
                <div class="message-box">
                    <div class="other message">
                        <img src="${data.hdImg}" alt="" class="avatar">
                        <div class="nickname">${data.username}</div>
                        <div class="content">
                            <div class="bubble">
                                <div class="bubble_cont">${data.msg}</div>
                            </div>
                        </div>
                    </div>
                </div>
            `);
        }
    } else {
        if (username === data.username) {
            // 自己的消息
            $('.box-bd').append(`
                <div class="message-box">
                    <div class="my message">
                        <img src="${data.hdImg}" alt="" class="avatar">
                        <div class="content">
                            <div class="bubble">
                                <div class="bubble_cont">${data.msg}</div>
                                <div class="bubble_toName">私聊</div>
                            </div>
                        </div>
                    </div>
                </div>
            `);
        } else {
            // 别人的消息
            $('.box-bd').append(`
                <div class="message-box">
                    <div class="other message">
                        <img src="${data.hdImg}" alt="" class="avatar">
                        <div class="nickname">${data.username}</div>
                        <div class="content">
                            <div class="bubble">
                                <div class="bubble_cont">${data.msg}</div>
                                <div class="bubble_toName">私聊</div>
                            </div>
                        </div>
                    </div>
                </div>
            `);
        }
    }
    scrollIntoView();
})

// 发送图片功能
$('#file').on('change', function () {
    var file = this.files[0];
    // // 需要把这个图片发送到服务器，借助于H5新增的fileReader
    // 将文件读成base64的编码格式
    var fr = new window.FileReader();
    fr.readAsDataURL(file);
    fr.onload = function () {
        socket.emit('sendImage', {
            username,
            hdImg,
            img: fr.result,
            toName
        });
    };
});

// 监听接收图片消息
socket.on('receiveImage', data => {
    if (username === data.username) {
        // 自己的消息
        $('.box-bd').append(`
            <div class="message-box">
                <div class="my message">
                    <img src="${data.hdImg}" alt="" class="avatar">
                    <div class="content">
                        <div class="bubble">
                            <div class="bubble_cont">
                                <img src="${data.img}">
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `);
    } else {
        // 别人的消息
        $('.box-bd').append(`
            <div class="message-box">
                <div class="other message">
                    <img src="${data.hdImg}" alt="" class="avatar">
                    <div class="nickname">${data.username}</div>
                    <div class="content">
                        <div class="bubble">
                            <div class="bubble_cont">
                                <img src="${data.img}">
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `);
    };
    // 等待图片加载完成后再进行滚动，否则会出现滚动不完全的效果
    $('.box-bd img:last').on('load', function () {
        scrollIntoView();
    });
});

// 用户私聊
$('#btn-send').on('click', () => {
    var content = $('#content').html().trim()
    $('#content').html('')
    if (!content) {
        return window.alert('不能输入全空白字符！请重新输入内容')
    }
    if (toName === '群聊') {
        // 发送消息给服务器
        socket.emit('sendMessage', {
            msg: content,
            username,
            hdImg,
            toName
        })
    } else {
        // 发送私聊消息给服务器
        socket.emit('sendMessageToOne', {
            msg: content,
            username,
            hdImg,
            toName: toName
        })
    }
})

// 点击用户事件绑定
function clickUser() {
    $('.user').on('click', function () {
        $(this).addClass('active').siblings().removeClass('active')
        var to = $(this).children('.name').text()
        $('#chatName').text(to)
        toName = to
    })
}


// 当有消息时，将滑动到底部(滚动条效果)
function scrollIntoView() {
    // 当前元素的底部滚动到可视区
    $('.box-bd').children(':last').get(0).scrollIntoView(false);
};

// 初始化jquery-emoji插件
$('.face').on('click', function () {
    $('#content').emoji({
        button: '.face',
        showTab: false,
        animation: 'slide',
        position: 'topRight',
        icons: [{
            name: 'QQ表情',
            path: '../jQuery-emoji/src/img/qq/',
            maxNum: 91,
            excludeNums: [41, 45, 54],
            file: '.gif'
        }, {
            name: "贴吧表情",
            path: "../jQuery-emoji/src/img/tieba/",
            maxNum: 50,
            file: ".",
            placeholder: ":{alias}:",
            alias: {
                1: "hehe",
                2: "haha",
                3: "tushe",
                4: "a",
                5: "ku",
                6: "lu",
                7: "kaixin",
                8: "han",
                9: "lei",
                10: "heixian",
                11: "bishi",
                12: "bugaoxing",
                13: "zhenbang",
                14: "qian",
                15: "yiwen",
                16: "yinxian",
                17: "tu",
                18: "yi",
                19: "weiqu",
                20: "huaxin",
                21: "hu",
                22: "xiaonian",
                23: "neng",
                24: "taikaixin",
                25: "huaji",
                26: "mianqiang",
                27: "kuanghan",
                28: "guai",
                29: "shuijiao",
                30: "jinku",
                31: "shengqi",
                32: "jinya",
                33: "pen",
                34: "aixin",
                35: "xinsui",
                36: "meigui",
                37: "liwu",
                38: "caihong",
                39: "xxyl",
                40: "taiyang",
                41: "qianbi",
                42: "dnegpao",
                43: "chabei",
                44: "dangao",
                45: "yinyue",
                46: "haha2",
                47: "shenli",
                48: "damuzhi",
                49: "ruo",
                50: "OK"
            },
            title: {
                1: "呵呵",
                2: "哈哈",
                3: "吐舌",
                4: "啊",
                5: "酷",
                6: "怒",
                7: "开心",
                8: "汗",
                9: "泪",
                10: "黑线",
                11: "鄙视",
                12: "不高兴",
                13: "真棒",
                14: "钱",
                15: "疑问",
                16: "阴脸",
                17: "吐",
                18: "咦",
                19: "委屈",
                20: "花心",
                21: "呼~",
                22: "笑脸",
                23: "冷",
                24: "太开心",
                25: "滑稽",
                26: "勉强",
                27: "狂汗",
                28: "乖",
                29: "睡觉",
                30: "惊哭",
                31: "生气",
                32: "惊讶",
                33: "喷",
                34: "爱心",
                35: "心碎",
                36: "玫瑰",
                37: "礼物",
                38: "彩虹",
                39: "星星月亮",
                40: "太阳",
                41: "钱币",
                42: "灯泡",
                43: "茶杯",
                44: "蛋糕",
                45: "音乐",
                46: "haha",
                47: "胜利",
                48: "大拇指",
                49: "弱",
                50: "OK"
            }
        }, {
            name: "emoji高清",
            path: "../jQuery-emoji/src/img/emoji/",
            maxNum: 84,
            file: ".png",
            placeholder: "#emoji_{alias}#"
        }]
    })
});

// 鼠标动画
// var img = document.querySelector('#mousem');
// var imgHeight = img.height;
// var imgWidth = img.width;
// document.addEventListener('mousemove', function(event) {
//     // 左上角对齐
//     // img.style.top = event.clientY + 'px';
//     // img.style.left = event.clientX + 'px';
//     // 更改到居中
//     x = event.clientX;
//     y = event.clientY;
//     img.style.left = x - (imgWidth / 2) + 'px';
//     img.style.top  = y - (imgHeight / 2) + 'px';
// })

