/**
 * Github https://github.com/zooPanda
 * Youtube https://www.youtube.com/channel/UCcpbYmChGZKBGaB5_POE0Ng
 * Bilibili https://space.bilibili.com/31655347
 * Telegram https://t.me/zoo_channel
 */


/**
 * 获取奖牌榜数据
 * @returns 
 */
async function getDate() {
    const url = 'https://api.cntv.cn/olympic/getBjOlyMedals?serviceId=2022dongao&itemcode=GEN-------------------------------'
    const req = new Request(url)
    req.method = 'get'
    req.headers = {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/15.3 Safari/605.1.15',
        'Accept-Language': 'zh-CN,zh-Hans;q=0.9',
        'host': 'api.cntv.cn'
    }
    const res = await req.loadJSON()
    if (res && res.data && res.data.medalsList) {
        return res.data.medalsList
    } else {
        return null
    }
}
/**
 * 加载图片
 * @param {string} url 需要加载的图片路径
 * @returns 图片对象
 */
async function getImage(url) {
    console.log(url)
    const req = new Request(url)
    req.method = 'get'
    return await req.loadImage()
}
/**
 * 渲染数据加载失败小组件
 * @returns widget object
 */
async function renderErr() {
    let widget = new ListWidget()
    let text = widget.addText(" 加载失败，请稍后重试……")
    widget.textColor = Color.red()
    text.centerAlignText()
    return widget
}
/**
 * 渲染小尺寸组件
 * @param {array} list 奖牌榜数组
 * @returns widget object
 */
async function renderSmallWidget(list) {
    if (list) {
        let widget = new ListWidget()
        let header = widget.addStack()
        let _title = header.addText('冬奥会奖牌榜')
        _title.font = Font.boldSystemFont(16)
        widget.addSpacer(5)
        for (let i = 0; i < 3; i++) {
            let body = widget.addStack()
            let img = body.addImage(await getImage(`https://p1.img.cctvpic.com/sports/data/olympic/teamImg/${list[i].countryid}.png`))
            let countryName = body.addText(`  ${list[i].countryname}  `)
            let count = body.addText(`${list[i].count}`)
            img.imageSize = new Size(16, 16)
            countryName.font = Font.systemFont(14)
            count.font = Font.systemFont(14)
            count.rightAlignText()
        }
        let _line = widget.addStack()
        let line = _line.addText('--------------------')
        line.font = Font.lightSystemFont(10)
        let china = list.find(v => v.countryid === 'CHN')
        let chn = widget.addStack()
        let chn_img = chn.addImage(await getImage(`https://p1.img.cctvpic.com/sports/data/olympic/teamImg/${china.countryid}.png`))
        let chn_cn = chn.addText(`  ${china.countryname}  `)
        let chn_count = chn.addText(china.count)
        chn_img.imageSize = new Size(16, 16)
        chn_cn.font = Font.boldSystemFont(14)
        chn_count.font = Font.boldSystemFont(14)
        return widget
    } else {
        return await renderErr()
    }
}
/**
 * 渲染中尺寸组件
 * @param {array} list 奖牌榜数组
 * @returns widget object
 */
