// 创建 socket.io 客户端连接
const socket = io('http://127.0.0.1:8080');
socket.on();


// 点击按钮时进行数据的提交(提交到服务器进行插入数据表操作)
$('#button').click(() => {
    // 先对数据进行判断是否符合格式，当 flag == 1 时再将数据传递给服务器，否则不传输(当用户输入内容后再进行判断)
    let flag = 1;

    // 在判断条件中加入对 flag 的判断是为了让每次只有一个提示框弹出(用户体验)
    // 判断昵称的规则符合性
    if ($('#user').val() !== '' && flag) {
        // 允许用户输入大小写字母及数字汉字和下划线_, 2-20个字符
        let reg = /^[0-9a-zA-Z\u4E00-\u9FA5\_]{2,20}$/;
        // 返回 true 证明输入成功, 返回 false 证明输入失败
        if (!(reg.test($('#user').val()))) {
            flag = 0;
            alert('请输入正确格式的昵称：大小写字母数字汉字及 _ ,长度2到20个字符！')
        } else if (flag == 1){
            socket.emit('selectName', $('#user').val());
            socket.on('selectNameRes', data => {
                if (data !== 0) {
                    alert('昵称已存在！');
                    flag = 0;
                };
            });
        }
    };

    // 判断第一次输入的密码是否符合规范
    if ($('#pwd1').val() !== '' && flag) {
        // 允许用户输入大小写字母及数字，_ ! 特殊字符，7-20位
        let reg = /^[0-9a-zA-Z\!\_]{7,20}$/;
        if (!(reg.test($('#pwd1').val()))) {
            flag = 0;
            alert('请输入正确格式的密码：大小写字母数字及 _ !(英文感叹号),长度7到20个字符！');
        };
    };

    // 判断第二次输入的密码是否和第一次相同
    if ($('#pwd2').val() !== '' && flag) {
        if($('#pwd2').val() !== $('#pwd1').val()) {
            flag = 0;
            alert('和第一次输入的密码不一致！');
        }
    };

    // 判断出生日期是否满足规范
    if ($('#age').val() !== '' && flag) {
        // 记录当前的日期
        const time = new Date();
        const year = time.getFullYear();
        let month = time.getMonth() + 1;
        // 月份补零操作
        month = month > 9 ? month : '0' + month;
        const yearBefore = year - 100;     // 经过试验，存在一些性能问题，能明显感受到1~2秒的时差，通过demo.js 得到
        const userDateYear = $('#age').val().slice(0, 4);  // 提取出年份
        const userDateMonth = $('#age').val().slice(5, 7);   // 提取出月份
        // 只允许选定的日期在：当前时间往前 100 年内,如：1022/10-2022/10
        if ((userDateYear > year) || (userDateYear == year && userDateMonth >= month) || (userDateYear < yearBefore) || (userDateYear == yearBefore && userDateMonth < month)) {
            flag = 0;
            alert(`所选日期有误，请选择${yearBefore}/${month}-${year}/${month}之间的日期！`);
        }
    };


    // 判断电话号码的规则符合性
    if ($('#tel').val() !== '' && flag) {
        // 1.判断手机号码是否为 11 位
        // 2.判断手机号码是否是以 1 开头，第二位 >= 3
        let reg = /^1[3-9][0-9]{9}$/;
        if (!(reg.test($('#tel').val()))) {
            flag = 0;
            alert('请输入正确格式的电话号码：包含11位数字,以1开头,第二位为3-9！')
        } else if (flag == 1) {
            socket.emit('selectTel', $('#tel').val());
            socket.on('selectTelRes', data => {
                if (data !== 0) {
                    alert('该电话号码已经绑定过账户了！');
                    flag = 0;
                };
            });
        }
    };

    // 判断电子邮件格式是否正确
    if ($('#email').val() !== '' && flag) {
        let reg = /^\w+([-+.]\w+)*@\w+([-.]\w+)*\.\w+([-.]\w+)*$/;
        if (!(reg.test($('#email').val()))) {
            flag = 0;
            alert('电子邮件格式不正确,请重新输入！')
        }
    };

    let msgOver = $('#user').val() == '' || $('#pwd1').val() == '' || $('#pwd2').val() == '' || $('#age').val() == '' || $('#tel').val() == '' || $('#email').val() == '';
    // 检查信息是否填写完整
    if (msgOver && flag) {
        flag = 0;
        alert('请填写完整的注册信息！');
    };

    // 判断是否勾选了协议框(同时判断 flag 的值，如果为 0，说明信息未填写完整，不再弹出输出框提示用户未勾选)
    if (!($('#box1').prop('checked')) && flag) {
        alert('请勾选聊天室协议！');
        flag = 0;
    };

    // 表单数据经过了验证，符合传输条件
    if (flag) {
        socket.emit('sign', {
            username: $('#user').val(),
            password: $('#pwd1').val(),
            gender: $('#gender').val(),
            age: $('#age').val(),
            telephone: $('#tel').val(),
            email: $('#email').val()
        });
        alert('注册成功！请回退至登录页面进行登录！');
    }
    console.log($('#user').val(), $('#pwd1').val(), $('#gender').val(), $('#age').val(), $('#tel').val(), $('#email').val());
});