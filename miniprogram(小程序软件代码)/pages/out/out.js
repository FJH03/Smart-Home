const app = getApp()
const localip = app.globalData.ip

Page({
  /**
   * 页面的初始数据
   */
  data: {
    videosrc:'http://' + localip + ':5000/'
  },
})