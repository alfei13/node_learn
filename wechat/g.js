'use strict'

var sha1 = require('sha1')
var getRawBody = require('raw-body')
var Wechat = require('./wechat')
var util = require('./util')

module.exports = function(opts) {
	var wechat = new Wechat(opts) // 管理票据的更新

	return function *(next) { // 返回信息的
		var _this = this
		var token = opts.token
		var signature = this.query.signature
		var nonce = this.query.nonce
		var timestamp = this.query.timestamp
		var echostr = this.query.echostr
		var str = [token, timestamp, nonce].sort().join('')
		var sha = sha1(str)

		// 
		if (this.method === 'GET') {
			// 判断是否合法
			if (sha === signature) {
				this.body = echostr + ''
			}
			else {
				this.body = 'wrong'
			}
		} else if (this.method === 'POST') {
			if (sha !== signature) {
				this.body = echostr + ''
				return false
			}
			
			var data = yield getRawBody(this.req, {
				// 配置项
				length: this.length,
				limit: '1mb',  // 数据大小
				encoding: this.charset
			})

			// console.log(data.toSting())
			var content = yield util.parseXMLAsync(data)
			console.log(content)

			var message = util.formatMessage(content.xml)
			console.log(message)

			if (message.MsgType === 'event') {
				if (message.Event === 'subscribe') {
					var now = new Date().getTime()

					_this.status = 200
					_this.type = 'application/xml'
					_this.body = 'xml' + 
					'<ToUserName><![CDATA[' + message.FromUserName + ']]></ToUserName>' + 
					'<FromUserName><![CDATA[' + message.ToUserName + '>]]></FromUserName>' +
					 '<CreateTime>'+ now + '</CreateTime>' + 
					 '<MsgType><![CDATA[text]]></MsgType>' + 
					 '<Content>< ![CDATA[Hi, 欢迎来到看花谷 \n 经纶世务者窥谷忘反！] ]></Content>' +
					 '</xml>'

					 console.log(reply)
					 _this.body = reply
				}
			}
		}
  }
}



function Wechat(opts) {  // 构造函数，
	var _this = this
	this.appID = opts.appID
	this.appSecret = opts.appSecret
	this.getAccessToken = opts.getAccessToken
	this.saveAccessToken = opts.saveAccessToken

	this.getAccessToken()
	  .then(function(data) {
	  	try{
	  		data = JSON.parse(data)
	  	}
	  	catch(e) {
	  		// 票据不存在，更新下票据
	  		return _this.updateAccessToken(data) 
	  	}
	  	// 合法性检查
	  	if (_this.isValidAccessToken(data)) {
	  		// 传递下去data
	  		Promise.resolve(data)
	  	} else {
	  		return _this.updateAccessToken()
	  	}
	  })
	  .then(function (data) { // resolve 后得到的数据
	  	_this.access_token = data.access_token
	  	_this.expires_in = data.expires_in

	  	_this.saveAccessToken(data)
	  })
}





