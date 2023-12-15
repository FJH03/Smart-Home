var amapFile = require('../../utils/amap-wx.js');//如：..­/..­/libs/amap-wx.js
var markersData = [];

Page({
  data: {
    markers: [],
    latitude: '',
    longitude: '',
    textData: {}
  },
  makertap: function(e) {
    var id = e.markerId;
    var that = this;
    that.showMarkerInfo(markersData,id);
    that.changeMarkerColor(markersData,id);
  },
  onLoad: function() {
    var that = this;
    var myAmapFun = new amapFile.AMapWX({key:'50aa48cd5ec7067c1ab2b32f3cb43b07'});

    myAmapFun.getPoiAround({
      iconPathSelected: '../image/marker_checked.png', //如：..­/..­/img/marker_checked.png
      iconPath: '../image/marker.png', //如：..­/..­/img/marker.png
      success: function(data){
        console.log( data.markers);
        markersData = data.markers;
        that.setData({
        //  markers: markersData
        });
        that.setData({
          latitude: markersData[0].latitude
        });
        that.setData({
          longitude: markersData[0].longitude
        });
        that.showMarkerInfo(markersData,0);
      },
      fail: function(info){
        wx.showModal({title:info.errMsg})
      }
    })
  },
  showMarkerInfo: function(data,i){
    var that = this;
    that.setData({
      textData: {
        name: data[i].name,
        desc: data[i].address
      }
    });
  },
  changeMarkerColor: function(data,i){
    var that = this;
    var markers = [];
    for(var j = 0; j < data.length; j++){
      if(j==i){
        data[j].iconPath = "../image/marker_checked.png"; //如：../image/marker_checked.png
      }else{
        data[j].iconPath = "../image/marker.png"; //如：../image/marker.png
      }
      markers.push(data[j]);
    }
    that.setData({
      markers: markers
    });
  },
  /**
   * 生命周期函数--监听页面显示
   */
  onShow() {
   
    if (typeof this.getTabBar === 'function' &&
      this.getTabBar()) {
      this.getTabBar().setData({
        selected: 2
      })
    }
  },
})