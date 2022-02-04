import TelegramBot from "node-telegram-bot-api";
import axios from 'axios';
import url from "url"


// 所需参数 根据习惯常量全大写
const HEFENG_KEY = ''
const BOT_TOKEN = ''

const BOT = new TelegramBot(BOT_TOKEN, {
    polling: true
})

/**
 * 监听天气查询请求
 */
BOT.onText(/^天气/, async msg => {
    try {
        let local = msg.text.split(" ")[1]
        await weather(local, msg.from.id)
    } catch (error) {
        console.log('天气', error);
    }
})
/**
 * 监听开始命令
 */
BOT.onText(/\/start/, async msg => {
    try {
        await BOT.sendMessage(msg.from.id, '当前只有天气查询功能，请回复【天气 你需要查询的地址】来获取天气')
    } catch (error) {
        console.log('/start', error);
    }
})


/**
 * 监听回调查询
 */
BOT.on('callback_query', async query => {
    try {
        const { data, from, message } = query

        // 如果回调查询有参数且参数为字符串
        if (data && typeof data === 'string') {
            // 通过下划线分割区分回调命令
            let cmd = data.split("_")
            // 如果有命令
            if (cmd) {
                // 根据命令判断该如何处理
                switch (cmd[0]) {
                    case 'weather':
                        let weather_data = await getWearher(cmd[1])
                        await BOT.sendMessage(from.id, `
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
        await BOT.deleteMessage(from.id, message.message_id)

    } catch (error) {
        console.log('callback_query', data, error);
    }
})
/**
 * 通过关键字查找地址
 * @param {string} text 用于模糊查询地址的关键字
 * @returns 地址列表
 */
async function findLocationId(text) {
    const api = new url.URL('https://geoapi.qweather.com/v2/city/lookup')
    api.searchParams.append('key', HEFENG_KEY)
    api.searchParams.append('location', text)
    try {
        const { data } = await axios.get(api.href)
        if (data && data.code === '200') {
            return data.location
        } else {
            return null
        }
    } catch (error) {
        console.log('findLocationId', error);
        return null
    }
}
/**
 * 获取具体天气
 * @param {string} location locationId
 * @returns 数据或null
 */
async function getWearher(location) {
    const api = new url.URL('https://devapi.qweather.com/v7/weather/now')
    api.searchParams.append('key', HEFENG_KEY)
    api.searchParams.append('location', location)
    try {
        const { data } = await axios.get(api.href)
        if (data && data.code === '200') {
            return data
        } else {
            return null
        }
    } catch (error) {
        console.log('getWearher', error);
        return null
    }
}

/**
 * 天气查询处理函数
 * @param {string} text 需要查询的地址
 * @param {number|string} id 用户ID
 */
async function weather(text, id) {
    try {
        let list = await findLocationId(text)
        if (list) {
            //如果获取到地址
            if (list.length > 1) {
                // 如果获取到的可选位置特别多
                let an_jian = []//可选按钮
                let row = []//每一行按钮
                for (let i = 0; i < list.length; i++) {
                    row.push({
                        text: list[i].adm1 + list[i].adm2 + list[i].name,
                        callback_data: 'weather_' + list[i].id + `_${list[i].name}`
                    })
                    if (i !== list.length - 1) {
                        if (row.length === 2) {
                            an_jian.push(row)
                            row = []
                        }
                    } else {
                        an_jian.push(row)
                    }
                }
                await BOT.sendMessage(id, '有几个相似的地方，你要哪一个？', {
                    reply_markup: {
                        inline_keyboard: an_jian
                    }
                })

            } else {
                //只有一个地方了，没得选。
                let weather_data = await getWearher(list[0].id)
                await BOT.sendMessage(id, `
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
            await BOT.sendMessage(id, '很抱歉，没有找到这个地址。')
        }

    } catch (error) {
        console.log('weather', error);
    }
}