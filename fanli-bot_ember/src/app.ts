import {Telegraf} from 'telegraf';
import axios from 'axios';
import {URL} from 'url';

const HttpsProxyAgent = require('https-proxy-agent');
const BOT_TOKEN = '';//你申请到的bot token
const UNION_ID = '';//抓取你自己的京东联盟ID
const config = {
    url: 'http://127.0.0.1:5700',//青龙地址:端口
    clientID: '',
    clientSecret: '',
    searchValue: 'JD_COOKIE',
    index: 1, //默认获取第一个 cookie
    agentHost: '127.0.0.1',
    agentPort: 7890
};

let bot;
if (config.agentHost && config.agentPort) {
    const agent = new HttpsProxyAgent({
        host: config.agentHost,
        port: config.agentPort
    });
    bot = new Telegraf(BOT_TOKEN, {telegram: {agent}});
} else {
    bot = new Telegraf(BOT_TOKEN);
}

bot.launch().then(r => {
    console.log('启动bot成功');
});

/**
 * 监听开始命令
 */
bot.hears(/\/start/, ctx => {
    try {
        ctx.reply('京东转链机器人'+'\n1.请回复商品 url 来获取返利信息，例如直接发送 https://item.jd.com/70241615154.html' +
            '\n 2.回复 /order 查询最近7天返利订单');
    } catch (error) {
        console.log('/start', error);
    }
});

/**
 * 监听查询最近7天订单请求
 */
bot.hears(/\/order/, ctx => {
    try {
        getOrder().then(res => {
            let linkInfo = res.data;
            if (linkInfo && linkInfo.code === 200) {//如果转链接结果是否存在
                let data = linkInfo.result;
                if (data.length === 0) {
                    ctx.reply('没有订单哦！');
                } else {
                    for (let i = 0; i < data.length; i++) {
                        let replyMsg = data[i].skuName + '\n' + '----------------' + '\n' + `预计佣金:¥${data[i].estimateFee}`;
                        ctx.replyWithPhoto({url: `http://img14.360buyimg.com/n1/${data[i].skuImgUrl}`},
                            {caption: replyMsg});
                    }
                }

            } else {//转链失败
                ctx.reply('查询失败了');
            }
        });

    } catch (error) {//捕获错误
        console.log('转链', error);//记录错误
        //尝试给用户回复消息安抚
        ctx.reply('发生了无法预料的错误，请检查程序。').catch(err => {
            console.log(err);
        });
    }
});
/**
 * 监听转链请求
 */
