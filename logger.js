const expressWinston = require('express-winston');
const { split } = require('lodash');
const winston = require('winston');
expressWinston.requestWhitelist.push('body');
expressWinston.responseWhitelist.push('body');
module.exports = (req, res, next) => {
    expressWinston.logger({
        transports: [new winston.transports.File({ filename: './log.json' })],
        format: winston.format.combine(
            winston.format.colorize(),
            winston.format.json()
        ),
        dynamicMeta: (req, res) => {
            const httpRequest = {}
            const meta = {}


            if (req) {
                meta.params = req.params && req.params.__feathersId ? { [req.url.split("/")[1] + "Id"]: req.params.__feathersId } : {}
                meta.url = req.params && req.params.__feathersId ? req.url.replace(req.params.__feathersId, req.url.split("/")[1] + "Id") : req.url
                meta.httpRequest = httpRequest
                httpRequest.requestMethod = req.method
                httpRequest.requestUrl = `${req.protocol}://${req.get('host')}${req.originalUrl}`
                httpRequest.protocol = `HTTP/${req.httpVersion}`
                // httpRequest.remoteIp = req.ip // this includes both ipv6 and ipv4 addresses separated by ':'
                httpRequest.remoteIp = req.ip.indexOf(':') >= 0 ? req.ip.substring(req.ip.lastIndexOf(':') + 1) : req.ip   // just ipv4
                httpRequest.requestSize = req.socket.bytesRead
                httpRequest.userAgent = req.get('User-Agent')
                httpRequest.referrer = req.get('Referrer')
            }

            if (res) {
                meta.httpRequest = httpRequest
                httpRequest.status = res.statusCode
                httpRequest.latency = {
                    seconds: Math.floor(res.responseTime / 1000),
                    nanos: (res.responseTime % 1000) * 1000000
                }
                if (res.data) {
                    if (typeof res.data === 'object') {
                        meta.response = res.data;
                        httpRequest.responseSize = JSON.stringify(res.data).length
                    } else if (typeof res.data === 'string') {
                        httpRequest.responseSize = res.data.length
                    }
                }
            }
            return meta
        },
        meta: true, // optional: control whether you want to log the meta data about the request (default to true)
        colorize: true, // Color the text and status code, using the Express/morgan color palette (text: gray, status: default green, 3XX cyan, 4XX yellow, 5XX red).
    })(req, res, next);

};