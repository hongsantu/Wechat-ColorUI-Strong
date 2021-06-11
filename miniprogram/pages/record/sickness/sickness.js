// miniprogram/pages/record/sickness/sickness.js
const app = getApp();
import time from '../../../utils/TIME.js';
Page({

  /**
   * 页面的初始数据
   */
  data: {
    QueryData:{},
    haveNextPage: true,
    pageNum:0,
    pageSize:10,
    operationId:'',
    pickerDate:'',
    pickerTime:'',
    // 我好了Date
    ImOkId:'',
    otime:''
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
  },
  onShow: function(){
    this.StewSoup();
  },
  StewSoup(){
    app.wxc.loading();
    app.ReadyApp('',this).then((res) => {
      // 进行标签的初始化等待
      app.ReadyLabel(this).then((res) =>{
        app.wxc.hide();
        this.QueryData();
      })
    });
  },
  // 感觉应该先初始化标签。

  QueryData(){
    app.wxc.loading();
    app.db.collection('user_sickness').where({_openid:this.data.openId,del_status:0})
    .orderBy('occurrence_time', 'desc').skip((this.data.pageNum * this.data.pageSize)).limit(this.data.pageSize).get().then((res)=>{
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
      operationId:'',
      ImOkId:''
    })
  },
  removeRecord(){
    if(this.data.operationId){
      // 进行移除操作。
      this.setData({modalName: ''})
      app.wxc.loading("正在移除");
      app.db.collection("user_sickness").doc(this.data.operationId).update({
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
          QueryData:{}
        })
        this.QueryData();
      })
    }
  },
  iloadData(data){
    if(data){
      data.forEach(ele =>{
        ele.positionName = (this.data.BleedingSiteJSON[Number(ele.position)]).lab_value;
        ele.typeName = (this.data.BleedingTypeJSON[Number(ele.type)]).lab_value;
        ele.degreeName = ele.degree == undefined?'未设置':((this.data.BleedingDegreeJSON[Number(ele.degree)]).lab_value)
        ele.occurrence_time = this.rTime(ele.occurrence_time);
        (ele.recovery_time != undefined && ele.recovery_time != "" && ele.recovery_time != null)?(ele.recovery_time = this.rTime(ele.recovery_time)):(ele.recovery_time == "");
      })
      var that = this;
      let QueryData = that.data.QueryData;
      QueryData[that.data.pageNum] = data;
      this.setData({
        QueryData: QueryData,
        haveNextPage: (data.length>=that.data.pageSize)
      });
      app.wxc.hide();
    }
  },
  // 编辑事件
  editEvent(event){
    // 获取到index 。然后 找到对应的记录
    let id = event.currentTarget.dataset.id;
    wx.navigateTo({
      url: '/pages/record/conduct/conduct?id='+id+'&type=0',
    })
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
  rTime(date) {
    return app.FormatTime('yyyy-MM-dd hh:mm:ss',date);
  },
  
  // 移除当前页面去记录页面。
  goRecord(){
    wx.redirectTo({
      url: '/pages/record/conduct/conduct'
    })
  },
  ImOk(event){
    if(event.currentTarget.dataset.id){
      this.initNowTime();
      this.setData({
        modalName:'timeModel',
        ImOkId: event.currentTarget.dataset.id,
        otime:event.currentTarget.dataset.otime
      })
    }
  },    // 我好啦
  AMDYES(){
    if(this.data.ImOkId == ""){
      return;
    }
    app.wxc.loading();
    let recovery_time = new Date(this.data.pickerDate + ' '+ this.data.pickerTime);
    let recovery_spec = this.recoverySpecSet((this.data.otime).replace(/-/g, '/'),this.data.pickerDate + ' '+ this.data.pickerTime);
    app.db.collection('user_sickness').where({_id: this.data.ImOkId,_openid: this.data.openId}).update({
      data:{
        recovery_time:recovery_time,recovery_spec:recovery_spec
      }
    }).then(res =>{
      app.wxc.hide();
      if(res.errMsg == "collection.update:ok"){
        this.hideModal();
        app.wxc.msg("哈哈哈哈~");
        this.QueryData();
      }else{
        app.wxc.error();
      }
    })
  },
  initNowTime(date){
    // 初始化一个当前时间。
    let nowTime = (time.formatTime(date == undefined?(new Date()):date)).split(" ");
    this.setData({
      pickerDate: nowTime[0],
      pickerTime: nowTime[1]
    })
  },
  // 时间日期参数的定制。
  DateChange(e) {
    this.setData({
      pickerDate: (e.detail.value).replace(/-/g, '/'),
    })
  },
  TimeChange(e) {
    this.setData({
      pickerTime: (e.detail.value+':00'),
    })
  },    recoverySpecSet(begin,end){
    var date1 = new Date(begin);
    if(end){
        var date2 = new Date(end);
    }else{
        var date2 = new Date();
    }
    var ms = Math.abs(date1.getTime() - date2.getTime());
    var hm=1000;
    var mi=hm*60;
    var hh=mi*60;
    var dd=hh*24;
    var day= parseInt(ms/dd);
    var hour= parseInt((ms-day*dd)/hh);
    var minute = parseInt((ms - day * dd - hour * hh) / mi);  
    return day+"天"+hour+"小时"+minute+"分钟"
},
})