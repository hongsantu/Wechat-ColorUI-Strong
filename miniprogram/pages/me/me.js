// pages/me/me.js
const app = getApp();
Component({
  options: {
    addGlobalClass: true
  },
  /**
   * 组件的属性列表
   */
  properties: {},

  /**
   * 组件的初始数据
   */
  data: {
    userInfo: {},
    hasUserInfo: false
  },

  /**
   * 组件的方法列表
   */
  methods: {
    initUser: function(){
      app.wxc.loading();
      var that = this;
      app.ReadyApp('userInfo',this).then((res) => {
        if(res == 1){
          // 授权完成了；
          if (app.globalData.userInfo) {
            that.setData({
              userInfo: app.globalData.userInfo,
              hasUserInfo: true
            })
          }
        }
        app.wxc.hide();
      })
    },
    getUserInfo: function (e) {
      console.log(e)
      app.globalData.userInfo = e.detail.userInfo;
      app.UserScope = 1;
      this.setData({
        userInfo: e.detail.userInfo,
        hasUserInfo: true
      })
    },
    // 跳转到About
    jumpAbout(){
      wx.navigateTo({
        url: '/pages/me/about/about',
      })
    },
    lifeInit(){
      if(!this.data.hasUserInfo){
        this.initUser();
      }
    },
  },
  lifetimes: {
    // 生命周期函数，可以为函数，或一个在methods段中定义的方法名
    attached: function() {
      this.initUser();
    },
    moved: function() {},
    detached: function() {},
  },
})