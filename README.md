# Learning-together
这个仓库用来存放在YouTube频道直播时产生的一些代码，旨在和大家一起学习、交流编写代码。

## 部署环境

因为是学习使用`Node.js`来编写代码，所以需要先做一些准备工作。

### 编辑器的选择

写代码的工具其实有很多，有的大佬可以直接`记事本`或者`notepad++`直接生撸，也有如我这样的小白需要各种辅助工具的。以前用过`WebStrom`，感觉功能是很强大，但是需要收费，虽然网上可以找到各种破解的方法，不过还是希望能够支持正版。而且因为我个人的习惯，经常给电脑重做系统，所以一个相对轻量化的编辑器会更加适合我，这里我推荐使用微软推出的`Visual Studio Code`。首先它是一款免费的编辑器，而且相对于`WebStorm`这类型的IDE会更加的轻量。

`vscode`的安装非常简单，直接到[Visual Studio Code官网](https://code.visualstudio.com)下载对应系统的安装包版本安装即可。

### Node.js的安装

`Node.js`的安装方式很多，这边根据我自己的习惯，我介绍2种方式。

- 本机安装
    
    直接打开[Node.js官网](https://nodejs.org)，选择长期支持的稳定版下载安装即可。
    
    以前在 v14 版的时候，这样安装完就没有权限方面的问题了，但是到了 v16 版本之后，这样安装完直接通过包管理器全局安装第三方的包的时候，会出现权限问题的报错。`Node.js`官方给出了两种解决方案，因为个人没有多Node版本切换使用的需求，所以就没有选择 `nvm`(Node version manager)安装的方式来解决。

    1. 重新安装 `nvm` 来解决权限问题。(官方推荐的方法)

        [Node Version Manager](https://github.com/nvm-sh/nvm)参考其文档安装即可.

    2. 手动修改`npm`的默认路径。

        ```shell
            mkdir ~/.npm-global #在当前用户目录下新建全局安装目录
            npm config set prefix '~/.npm-global' #修改npm的设置使用新的目录进行全局安装
            touch ~/.profile #确认当前用户目录下有.profile文件
            export PATH=~/.npm-global/bin:$PATH #在当前用户目录下的.profile文件中增加配置
            source ~/.profile #让当前用户目录下的.profile文件立即生效
        ```
        到此就已经可以正常的使用`npm`进行全局的第三方包的安装了


- Docker安装

    如果你不喜欢在本地安装，想通过容器来构建`Node.js`的基础运行环境，那么可以通过这种方式来安装。
    
    1. 在[Docker的官网](https://www.docker.com)下载[Docker Desktop](https://www.docker.com/products/docker-desktop)软件的安装包
    2. 在本地安装好`Docker Desktop`，打开确保`Dcoker`的守护进程已经成功运行。
    3. 打开 `vscode`，在 `vscode`的拓展中心找到 [Remote Development](https://marketplace.visualstudio.com/items?itemName=ms-vscode-remote.vscode-remote-extensionpack)套件包安装。
    4. 重启vscode，在左下角找到绿色的按钮点击打开远程连接，选择`Open folder in container`,然后选择好本地准备映射到容器中的文件夹，下一步选择`Node.js`环境，再下一步选择所需的`Node.js`版本即可。
    5. 等待容器构建好，在 `vscode`中打开终端输入 `node -v`，确保已经能够顺利的看到`Node.js`的版本号即可。


### 第三方包管理器的选择

`Node.js`中的第三方包管理器我知道的有 `npm`、`yarn`、`cnpm`

具体使用哪一个管理器则是根据个人的习惯去选择即可。

 - npm [npm官网](https://www.npmjs.com)

    常用命令

    `npm init` - 初始化一个项目

    `npm install packageName`  - 安装第三方包

    `npm install packageName -g` - 全局安装第三方包

    `npm install packageName -d` - 安装一个开发依赖

    `npm uninstall packageName` - 删除一个第三方包

 - yarn [yarn官网](https://yarnpkg.com)

    常用命令

    `yarn init` - 初始化一个项目

    `yarn add packageName` - 安装一个第三方包

    `yarn global add packageName` - 全局安装第三方包

    `yarn add packageName -D` - 安装一个开发以来

    `yarn remove packageName` - 删除一个第三方包

 - cnpm [cnpm官网](https://npmmirror.com)

    这个是npm的中国镜像，因为本地网络没有遇到什么限制，所以没用过这个包管理工具。有需要的可以到官网了解一下。大致使用方式跟npm一致。

## 写点儿东西

 - [天气小助手](https://github.com/zooPanda/Learning-together/blob/dev/weather-bot/README.md)

 - [京东返利机器人](https://github.com/zooPanda/Learning-together/blob/dev/fanli-bot/README.md)