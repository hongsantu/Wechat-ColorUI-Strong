// miniprogram/pages/me/about/about.js
const app = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    _talkUser:'',
    _thanks:''
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.initYunDB();
  },
  initYunDB(){
    if(null == app.db){
      app.db = wx.cloud.database();
    }
    // 请求关于参数
    this.GetInformationAbout();
  },
  GetInformationAbout(){
    app.wxc.loading('获取关于信息');
    app.db.collection('sys_param').doc('me_about').get().then(res => {
      this.setData({
        '_talkUser': res.data._talkUser,
        '_thanks': res.data._thanks
      })
      app.wxc.hide();
    })
  },
  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {

  }
})