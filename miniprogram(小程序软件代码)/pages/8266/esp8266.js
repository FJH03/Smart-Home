const app = getApp()
const mqttClient = app.globalData.mqttClient

const deviceConfig = {
  deviceName: "ESP8266",
};

Page({
  /**
   * 页面的初始数据
   */
  data: {
    pindata:{
      d1: 0,
      d2: 0,
      d3: 1,
      d4: 1,
      d5: 1,
      d6: 0,
      d7: 1,
      d8: 0
    },
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad() {
   this.init()
  },
  /*
   * 生命周期函数--监听页面显示
   */
  onShow() {
    let that = this
    mqttClient.on('message', function (topic, message) {
      let msg = message.toString();
      let temp = JSON.parse(msg);
      //解析json数据
      if(topic == 'pindata') {
        console.log(topic + '收到消息:' + msg)
        that.setData({
          pindata : temp
        })
      }
      this.init()
    })
  },

  init: function() {
    let that = this
    var tp = that.selectComponent('#my-com')
    let pindata = that.data.pindata

    for(let pin in pindata) {
      console.log(pindata[pin])
      let tempstring = pin + 'src'
      let tempstring1 = pin + 'class'

      if(pindata[pin] == 1) {
        tp.setData({
          [tempstring1] : true
        })

        if(pin != 'd4') {
          tp.setData({
            [tempstring] : '/pages/image/0102-on.png',
          })
        } else{
           tp.setData({
             [tempstring] : '/pages/image/0101-on.png',
           })
         }
        } else {
          tp.setData({
            [tempstring1] : false
          })
          if(pin != 'd4') {
            tp.setData({
              [tempstring] : '/pages/image/0102.png',
            })
          } else {
            tp.setData({
            [tempstring] : '/pages/image/0101.png',
            })
          }
        }
      }
  }
})