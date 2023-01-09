#新建数据库
create database program_design;

#创建用户表
create table user_info
(
	id int comment '用户id',
	name varchar(20) not null comment '用户昵称',
	gender char not null comment '性别',
	age int null comment '年龄',
	telephone varchar(15) null comment '电话号码',
	email varchar(50) null comment '电子邮件'
)comment '用户信息';

alter table user_info modify id int comment '用户id';

create unique index user_info_id_uindex
	on user_info (id);

alter table user_info
	add constraint user_info_pk
		primary key (id);

alter table user_info modify id int auto_increment comment '用户id';


#创建查询表
create table inquire_sign
(
	user_id int comment '用户id',
	username varchar(30) not null comment '用户名',
	password varchar(20) not null comment '用户密码',
	constraint user_id
		foreign key (user_id) references user_info (id)
)
comment '登录查询表';

create unique index inquire_sign_user_id_uindex
	on inquire_sign (user_id);

alter table inquire_sign
	add constraint inquire_sign_pk
		primary key (user_id);

create database useme;

