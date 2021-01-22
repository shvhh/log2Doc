const fs = require("fs");
const blackListedHeaderKeys = ["host", "if-none-match", "content-length", "connection", "accept", "user-agent", "origin", "sec-fetch-site", "sec-fetch-mode", "sec-fetch-dest", "referer", "accept-language"]
const logs = (fs.readFileSync("./log.json")).toString().split("\n");
logs.forEach((reqLog) => {

    try {
        addLogToDoc(JSON.parse(reqLog).meta);
    }
    catch (err) { console.log(reqLog) }

})

function addLogToDoc(metaData) {
    console.log(metaData.httpRequest.requestMethod);
    if (metaData.httpRequest.requestMethod !== 'OPTIONS') {

        if (metaData.req.url.includes('amplify-cause')) { console.log(metaData.req.url.split("/")[1].split("?").shift()) }


        fs.appendFileSync("./doc/index.js",
            `/**
* @api {${metaData.httpRequest.requestMethod}} ${metaData.url}
*
* @apiGroup ${metaData.req.url.split("/")[1].split("?").shift()}
* 
*       ${Object.entries(metaData.req.query || {}).reduce((accumulator, currentValue) => {
                if (!blackListedHeaderKeys.includes(currentValue[0])) {
                    accumulator += `* @apiQuery {${typeof currentValue[1]}} ${currentValue[0]}  \n`
                }
                return accumulator
            }, '')}
*       ${Object.entries(metaData.req.body || {}).reduce((accumulator, currentValue) => {
                if (!blackListedHeaderKeys.includes(currentValue[0])) {
                    accumulator += `* @apiParam {${typeof currentValue[1]}} ${currentValue[0]}  \n`
                }
                return accumulator
            }, '')}
*
*
* @apiHeaderExample {json} Header:
*     {
*       ${Object.entries(metaData.req.headers).reduce((accumulator, currentValue) => {
                if (!blackListedHeaderKeys.includes(currentValue[0])) {
                    accumulator += `"${currentValue[0]}" : "${currentValue[1]}"\n`
                }
                return accumulator
            }, '')}
*     }
* @apiParamExample {json} Request-Example:
*     ${JSON.stringify(metaData.req.body || {}, null, 2)}
*  * @apiSuccessExample {json} Success-Response:
*     HTTP/${metaData.req.httpVersion || '1.1'} ${metaData.res.statusCode || 200} OK
*     ${JSON.stringify(metaData.response || metaData.res.body || {}, null, 2)}
*/`);
    }
}
