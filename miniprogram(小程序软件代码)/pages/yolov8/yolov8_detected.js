const app = getApp()
const localip = app.globalData.ip

Page({
  statechange(e) {
    console.log('live-player code:', e.detail.code)
  },
  error(e) {
    console.error('live-player error:', e.detail.errMsg)
  },
  data: {
    modelList: [
      { name: 'yolov8n.pt', comment: 'YOLOV8n_物体识别' },
      { name: 'yolov8n-seg.pt', comment: 'YOLOV8n_实例分割' },
      { name: 'yolov8n-pose.pt', comment: 'YOLOV8n_姿态检测' },
      { name: 'refuse-classification.pt', comment: 'YOLOV8n_自训练模型_垃圾分类' },
      { name: 'fire_prev.pt', comment: 'YOLOV8n_自训练模型_火灾检测' },
      { name: 'face_mask.pt', comment: 'YOLOV8n_自训练模型_口罩检测' }
    ],
    modeltemp: null,
    selectedModelIndex: 0,
    aspectRatio: '',
    avatarUrl: '../image/yolov8.jpg',
    Resultdata: [],
  },
  
  onLoad() {
    let that = this
    that.setData({
      modeltemp: that.data.modelList.map(item => item.comment)
    })
  },

  getFlvVideoStream: function () {
    console.log('开始发起请求获取 FLV 视频流');
    wx.navigateTo({
      url: '../out/out'
    })
  },

  showModelList: function(e) {
    let that = this
    const index = e.detail.value;
    const selectedModelIndex = index;
    // 在这里可以执行选择模型后的操作
    that.sendSelectedModelToBackend(selectedModelIndex)
  },

  sendSelectedModelToBackend: function(selectedModelIndex) {
    let that = this
    const modelList = that.data.modelList;
    const selectedModel = modelList[selectedModelIndex].name;

    wx.request({
      url: 'http://' + localip + ':5000/change-model',
      method: 'POST',
      data: {
        model: selectedModel
      },
      success: (res) => {
        console.log(res)
        wx.showToast({
          title: '模型切换成功',
          icon: 'success',
          duration: 2000
        });
        that.setData({
          selectedModelIndex: selectedModelIndex
        });
      },
      fail: (err) => {
        console.log(err)
        wx.showToast({
          title: err.errMsg,
          icon: 'error',
          duration: 2000
        });
      }
    });
  },

  chooseimg: function () {
    var that = this;
    wx.chooseImage({
      count: 1,
      sizeType: ['original', 'compressed'],
      sourceType: ['album', 'camera'],
      success(res) {
        var tempFilePaths = res.tempFilePaths;
        that.setData({
          avatarUrl: tempFilePaths[0]
        });
        console.log(tempFilePaths[0]);
        wx.setStorage({
          key: 'img_path',
          data: tempFilePaths[0]
        });
      }
    });
  },

  submitimg: function () {
    var that = this;
    var img_path = wx.getStorageSync('img_path');
    var imgtype;
    wx.getImageInfo({
      src: img_path,
      success(res) {
        var width = res.width
        var height = res.height
        that.aspectRatio = width / height;
        imgtype = res.type;
        console.log(imgtype)
        
        wx.uploadFile({
          filePath: img_path,
          name: 'image',
          url: 'http://' + localip + ':5000/detected',
          method: 'POST',
          success(res) {
            var img_data = JSON.parse(res.data).data.image;
            var base64str_img = 'data:image/' + imgtype + ';base64,' + img_data;

            var resultarr = []
            var tempdata = JSON.parse(res.data).data.Result.num
            console.log(tempdata)
            for (var key in tempdata) {
              resultarr.push({ name: key, num: tempdata[key] })
            }
            that.setData({
              avatarUrl: base64str_img,
              Resultdata: resultarr
            })
            wx.showToast({
              title: '处理成功',
              icon: 'success',
              duration: 2000
            })
          },

          fail(err) {
            console.log(err);
            wx.showToast({
              title: err.errMsg,
              icon: 'none',
              duration: 2000
            });
          }
        });
      }
    });
  },
});