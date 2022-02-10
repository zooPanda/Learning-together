import TelegramBot from "node-telegram-bot-api";
import axios from "axios";
import { URL } from "url";

const BOT_TOKEN = '';//你申请到的bot token
const HEFENG_KEY = '';//你申请到的和风天气的api key

const bot = new TelegramBot(BOT_TOKEN, { polling: true })

/**
 * 监听开始命令
 */
bot.onText(/\/start/, async msg => {
    try {
        await bot.sendMessage(msg.from.id, '查询天气，请回复【天气 你需要查询天气的地址】来获取天气信息')
    } catch (error) {
        console.log('/start', error);
    }
})
/**
 * 监听天气查询请求
 */
bot.onText(/^天气 /, async msg => {
    try {
        let local = msg.text.split(" ")[1]
        if (local) {
            await weather(local, msg.from.id)
        } else {
            await bot.sendMessage(msg.chat.id, "没有接收到你需要查询天气的地方哟～")
        }
    } catch (error) {
        console.log('天气', error);
    }
})

/**
 * 监听回调查询
 */
bot.on('callback_query', async query => {
    const { data, from, message } = query
    try {
        // 如果回调查询有参数且参数为字符串
        if (data && typeof data === 'string') {
            // 通过下划线分割区分回调命令
            let cmd = data.split("_")
            // 如果有命令
            if (cmd) {
                // 根据命令判断该如何处理
                switch (cmd[0]) {
                    case 'weather':
                        let weather_data = await weatherInfo(cmd[1])
                        await bot.sendMessage(from.id, `
                    ${cmd[2]}当前的天气是${weather_data.now.text}
                    温度:${weather_data.now.temp}°C
                    体感温度:${weather_data.now.feelsLike}°C
                    相对湿度:${weather_data.now.humidity}%
                    风向:${weather_data.now.windDir} ${weather_data.now.windScale}级
                    详情:${weather_data.fxLink}
                    `)
                        break;

                    default:
                        break;
                }
            }
        }
        await bot.deleteMessage(from.id, `${message.message_id}`)

    } catch (error) {
        console.log('callback_query', data, error);
    }
})

/**
 * 获取具体位置的实时天气信息
 * @param location 请求的地址ID
 */
async function weatherInfo(location: string) {
    const reqLink = new URL('https://devapi.qweather.com/v7/weather/now')
    reqLink.searchParams.append('key', HEFENG_KEY)
    reqLink.searchParams.append('location', location)
    try {
        const { data } = await axios.get(reqLink.href)
        return data
    } catch (error) {
        console.log('getWearher', error);
        return null
    }
}
/**
 * 通过关键字查找地址
 * @param {string} text 用于模糊查询地址的关键字
 * @returns 地址列表
 */
async function findLocationId(text: string) {
    const reqLink = new URL('https://geoapi.qweather.com/v2/city/lookup')
    reqLink.searchParams.append('key', HEFENG_KEY)
    reqLink.searchParams.append('location', text)
    try {
        const { data } = await axios.get(reqLink.href)
        return data
    } catch (error) {
        console.log('findLocationId', error);
        return null
    }
}

/**
 * 天气查询处理函数
 * @param {string} text 需要查询的地址
 * @param {number|string} id 用户ID
 */
async function weather(text: string, id: number) {
    try {
        let list = await findLocationId(text)
        if (list) {
            //如果获取到地址
            if (list.length > 1) {
                // 如果获取到的可选位置特别多
                let buttons = []//可选按钮
                let rowButton = []//每一行按钮
                for (let i = 0; i < list.length; i++) {
                    rowButton.push({
                        text: list[i].adm1 + list[i].adm2 + list[i].name,
                        callback_data: 'weather_' + list[i].id + `_${list[i].name}`
                    })
                    if (i !== list.length - 1) {
                        if (rowButton.length === 2) {
                            buttons.push(rowButton)
                            rowButton = []
                        }
                    } else {
                        buttons.push(rowButton)
                    }
                }
                await bot.sendMessage(id, '有几个相似的地方，你要哪一个？', {
                    reply_markup: {
                        inline_keyboard: buttons
                    }
                })

            } else {
                //只有一个地方了，没得选。
                let weather_data = await weatherInfo(list[0].id)
                await bot.sendMessage(id, `
                ${list[0].name}当前的天气是${weather_data.now.text}
                温度:${weather_data.now.temp}°C
                体感温度:${weather_data.now.feelsLike}°C
                相对湿度:${weather_data.now.humidity}%
                风向:${weather_data.now.windDir} ${weather_data.now.windScale}级
                详情:${weather_data.fxLink}
                `)
            }
        } else {
            //没有获取到地址
            await bot.sendMessage(id, '很抱歉，没有找到这个地址。')
        }
    } catch (error) {
        console.log('weather', error);
    }
}