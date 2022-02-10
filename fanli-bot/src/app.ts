import TelegramBot from "node-telegram-bot-api";
import axios from "axios";
import { URL } from "url";

const BOT_TOKEN = '';//你申请到的bot token
const JD_COOKIE = '';//抓取你自己的京东cookie
const UNION_ID = '';//抓取你自己的京东联盟ID

const bot = new TelegramBot(BOT_TOKEN, { polling: true })

/**
 * 监听开始命令
 */
bot.onText(/\/start/, async msg => {
    try {
        await bot.sendMessage(msg.from.id, '京东转链，请回复【转链 你需要转链的商品地址】来获取返利信息')
    } catch (error) {
        console.log('/start', error);
    }
})

bot.onText(/^转链 /, async msg => {
    const { text } = msg
    try {
        let link = text.split(" ")[1]//将链接从消息中提取出来
        if (link) {//判断是否存在链接
            if (link.includes("jd") || link.includes("jingxi")) {//判断链接是否来自于京东
                let linkInfo = await converUrl(link)//请求转链信息
                if (linkInfo && linkInfo.code === 200) {//如果转链接结果是否存在
                    let replyMsg = linkInfo.data.formatContext + `预计佣金:¥${linkInfo.data.wlCommission}`
                    if (linkInfo.data.imgList && linkInfo.data.imgList.length > 0) {//如果转链信息中包含图片
                        await bot.sendPhoto(msg.chat.id, `http://img14.360buyimg.com/n1/${linkInfo.data.imgList[0]}`,
                            {
                                caption: replyMsg
                            })
                    } else {//转链结果中不存在图片，直接发送文件
                        await bot.sendMessage(msg.chat.id, replyMsg)
                    }
                } else {//转链失败
                    await bot.sendMessage(msg.chat.id, "转链失败")
                }
            } else {//链接不来自于京东
                await bot.sendMessage(msg.chat.id, "你发送来的链接好像不是京东的商品链接哟～")
            }
        } else {//没有检测到链接
            await bot.sendMessage(msg.chat.id, "没有接收到链接哟～")
        }
    } catch (error) {//捕获错误
        console.log("转链", error);//记录错误
        //尝试给用户回复消息安抚
        bot.sendMessage(msg.chat.id, "发生了无法预料的错误，请检查程序。").catch(err => {
            console.log(err);
        })
    }
})

async function converUrl(url: string) {
    // 实例化一个URL对象
    let reqLink = new URL('https://api.m.jd.com/api')
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
    }
    // 通过循环依次将请求参数添加到URL对象中
    for (const vo of Object.keys(payload)) {
        reqLink.searchParams.append(vo, payload[vo])
    }
    // 发起请求
    const { data } = await axios.get(reqLink.href, {
        headers: {
            Cookie: JD_COOKIE
        }
    })
    return data
}