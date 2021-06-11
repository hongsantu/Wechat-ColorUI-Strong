// miniprogram/pages/record/sickness/sickness.js
const app = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    QueryData:[],
    haveNextPage: true,
    pageNum:0,
    pageSize:10,
    operationId:''
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.StewSoup();
  },
  StewSoup(){
    app.wxc.loading();
    app.ReadyApp('',this).then((res) => {
      app.wxc.hide();
      this.QueryData();
    });
  },
  // 感觉应该先初始化标签。

  QueryData(){
    app.wxc.loading();
    app.db.collection('user_treatment').where({_openid:this.data.openId,del_status:0})
    .orderBy('inject_time', 'desc').skip((this.data.pageNum * this.data.pageSize)).limit(this.data.pageSize).get().then((res)=>{
      if(res.errMsg == 'collection.get:ok'){
        this.iloadData(res.data);
      }
    })
  },
  longTach(e){
    var id = e.currentTarget.dataset.id;
    if(id){
      this.setData({
        modalName:'Modal',
        operationId:id
      })
    }
  },
  hideModal(){
    this.setData({
      modalName: '',
      operationId:''
    })
  },
  removeRecord(){
    if(this.data.operationId){
      // 进行移除操作。
      this.setData({modalName: ''})
      app.wxc.loading("正在移除");
      app.db.collection("user_treatment").doc(this.data.operationId).update({
        data:{
          del_status:1
        }
      }).then((res)=>{
        app.wxc.hide();
        app.wxc.msg("移除完成");
        // 移除清空，再查询。
        this.setData({
          operationId:'',
          pageNum:0,
          QueryData:[]
        })
        this.QueryData();
      })
    }
  },
  iloadData(data){
    if(data){
      data.forEach(ele =>{
        ele.statusName = (ele.status == 0?'未出血':'出血了');
        ele.inject_time = app.FormatTime('yyyy-MM-dd hh:mm:ss',ele.inject_time);
      })
      var that = this;
      this.setData({
        QueryData: that.data.QueryData.concat(data),
        haveNextPage: (data.length>=that.data.pageSize)
      });
      app.wxc.hide();
    }
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {
    if(this.data.haveNextPage){
      var that = this;
      this.setData({
        pageNum: that.data.pageNum + 1
      },()=>{
        that.QueryData();
      })
    }else{
      app.wxc.msg("到底啦~");
    }
  },
  // 移除当前页面去记录页面。
  goRecord(){
    wx.redirectTo({
      url: '/pages/record/conduct/conduct'
    })
  },
})