const app = getApp();
Component({
  /**
   * 组件的一些选项
   */
  options: {
    addGlobalClass: true,
    multipleSlots: true
  },
  /**
   * 组件的对外属性
   */
  properties: {
    bgColor: {
      type: String,
      value: ''
    }, 
    isCustom: {
      type: [Boolean, String],
      value: false
    },
    needBack: {
      type: [Boolean, String],
      value: true
    },
    needHome: {
      type: [Boolean, String],
      value: true
    },
    isBack: {
      type: [Boolean, String],
      value: false
    },
    bgImage: {
      type: String,
      value: ''
    },
  },
  /**
   * 组件的初始数据
   */
  data: {
    StatusBar: app.globalData.StatusBar,
    CustomBar: app.globalData.CustomBar,
    Custom: app.globalData.Custom
  },
  /**
   * 组件的方法列表
   */
  methods: {
    BackPage() {
      wx.navigateBack({
        delta: 1,
        fail: function (res) {
          wx.reLaunch({
            url: '/pages/index/index',
          })
        }
      });
    },
    toHome(){
      wx.reLaunch({
        url: '/pages/index/index',
      })
    }
  }
})