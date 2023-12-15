const app = getApp()
const mqttClient = app.globalData.mqttClient

Page({
  /**
   * 页面的初始数据
   */
  data: {
    mqValue:{
      temperature: 15,
      humidity: 42,
      soilHum: 74,
    },
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow() {
    let that = this

    mqttClient.on('message', function (topic, message) {
      let msg = message.toString();
      let temp = JSON.parse(msg);
      if(topic == 'v1/devices/telemetry') {
        console.log(topic + '收到消息:' + msg)
        that.setData({
          mqValue : temp
        })
      }
    })

    if (typeof this.getTabBar === 'function' && this.getTabBar()) {
      this.getTabBar().setData({
        selected: 0
      })
    }
  },

  onWaterChange: function(event) {
    console.log(event.detail)
    let sw = event.detail.value
    // 要发布的主题
    let topicdown = `v1/devices/me/rpc/hardware`
    let wateroff = `{"params":{"WaterOutletSwitch":0},"version":"1.0.0"}`
    let wateron  = `{"params":{"WaterOutletSwitch":1},"version":"1.0.0"}`
    if (sw) {
      mqttClient.publish(topicdown, wateron, function (err) {
        if (!err) {
          console.log('成功下发命令 开始浇水!')
        }else {
          console.log('MQTT连接失败，未发送成功！')
        }
      })
    } else {
        mqttClient.publish(topicdown, wateroff, function (err) {
        if (!err) {
          console.log('成功下发命令 停止浇水!')
        }else {
          console.log('MQTT连接失败，未发送成功！')
        }
      })
    }
  },
})