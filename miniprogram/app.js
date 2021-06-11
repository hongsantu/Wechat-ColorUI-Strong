//app.js
import wxc from 'utils/WXC.js';
App({
  wxc: wxc,
  db: null,
  onLaunch: function () {
    this.initCloud();
    this.updateTheApp();
    this.getUserInfo();
    this.getSystemInfo();
    this.GetPublicLabel();
  },
  initCloud() {
    wx.cloud.init({
      traceUser: true,
    });
    wx.cloud.callFunction({
      name: 'login',
      data: {},
      success: res => {
        this.globalData.openId = res.result.openid;
      },
      fail: err => {
      }
    })
  },
  // 用来验证是否已经获取到openId. 虽然很快但总要有个验证的地方，防止以为。
  appGrantInter: '',
  // 需要一个类型字段。type 默认是判断openId,不默认的是判断是否有userInfo
  ReadyApp(type, pageObject) {
    var _this = this;
    if (_this.appGrantInter) {
      clearInterval(_this.appGrantInter);
      _this.appGrantInter = '';
    }
    return new Promise((resolve, reject) => {
      // 字段验证
      if (pageObject.data.ReadyApp) {
        resolve(0);
      }
      var that = _this;
      var setInter = setInterval(
        function () {
          if ('userInfo' == type) {
            if (that.UserScope != 0) {
              clearInterval(that.appGrantInter);
              resolve(that.UserScope);
            }
          } else {
            if (that.globalData.openId != null) {
              if (pageObject) {
                pageObject.setData({
                  openId: that.globalData.openId,
                  ReadyApp: true
                })
              }
              clearInterval(that.appGrantInter);
              resolve(that.globalData.openId);
            }
          }
        }
        , 500);
      that.appGrantInter = setInter;
    })
  },
  // 初始化全局应用标签？？？？
  appLabelInter: '',
  ReadyLabel(pageObject) {
    var _this = this;
    if (_this.appLabelInter) {
      clearInterval(_this.appLabelInter);
      _this.appLabelInter = '';
    }
    return new Promise((resolve) => {
      if (pageObject.data.ReadyLabel) {
        resolve(0)
      }
      var that = _this;
      var setInter = setInterval(
        function () {
          if (that.globalData.BleedingSiteJSON != null) {
            clearInterval(that.appLabelInter);
            if (pageObject) {
              pageObject.setData({
                BleedingSite: that.globalData.BleedingSite,
                BleedingType: that.globalData.BleedingType,
                BleedingDegree: that.globalData.BleedingDegree,
                BleedingSiteJSON: that.globalData.BleedingSiteJSON,
                BleedingTypeJSON: that.globalData.BleedingTypeJSON,
                BleedingDegreeJSON: that.globalData.BleedingDegreeJSON,
                ReadyLabel: true
              })
            }
            resolve({
              BleedingSite: that.globalData.BleedingSite,
              BleedingType: that.globalData.BleedingType,
              BleedingDegree: that.globalData.BleedingDegree,
              BleedingSiteJSON: that.globalData.BleedingSiteJSON,
              BleedingTypeJSON: that.globalData.BleedingTypeJSON,
              BleedingDegreeJSON: that.globalData.BleedingDegreeJSON
            });
          }
        }
        , 500);
      that.appLabelInter = setInter;
    })
  },
  UserScope: 0, //0 等待告知  1 授权完成  2 未授权
  getUserInfo: function () {
    // 获取用户信息
    wx.getSetting({
      success: res => {
        if (res.authSetting['scope.userInfo']) {
          // 已经授权，可以直接调用 getUserInfo 获取头像昵称，不会弹框
          wx.getUserInfo({
            success: res => {
              this.globalData.userInfo = res.userInfo;
              this.UserScope = 1;
            }
          })
        } else {
          this.UserScope = 2;
        }
      }
    })
  },

  // 获取系统状态栏信息
  getSystemInfo() {
    wx.getSystemInfo({
      success: e => {
        this.globalData.StatusBar = e.statusBarHeight;
        let capsule = wx.getMenuButtonBoundingClientRect();
        if (capsule) {
          this.globalData.Custom = capsule;
          this.globalData.CustomBar = capsule.bottom + capsule.top - e.statusBarHeight;
        } else {
          this.globalData.CustomBar = e.statusBarHeight + 50;
        }
      }
    })
  },
  // 获取一个全局的标签的信息
  GetPublicLabel() {
    if (null == this.db) {
      this.db = wx.cloud.database();
    }
    this.db.collection('public_label').get().then(res => {
      let BleedingSite = [];
      let BleedingType = [];
      let BleedingDegree = [];
      if (res.data.length > 0) {
        res.data.forEach(element => {
          switch (element.lab_type) {
            case '1':
              BleedingSite.push(element);
              break;
            case '2':
              BleedingType.push(element);
              break;
            case '3':
              BleedingDegree.push(element);
              break;
          }
        })
      }
      this.globalData.BleedingSite = BleedingSite;
      this.globalData.BleedingType = BleedingType;
      this.globalData.BleedingDegree = BleedingDegree;
      this.changeBleedingSiteToJSON();
    })
  },
  // 定制一个JSON格式的标签
  // 把标签改变成一个JSON格式的 用来匹配对应的Name
  changeBleedingSiteToJSON() {
    var BleedingDegreeJSON = {};
    if (this.globalData.BleedingDegree.length > 0) {
      this.globalData.BleedingDegree.forEach(ele => {
        BleedingDegreeJSON[ele._id] = ele;
      })
    }
    this.globalData.BleedingDegreeJSON = BleedingDegreeJSON;

    var BleedingTypeJSON = {};
    if (this.globalData.BleedingType.length > 0) {
      this.globalData.BleedingType.forEach(ele => {
        BleedingTypeJSON[ele._id] = ele;
      })
    }
    this.globalData.BleedingTypeJSON = BleedingTypeJSON;

    var BleedingSiteJSON = {};
    if (this.globalData.BleedingSite.length > 0) {
      this.globalData.BleedingSite.forEach(ele => {
        BleedingSiteJSON[ele._id] = ele;
      })
    }
    this.globalData.BleedingSiteJSON = BleedingSiteJSON;
  },
  // 获取用户的OPENID
  globalData: {
    userInfo: null,
    openId: null,
    // 这里是公共的标签信息
    BleedingSite: null,
    BleedingType: null,
    BleedingDegree: null,
    BleedingSiteJSON: null,
    BleedingTypeJSON: null,
    BleedingDegreeJSON: null,
    colorList: ['#1cbbb4', '#f37b1d', '#fbbd08', '#8dc63f', '#39b54a', '#0081ff', '#9c26b0', '#a5673f', '#e03997', '#333333']
  },
  // 格式化时间
  FormatTime(t, date) {
    var date = new Date(date);
    var o = {
      "M+": date.getMonth() + 1,                 //月份
      "d+": date.getDate(),                    //日
      "h+": date.getHours(),                   //小时
      "m+": date.getMinutes(),                 //分
      "s+": date.getSeconds(),                 //秒
      "q+": Math.floor((date.getMonth() + 3) / 3), //季度
      "S": date.getMilliseconds()             //毫秒
    };
    if (/(y+)/.test(t)) {
      t = t.replace(RegExp.$1, (date.getFullYear() + "").substr(4 - RegExp.$1.length));
    };
    for (var k in o) {
      if (new RegExp("(" + k + ")").test(t)) {
        t = t.replace(RegExp.$1, (RegExp.$1.length == 1) ? (o[k]) : (("00" + o[k]).substr(("" + o[k]).length)));
      };
    }
    return t;
  },
  // 检查更新
  updateTheApp(){
    if (wx.canIUse('getUpdateManager')) {
      const updateManager = wx.getUpdateManager()
      updateManager.onCheckForUpdate(function (res) {
        // 请求完新版本信息的回调
        if (res.hasUpdate) {
          updateManager.onUpdateReady(function () {
            wx.showModal({
              title: '更新提示',
              content: '新版本已经准备好，是否重启应用？',
              success: function (res) {
                if (res.confirm) {
                  // 新的版本已经下载好，调用 applyUpdate 应用新版本并重启
                  updateManager.applyUpdate()
                }
              }
            })
          })
          updateManager.onUpdateFailed(function () {
            // 新的版本下载失败
            wx.showModal({
              title: '已经有新版本了哟~',
              content: '新版本已经上线啦~，请您删除当前小程序，重新搜索打开哟~'
            })
          })
        }
      })
    }
  }
})
