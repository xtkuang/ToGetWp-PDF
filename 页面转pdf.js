// 导入puppeteer模块



const puppeteer = require('puppeteer')
const fs = require('fs').promises
const getFail = []
let browser = null
let downloadNums = 0
let skipNums = 0
async function generatePDF (url, outputPath) {
  try {
    // 启动一个浏览器实例（默认是headless模式，即无界面模式）
    browser = await puppeteer.launch({ headless: 'new', })
    // 创建一个新的页面
    const page = await browser.newPage()
    // 加载目标URL
    await page.goto(url, { waitUntil: 'networkidle2' }) // 确保所有资源加载完成

    // 设置页面视口大小（可选，根据需要调整）
    await page.setViewport({
      width: 1440,
      height: 1000,
    })
    await page.evaluate(() => {
      const element = document.querySelector('header')
      if (element) {
        element.parentNode.removeChild(element)
        console.log("delete header")
      }
    })
    // 配置PDF选项，如页面大小、边距等
    const pdfOptions = {
      path: outputPath, // PDF输出的路径
      format: 'A4', // 页面格式，例如A4
      printBackground: false, // 是否包含背景颜色和图像
      margin: {
        top: '20px',
        bottom: '20px',
        left: '20px',
        right: '20px',
      },
    }

    // 将页面内容生成为PDF

    await page.pdf(pdfOptions)
    downloadNums++
    console.log(`PDF已成功生成至:${outputPath}`)
  } catch (err) {
    if (browser) {
      await browser.close()
    }
    getFail.push({
      url: url,
      outputPath: outputPath
    })
    skipNums++
    console.warn(`转换失败${url}---${outputPath}`)
    fs.appendFile("./getPdfFailed.txt", `${url}---${outputPath}\n`, function (err) {
      if (err) {
        console.log("写入失败")
      }
    })

  }


  // 关闭浏览器
  await browser.close()


}

// 使用示例
// generatePDF('https://blog.bi0s.in/2024/02/26/Pwn/bi0sCTF24-palindromatic/', './pdf/' + 'output.pdf')
async function readJsonFile (filePath) {
  try {
    const fileContent = await fs.readFile(filePath, 'utf8') // 异步读取文件内容
    const jsonData = JSON.parse(fileContent) // 将字符串转换为JSON对象
    return jsonData
  } catch (error) {
    console.error(`Error reading JSON file: ${error.message}`)
    throw error
  }
}
async function createDirectory (path) {
  try {
    await fs.mkdir(path, { recursive: true })
    // console.log(`Directory ${path} created or already exists.`)
  } catch (error) {
    console.error(`Error creating directory: ${error.message}`)
  }
}
async function doesFileExist (filePath) {
  try {
    await fs.access(filePath, fs.constants.F_OK)
    return true
  } catch (err) {
    return false
  }
}
readJsonFile('./CTFtime.json')
  .then(async data => {
    console.log(data)
    for (let page of data) {
      for (let obj in page) {

        const path = './pdf/' + `${page[obj].Event}/` + `${page[obj].Task}` + '.pdf'
        await createDirectory('./pdf/' + `${page[obj].Event}/`)
        if (await doesFileExist(path)) {
          console.log(`PDF for ${page[obj].Task} Already created.`)
          continue
        }
        await generatePDF(page[obj].url, path)
        console.log(`PDF for ${page[obj].Task} created.`)
        console.log(`本次已转换${downloadNums}个文件，跳过${skipNums}个文件`)

      }
    }
    console.log("截取完成")
    console.log(`本次已转换${downloadNums}个文件，跳过${skipNums}个文件`)
    console.log("本次截取失败的有：")
    console.log(getFail)
  }
  )
  .catch(err => console.error(err))