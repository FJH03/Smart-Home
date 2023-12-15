var amapFile = require('../../utils/amap-wx.js');

Page({
  /**
   * 页面的初始数据
   */
  data: {
    gaode:{
      city: {text: "", data: ""},
      humidity: {text: "", data: ""},
      liveData: {province: "", city: "", adcode: "", weather: "", temperature: ""},
      temperature: {text: "", data: ""},
      weather: {text: "", data: ""},
      winddirection: {text: "", data: ""},
      windpower: {text: "", data: ""},
    }
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad() {
    var that = this;
    var myAmapFun = new amapFile.AMapWX({key:'81fea59d06f68c90005fa6385c819a04'});
    myAmapFun.getWeather({
      success: function(data){
        //成功回调
        console.log(data)
        that.setData({
          gaode: data
        });
      },
      fail: function(info){
        //失败回调
        console.log(info)
      }
    })
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow() {
    if (typeof this.getTabBar === 'function' &&
      this.getTabBar()) {
      this.getTabBar().setData({
        selected: 1
      })
    }
  },
})