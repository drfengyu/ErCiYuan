# ErCiYuan



## 项目结构

<img width="493" height="367" alt="image" src="https://github.com/user-attachments/assets/344497f8-201b-4f0c-8432-6dea17986dca" />




## 后端技术栈

### 项目骨架

| 框架               | 版本          |                                                              |
| ------------------ | ------------- | ------------------------------------------------------------ |
| SpringBoot         | 2.2.2.RELEASE | √                                                            |
| SpringCloud        | Hoxton.SR1    | √                                                            |
| SpringCloudAlibaba | 2.1.0.RELEASE | √                                                            |
| Mybatis Plus       | 3.3.1         | ORM                                                          |
| Swagger            | 2.8.0         | 接口文档及测试                                               |
| SpringSecurity     | 2.2.2.RELEASE | 用户认证与授权，动态路由                                     |
| gateway            | 2.2.1.RELEASE | SpringCloud Gateway，新一代微服务网关，进行请求过滤以以及转发 |



### 数据库

| 数据库 | 作用                                           |
| ------ | ---------------------------------------------- |
| MySQL  | 存储数据                                       |
| Redis  | 缓存首页数据，缓存 token 用于 refresh 以及校验 |



### 第三方服务

| 服务名     | 作用                 |
| ---------- | -------------------- |
| 微信支付   | 我，二刺螈皇帝，打钱 |
| 阿里云 VOD | 视频上传，解码等     |
| 阿里云 OSS | 图片和文件存储       |
| 阿里云 SMS | 短信发送             |



### 其它

| 组件名    | 作用                           |
| --------- | ------------------------------ |
| nacos     | 服务注册与发现、配置中心       |
| sentinel  | 服务监控，以及熔断、限流、降级 |
| openFegin | http 远程调用                  |
| easyExcel | Excel 操作                     |
| jjwt      | jwt token 工具                 |





## 前端技术栈



### 后台

| 框架、UI、模板    |
| ----------------- |
| Vue               |
| elementUI         |
| vue-element-admin |



### 前台

| 框架、UI  |
| --------- |
| Vue       |
| Nuxt      |
| elementUI |



#### 其它

DPlayer：视频播放



## 环境搭建



### 导入数据库

导入 sql 文件夹下的所有 sql 文件



### 搭建 Redis

我使用的是 docker 搭建的，详情可以参考我的教程 [redis 入门](https://www.yuque.com/antigenmhc/oqye1q/gz5scs#3579ecf8)



### 搭建弹幕 node 服务

在视频播放中用到了第三方播放器 DPlayer，可以搭载弹幕的后端服务

```shell
mkdir dplayer-node
cd dplayer-node
git clone https://github.com/MoePlayer/DPlayer-node .
docker-compose build
docker-compose pull
docker-compose up # -d for run it in the background
```



### 启动 nacos

nacos 可以本地启动，也可以在虚拟机上启动，这里介绍使用 docker 启动。[nacos 安装](https://www.yuque.com/antigenmhc/tg6usw/ailhhi#4f09501c)



### 启动 sentinel

同样 sentinel 也可以本地启动，也可以在虚拟机上启动，这里不再赘述



### 修改配置文件

oss、vod、sms、ucenter、trade 服务中都涉及到了 Key 和 Secret，请自行申请并替换 ( 阿里云的，github 和 gitee 的，微信支付的 )

涉及到 nacos 和 sentinel 的端口以及 ip 请自行修改

涉及到的内网穿透，请自行搭建 / 购买

ps：项目中提供的配置文件是通过 nacos 进行整合的，如果想要不在 nacos 上的版本，请看过往版本





## 启动项目



### 前台启动

front 为后台，site 为 前台，分别

- npm install
- npm run dev

启动后会自行弹出



### 后台启动

全启，没啥好说的



## 效果图

### 后台

#### admin

<img width="1922" height="948" alt="image" src="https://github.com/user-attachments/assets/693779b8-282a-4969-837d-999097c93819" />


<img width="1898" height="941" alt="image" src="https://github.com/user-attachments/assets/8916cc09-7d8e-4583-a28e-ade613a5a6fd" />


<img width="1904" height="939" alt="image" src="https://github.com/user-attachments/assets/42a637a7-bd9b-4153-872e-932f76b2cf0d" />




#### 普通管理员

<img width="1909" height="939" alt="image" src="https://github.com/user-attachments/assets/4e508578-2467-46d2-8202-636950866303" />


<img width="1907" height="922" alt="image" src="https://github.com/user-attachments/assets/2bf7784f-0726-472d-b3f9-6c2f20a0961a" />






### 前台

<img width="1063" height="665" alt="image" src="https://github.com/user-attachments/assets/c7bedfc4-980d-40e5-ae6b-ee7c53244626" />


<img width="1876" height="879" alt="image" src="https://github.com/user-attachments/assets/9201e895-9b94-45a5-bdae-c1f95cbe2049" />


首页进入可能较慢，因为会把数据缓存到 Redis 里



#### 动漫

<img width="1081" height="1369" alt="image" src="https://github.com/user-attachments/assets/2cdaa391-3229-4786-b364-99cbc5b1424d" />


<img width="1889" height="934" alt="image" src="https://github.com/user-attachments/assets/e8dc1176-a3d3-4092-9496-849c592c91f3" />


<img width="1889" height="2467" alt="image" src="https://github.com/user-attachments/assets/b35d4ba8-9fee-4b86-be7b-58378fd41441" />




#### 制作方

<img width="1079" height="852" alt="image" src="https://github.com/user-attachments/assets/d9626364-fe15-417a-9a04-6798149975ad" />


<img width="1075" height="961" alt="image" src="https://github.com/user-attachments/assets/ef76ea77-473f-4ac7-860c-d8f901a21817" />






#### 用户中心

![image-20210209150021373](https://gitee.com/antigenmhc/picture/raw/master/img/20210209150022.png)

![image-20210209150044399](https://gitee.com/antigenmhc/picture/raw/master/img/20210209150045.png)

![image-20210209150103832](https://gitee.com/antigenmhc/picture/raw/master/img/20210209150104.png)





