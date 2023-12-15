// app.ts
var mqtt = require("./utils/mqtt.min")

const options = {
  connectTimeout: 3000,
  clientId: function () {
    return Math.random().toString(36).substr(2, 15)
  },
}


App({
  globalData: {
    mqttClient: null,
    ip: '10.128.183.177',
  },
  
  onLaunch() {
    // 展示本地存储能力
    const logs = wx.getStorageSync('logs') || []
    logs.unshift(Date.now())
    wx.setStorageSync('logs', logs)

    // 登录
    wx.login({
      success: res => {
        console.log(res.code)
        console.log('Hello!!!')
        // 发送 res.code 到后台换取 openId, sessionKey, unionId
      },
    })

    //连接MQTT服务器
    let that = this;
    //创建websocket,需要域名、ssl证书
    that.globalData.mqttClient = mqtt.connect('wx://'+ that.globalData.ip +':8083/mqtt',options)
    that.globalData.mqttClient.on('connect', function() {
      that.globalData.mqttClient.subscribe('v1/devices/telemetry', function (err) {
        if (!err) {
           console.log('传感器数值数值订阅成功！')
        }
      })
      that.globalData.mqttClient.subscribe('pindata', function (err) {
        if (!err) {
           console.log('数字量引脚数值订阅成功！')
        }
      })
    })
  },
})