async function renderMediumWidget(list) {
    if (list) {
        let widget = new ListWidget()
        let header = widget.addStack()
        let _icon = header.addImage(await getImage('https://i.imgur.com/O18bIfm.png'))
        _icon.imageSize = new Size(20, 22)
        let _title = header.addText(' 北京冬奥会奖牌榜')
        _title.font = Font.boldSystemFont(16)
        let _info = header.addText('      数据来自于CCTV')
        _info.font = Font.systemFont(10)
        _info.rightAlignText()
        _info.textOpacity = 0.7
        widget.addSpacer(5)
        let body = widget.addStack()
        let countryFlagList = body.addStack()
        let countryNameList = body.addStack()
        let goldList = body.addStack()
        let silverList = body.addStack()
        let bronzeList = body.addStack()
        let countList = body.addStack()
        countryNameList.layoutVertically()
        countryFlagList.layoutVertically()
        goldList.layoutVertically()
        silverList.layoutVertically()
        bronzeList.layoutVertically()
        countList.layoutVertically()
        let goldFlag = await getImage(`https://i.imgur.com/GnqEcWx.png`)
        let silverFlag = await getImage(`https://i.imgur.com/nyE2c1u.png`)
        let bronzeFlag = await getImage(`https://i.imgur.com/NQSJF3D.png`)
        let countFlag = await getImage('https://i.imgur.com/hnlsyAu.png')
        for (let i = 0; i < 4; i++) {
            // 渲染国旗
            let img = countryFlagList.addImage(await getImage(`https://p1.img.cctvpic.com/sports/data/olympic/teamImg/${list[i].countryid}.png`))
            img.imageSize = new Size(16, 17)
            let countryName = countryNameList.addText(`  ${list[i].countryname}  `)
            countryName.font = Font.boldSystemFont(14)
            // 渲染金牌icon及金牌数量
            let goldArea = goldList.addStack()
            let gold = goldArea.addImage(goldFlag)
            gold.imageSize = new Size(14, 14)
            let goldNum = goldArea.addText(list[i].gold + '  ')
            goldNum.font = Font.systemFont(14)
            // 渲染银牌icon及银牌数量
            let silverArea = silverList.addStack()
            let silver = silverArea.addImage(silverFlag)
            silver.imageSize = new Size(14, 14)
            let silverNum = silverArea.addText(list[i].silver + '  ')
            silverNum.font = Font.systemFont(14)
            // 渲染铜牌icon及铜牌数量
            let bronzeArea = bronzeList.addStack()
            let bronze = bronzeArea.addImage(bronzeFlag)
            bronze.imageSize = new Size(14, 14)
            let bronzeNum = bronzeArea.addText(list[i].bronze + '  ')
            bronzeNum.font = Font.systemFont(14)
            // 渲染总数icon及总奖牌数量
            let countArea = countList.addStack()
            let count = countArea.addImage(countFlag)
            count.imageSize = new Size(14, 14)
            let countNum = countArea.addText(list[i].count)
            countNum.font = Font.systemFont(14)
        }
        // 渲染分割线
        let _line = widget.addStack()
        let line = _line.addText('----------------------------------------')
        line.font = Font.lightSystemFont(8)

        // 渲染中国数据
        let china = list.find(v => v.countryid === 'CHN')
        let chn = widget.addStack()
        let chn_img = chn.addImage(await getImage(`https://p1.img.cctvpic.com/sports/data/olympic/teamImg/${china.countryid}.png`))
        let chn_cn = chn.addText(`  ${china.countryname}  `)
        let chn_goldFlag = chn.addImage(goldFlag)
        let chn_gold = chn.addText(`${china.gold}    `)
        let chn_silverFlag = chn.addImage(silverFlag)
        let chn_silver = chn.addText(`${china.silver}    `)
        let chn_bronzeFlag = chn.addImage(bronzeFlag)
        let chn_bronze = chn.addText(`${china.bronze}    `)
        let chn_countFlag = chn.addImage(countFlag)
        let chn_count = chn.addText(`${china.count}    `)
        let chn_rank = chn.addText(`排名:${china.rank}`)
        chn_img.imageSize = new Size(16, 17)
        chn_cn.font = Font.boldSystemFont(14)
        chn_gold.font = Font.boldSystemFont(14)
        chn_silver.font = Font.boldSystemFont(14)
        chn_bronze.font = Font.boldSystemFont(14)
        chn_count.font = Font.boldSystemFont(14)
        chn_rank.font = Font.boldSystemFont(14)
        chn_goldFlag.imageSize = new Size(14, 14)
        chn_silverFlag.imageSize = new Size(14, 14)
        chn_bronzeFlag.imageSize = new Size(14, 14)
        chn_countFlag.imageSize = new Size(14, 14)
        return widget
    } else {
        return await renderErr()
    }
}
async function init() {
    try {
        let widget
        let data = await getDate()
        if (config.runsInWidget) {
            switch (config.widgetFamily) {
                case 'small':
                    widget = await renderSmallWidget(data)
                    break;
                default:
                    widget = await renderMediumWidget(data)
                    break;
            }
            Script.setWidget(widget)
            Script.complete()
        } else {
            let w = await renderMediumWidget(await getDate())
            w.presentMedium()
            Script.complete()
        }
    } catch (error) { Script.complete() }
}
await init()