bot.hears(/^(?:(http|https|ftp):\/\/)?((|[\w-]+\.)+[a-z0-9]+)(?:(\/[^/?#]+)*)?(\?[^#]+)?(#.+)?$/i, ctx => {

    const {text} = ctx.message;
    try {
        let link = text.split(' ')[0];//将链接从消息中提取出来
        if (link) {//判断是否存在链接
            if (link.includes('jd') || link.includes('jingxi')) {//判断链接是否来自于京东
                converUrl(link).then(res => {
                    let linkInfo = res.data;
                    if (linkInfo && linkInfo.code === 200) {//如果转链接结果是否存在
                        let replyMsg = linkInfo.data.formatContext + `预计佣金:¥${linkInfo.data.wlCommission}`;
                        if (linkInfo.data.imgList && linkInfo.data.imgList.length > 0) {//如果转链信息中包含图片
                            ctx.replyWithPhoto({url: `http://img14.360buyimg.com/n1/${linkInfo.data.imgList[0]}`},
                                {caption: replyMsg});
                        } else {//转链结果中不存在图片，直接发送文件
                            ctx.reply(replyMsg);
                        }
                    } else {//转链失败
                        ctx.reply('转链失败');
                    }
                });


            } else {//链接不来自于京东
                ctx.reply('你发送来的链接好像不是京东的商品链接哟～');
            }
        } else {//没有检测到链接
            ctx.reply('没有接收到链接哟～');
        }
    } catch (error) {//捕获错误
        console.log('转链', error);//记录错误
        //尝试给用户回复消息安抚
        ctx.reply('发生了无法预料的错误，请检查程序。').catch(err => {
            console.log(err);
        });
    }
});

async function getCookie() {
    const url = `${config.url}/open/auth/token?client_id=${config.clientID}&client_secret=${config.clientSecret}`;

    const {data} = await axios.get(url);
    const token = data.data.token;
    const evnResult = await axios.get(
        `${config.url}/open/envs?searchValue=${config.searchValue}&t=${new Date().getTime()}`,
        {headers: {Authorization: 'Bearer ' + token}});

    return evnResult.data.data[config.index - 1].value;


}

async function converUrl(url: string) {
    // 实例化一个URL对象
    let reqLink = new URL('https://api.m.jd.com/api');
    // 预先准备好请求参数
    let payload = {
        functionId: 'ConvertSuperLink',
        appid: 'u',
        _: Date.now(),
        body: JSON.stringify({
            funName: 'getSuperClickUrl',
            param: {
                materialInfo: url
            },
            unionId: UNION_ID,
        }),
        loginType: 2
    };
    // 通过循环依次将请求参数添加到URL对象中
    for (const vo of Object.keys(payload)) {
        reqLink.searchParams.append(vo, payload[vo]);
    }
    // 发起请求
    const Cookie = await getCookie();

    return axios.get(reqLink.href, {
        headers: {
            Cookie,
            'user-agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 15_3 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 MicroMessenger/8.0.18(0x1800122b) NetType/WIFI Language/zh_CN'
        }
    });


}


async function getOrder() {
    // 实例化一个URL对象
    let reqLink = new URL('https://api.m.jd.com/api');
    // 预先准备好请求参数
    let startTime = new Date().getTime() - 7 * 24 * 60 * 60 * 1000;


    let payload = {
        functionId: 'listOrderSku',
        appid: 'u',
        _: Date.now(),
        body: JSON.stringify({
            funName: 'listOrderSku',
            param: {
                // @ts-ignore
                startTime: new Date(startTime).format('yyyy-MM-dd hh:mm:ss'),
                // @ts-ignore
                endTime: new Date().format('yyyy-MM-dd hh:mm:ss'),
                orderStatus: 0,
                optType: 1,
            },
            page: {
                pageNo: 1,
                pageSize: 10
            },
            unionId: UNION_ID,
        }),
        loginType: 2
    };
    // 通过循环依次将请求参数添加到URL对象中
    for (const vo of Object.keys(payload)) {
        reqLink.searchParams.append(vo, payload[vo]);
    }
    // 发起请求
    const Cookie = await getCookie();

    return axios.get(reqLink.href, {
        headers: {
            Cookie,
            'user-agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 15_3 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 MicroMessenger/8.0.18(0x1800122b) NetType/WIFI Language/zh_CN'
        }
    });


}

// @ts-ignore
Date.prototype.format = function (fmt) {
    var o = {
        'M+': this.getMonth() + 1,                 //月份
        'd+': this.getDate(),                    //日
        'h+': this.getHours(),                   //小时
        'm+': this.getMinutes(),                 //分
        's+': this.getSeconds(),                 //秒
        'q+': Math.floor((this.getMonth() + 3) / 3), //季度
        'S': this.getMilliseconds()             //毫秒
    };
    if (/(y+)/.test(fmt)) {
        fmt = fmt.replace(RegExp.$1, (this.getFullYear() + '').substr(4 - RegExp.$1.length));
    }
    for (var k in o) {
        if (new RegExp('(' + k + ')').test(fmt)) {
            fmt = fmt.replace(RegExp.$1, (RegExp.$1.length == 1) ? (o[k]) : (('00' + o[k]).substr(('' + o[k]).length)));
        }
    }
    return fmt;
};


