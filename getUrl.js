//To get blog URL
//参数
const tags = "pwn"//题型，tag
const MAX_PAGE = 50//检索到多少页，一页30条



const fs = require('fs')
const cheerio = require('cheerio')

const reConfigHtmlURL = (htmlString) => {
  const baseURL = "https://ctftime.org/"
  const MAX_TR = 30
  return new Promise((resolve, reject) => {
    const $ = cheerio.load(htmlString)

    const data = []
    for (let i = 1; i <= MAX_TR; i++) {

      const Event = $('#writeups_table > tbody > tr:nth-child(' + `${i}` + ')> td:nth-child(1) > a')
      const Task = $('#writeups_table > tbody > tr:nth-child(' + `${i}` + ') > td:nth-child(2) > a')
      const aTag = $('#writeups_table > tbody > tr:nth-child(' + `${i}` + ') > td:nth-child(5) > a')
      const tag = $('#writeups_table > tbody >tr:nth-child(' + `${i}` + ') > td:nth-child(3)')
      if (!aTag) reject({ error: 'No more writeups to scrape!' })
      const hrefValue = aTag.attr('href')

      let tags = []
      tag.children().each((i, child) => {
        tags.push($(child).text().trim())
      })
      data.push(
        {
          url: baseURL + hrefValue,
          Event: Event.text().trim(),
          Task: Task.text().trim(),
          tag: tags
        }
      )
    }
    resolve(data)
  })

}
const initBaseURL = (page, tags) => {
  return "https://ctftime.org/writeups?page=" + `${page}` + "&hidden-tags=" + `${tags}`
}
for (let page = 1; page <= MAX_PAGE; page++) {
  let sign = [",", "]"]
  let num = 1

  fetch(initBaseURL(page, tags))
    .then(data => data.text())
    .then(html => {
      reConfigHtmlURL(html).then(data => {
        let jsonString = JSON.stringify(data) + sign[0]
        if (num == MAX_PAGE) {
          jsonString = JSON.stringify(data) + sign[1]
        }

        fs.appendFile('./CTFtime.json', jsonString, 'utf8', (err) => {
          if (err) throw err
        })
        num++
      })
    })
    .then(() => {
      console.log(`page:${page}已经get成功，目标${MAX_PAGE}`)
    })
    .catch(err => console.log(err))

}
