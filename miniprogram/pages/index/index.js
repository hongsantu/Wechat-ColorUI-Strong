//index.js
//获取应用实例
const app = getApp()

Page({
  data: {
    StatusBar: app.globalData.StatusBar,
    CustomBar: app.globalData.CustomBar,
    PageCur: 'home',
    meObject:null
  },
  onLoad: function () {
  },
  NavChange(e) {
    if(e.currentTarget.dataset.cur == 'me'){
      if(this.data.meObject){
        this.data.meObject.lifeInit();
      }
    }
    this.setData({
      PageCur: e.currentTarget.dataset.cur
    })
  },
  jumpConduct(){
    wx.navigateTo({
      url: '/pages/record/conduct/conduct',
    })
  },
  onShow: function(){
    var that = this;
    this.setData({
      meObject:that.selectComponent("#meObject")
    })
  },
  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})
