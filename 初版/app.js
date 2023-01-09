// 启动 chatting 的服务端程序
// 导入 express 框架并创建一个 server服务器
const app = require('express')();
const server = require('http').Server(app);
const io = require('socket.io')(server);
const { data } = require('jquery');
const mysql = require('mysql');
const path = require('path');

// 定义常量
const PORT = 8080;

// 定义已经登陆的用户，当用户登录后进行加入，防止用户同时登录多次
let users = [];

// 启动服务器
server.listen(PORT, () => {
    console.log(`the server is running in http://127.0.0.1:${PORT}`)
});

// 将 public 目录下的资源设置为静态共享资源
app.use(require('express').static(path.join(__dirname, './public')));


// 当用户打开 http://127.0.0.1:8080 根目录时将网页重定向到 index.html
app.get('/', (req, res) => {
    // 重定向到 index.html 文件
    res.redirect('初版/index.html');
});

// 创建 mysql 数据库连接
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'hxxhzhn625',
    database: 'program_design'
});

let count = 0;

// 每个连接的用户都会有一个 socket对象
io.on('connection', (socket) => {
    console.log(`用户${++count}连接了`);

    // 注册用户登录事件，对用户输入的 username 和 password 进行 SQL 查询，看是否有对应的用户
    socket.on('login', data => {
        // 将用户的用户名和头像存入socket对象中
        socket.username = data.username;
        console.log("socket.username :" + socket.username)
        let sqlToSelect = `SELECT user_id FROM inquire_sign WHERE username = ? and password = ?`;
        let loginData = [data.username, data.password];
        // 先判断用户是否已经登陆过了，登录过了则返回一个对象，否则为空
        let status = users.find(item => item.username === data.username && item.password === data.password);
        db.query(sqlToSelect, loginData, (err, results) => {
            if (err) throw err;
            // 得到的是 [ RowDataPacket { id: 1 } ] 类型，需要进行转换,提取出其中的值
            // 需要先将 JSON 格式的 results 转换为 String 格式，再进行比较
            const userLogin = (JSON.stringify(results) === "[]") ? 0 : results[0].id;
            socket.emit('loginResults', {
                userLogin: userLogin,
                status: status,
                username: data.username
            });

            if (!status) users.push(data);
        });
    });

    // 记录触发该链接服务器事件的用户的头像
    socket.on('hdImgSelect', data => {
        console.log(users)
        socket.hdImg = data;
        console.log("socket.hdImg :" + socket.hdImg)
        users[users.length - 1].hdImg = socket.hdImg;
        while (true) {
            index = users.findIndex(item => item.hdImg === '');
            if (index !== -1) users.splice(index, 1);
            else break;
        }
        console.log(users);
        // 广播所有用户有新用户上线
        io.emit('addUser', users[users.length - 1].username);
        // 广播所有用户聊天室总人数
        io.emit('userList', users);
    });

    // 注册用户注册账户事件，将用户输入的信息插入到 user_info 和 inquire_sign 中
    socket.on('sign', data => {
        console.log(data)
        let sqlToResetId = 'ALTER TABLE user_info AUTO_INCREMENT = 1';
        let sqlToInsert = `INSERT INTO user_info(name, gender, age, telephone, email) VALUES (?, ?, ?, ?, ?)`;
        let signData = [data.username, data.gender, data.age, data.telephone, data.email];
        let sqlToSelectId = `SELECT id FROM user_info WHERE name = '${data.username}'`;
        let sqlToInsertIS = `INSERT INTO inquire_sign VALUES (?, ?, ?)`;
        let id;
        // 先查询序列号，然后在插入时加1，防止主键 id 自增长，删除数据后导致的 id 值不连续
        db.query(sqlToResetId, (err, results) => {
            if (err) throw err;
        });
        // 将数据插入到表 user_info 中
        db.query(sqlToInsert, signData, (err, results) => {
            if (err) throw err;
            if (results.affectedRows === 1) {
                console.log('插入数据成功!');
            }
        });
        // 获取该注册对象在 user_info 中的 id
        db.query(sqlToSelectId, (err, results) => {
            if (err) throw err;
            id = results[0].id;
            // 将数据同步插入到表 inquire_sign 中
            let ISData = [id, data.username, data.password];
            db.query(sqlToInsertIS, ISData, (err, results) => {
                if (err) throw err;
                if (results.affectedRows === 1) {
                    console.log('插入数据inqurie_sign成功!');
                };
            });
        });
    });

    // 查询用户注册的昵称是否已经存在
    socket.on('selectName', data => {
        // ${data}需要添加引号，不然会报错
        let sqlName = `SELECT user_id FROM inquire_sign WHERE username = '${data}'`;
        db.query(sqlName, (err, results) => {
            if (err) throw err;
            const userNameRes = (JSON.stringify(results) === "[]") ? 0 : results[0].id;
            socket.emit('selectNameRes', userNameRes);
        });
    });

    // 查询用户注册的手机号码是否已经存在
    socket.on('selectTel', data => {
        let sqlTel = `SELECT id FROM user_info WHERE telephone = '${data}'`;
        db.query(sqlTel, (err, results) => {
            if (err) throw err;
            const userTelRes = (JSON.stringify(results) === "[]") ? 0 : results[0].id;
            socket.emit('selectTelRes', userTelRes);
        });
    });

    // 注册一个用户找回用户密码事件并监听(需要进行联表查询)
    socket.on('forgetPwdReq', data => {
        let sqlUserId = `SELECT id FROM user_info WHERE telephone = '${data}'`;
        db.query(sqlUserId, (err, results) => {
            if (err) throw err;
            const userIdRes = (JSON.stringify(results) === "[]") ? 0 : results[0].id;
            if (userIdRes === 0) {
                socket.emit('forgetPwdRes', userIdRes);
            } else {
                let sqlPwd = `SELECT password FROM inquire_sign WHERE user_id = ${userIdRes}`;
                db.query(sqlPwd, (err, results) => {
                    if (err) throw err;
                    const userPwdRes = (JSON.stringify(results) === "[]") ? 0 : results[0].password;
                    socket.emit('forgetPwdRes', userPwdRes);
                });
            }
        });
    });

    // 当用户断开连接时，进行全局广播并更新所有用户的用户列表
    socket.on('disconnect', () => {
        // 把当前用户的信息从users中删除
        const index = users.findIndex(item => item.username === socket.username);
        if (index !== -1) users.splice(index, 1);
        // 告诉所有人，有人离开了聊天室
        io.emit('userLeave', {
            username: socket.username,
            hdImg: socket.hdImg
        });
        // 告诉所有人，userlist发生更新
        io.emit('userList', users);
    });

    // 用户发送消息的功能
    socket.on('sendMessage', data => {
        console.log(data);
        // 广播给所有用户
        io.emit('receiveMessage', data);
    });

    // 监听图片聊天信息
    socket.on('sendImage', data => {
        // 广播给所有用户
        if (data.toName === '群聊') {
            io.emit('receiveImage', data);
        } else {
            // 广播给指定用户
            var toSocket = null
            for (const key in io.sockets.sockets) {
                if (io.sockets.sockets[key].username === data.toName) {
                    toSocket = key;
                    break;
                };
            };
            if (toSocket) {
                // 发送给指定用户
                socket.to(toSocket).emit('receiveImage', data);
                // 发送给自己
                socket.emit('receiveImage', data);
            } else {
                data.msg = 0;
                socket.emit('receiveImage', data);
            }
        }
    })

    // 私聊功能的实现
    socket.on('sendMessageToOne', data => {
        // 广播给指定用户
        var toSocket = null;
        console.log(io.sockets.sockets)
        for (const key in io.sockets.sockets) {
            if (io.sockets.sockets[key].username === data.toName) {
                toSocket = key;
                break;
            }
        }
        if (toSocket) {
            // 发送给指定用户
            socket.to(toSocket).emit('receiveMessage', data);
            // 发送给自己
            socket.emit('receiveMessage', data);
        }
    });
});


// 关闭 mysql 数据库连接
// db.end(err => {
//     if (err) console.error('close database error!' + err.stack);
//     console.log('close database success!')
// });

