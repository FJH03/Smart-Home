// pages/my-com/my-com.js
Component({
  /**
   * 组件的属性列表
   */
  properties: {
  
  },
  
  created() {

  },
  /**
   * 组件的初始数据
   */
  data: {
    d1src : '/pages/image/0102.png',
    d2src : '/pages/image/0102.png',
    d3src : '/pages/image/0102.png',
    d4src : '/pages/image/0101.png',
    d5src : '/pages/image/0102.png',
    d6src : '/pages/image/0102.png',
    d7src : '/pages/image/0102.png',
    d8src : '/pages/image/0102.png',
    d1class : false,
    d2class : false,
    d3class : false,
    d4class : false,
    d5class : false,
    d6class : false,
    d7class : false,
    d8class : false
  },

  /**
   * 组件的方法列表
   */
  methods: {
    Ond1: function (event) {
      console.log(event.detail.value)
    }
  }
})
