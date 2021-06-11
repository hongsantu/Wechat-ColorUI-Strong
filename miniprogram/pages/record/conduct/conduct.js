// miniprogram/pages/record/conduct/conduct.js
const app = getApp();
import time from '../../../utils/TIME.js';
Page({

  /**
   * 页面的初始数据
   */
  data: {
    TabCur: 0,
    scrollLeft:0,
    navItem:[{id:0,navName:'出血记录',icon:'write'},{id:1,navName:'预防记录',icon:'lightauto'}],
    StatusOfTheWeek:[{_id:0,name:'没出血'},{_id:1,name:'出血了'}],
    // 两个增加的form
    // 编辑出血记录用的ID
    BleedingId:'',
    BleedingForm:{
      position: 0,
      type:0,
      degree:0,
      occurrence_time:'',
      programme:'',
      note:'',
      del_status:0,
      // 增加一个康复时间。
      recovery_time:'',
      // 一个时间段的描述
      recovery_spec:''
    },
    PreventionForm:{
      dose: 0, //剂量
      status: 0, //1 出血 0 未出血
      inject_time:'', //注射时间
      note:'', //治疗备注
      del_status: 0
    },
    pickerDate:'',
    pickerTime:'',
    // 是否是编辑模式
    editModel:false
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    app.wxc.loading();
    app.ReadyLabel(this).then((res) =>{
      // 标签初始化完毕
        app.wxc.hide();
        this.initPickerData();
        this.initNowTime();
      // 查看一下optons
      if(options.type){
        var that = this;
        let type = options.type;
        if(type == 0){
          // 出血记录编辑模式
          this.setData({
            TabCur:0,
            scrollLeft: -60,
            BleedingId:options.id,
            editModel: true,
            navItem:[{id:0,navName:'出血记录',icon:'write'}],
          },()=>{
            that.editBeedingForm();
          })
        }
        if(type == 1){
          // 其他的编辑模式

        }
      }
    })
  },

  // 提交Form
  submitForm(e){
    app.wxc.loading();
    switch(e.currentTarget.dataset.type){
      case 'BleedingForm':
        let BleedingForm = this.data.BleedingForm;
        BleedingForm.occurrence_time = new Date(this.data.pickerDate + ' '+ this.data.pickerTime);
        // 进行提交；
        app.db.collection('user_sickness').add({
          // data 字段表示需新增的 JSON 数据
          data: BleedingForm
        })
        .then(res => {
          app.wxc.hide();
          if(res.errMsg == 'collection.add:ok'){
            wx.navigateBack({
              delta: 1,
            })
          }else{
            app.wxc.error();
          }
        })
        break;
      case 'PreventionForm':
        let PreventionForm = this.data.PreventionForm;
        PreventionForm.inject_time =  new Date(this.data.pickerDate + ' '+ this.data.pickerTime);
        // 进行提交；
        app.db.collection('user_treatment').add({
          // data 字段表示需新增的 JSON 数据
          data: PreventionForm
        })
        .then(res => {
          app.wxc.hide();
          if(res.errMsg == 'collection.add:ok'){
            wx.navigateBack({
              delta: 1,
            })
          }else{
            app.wxc.error();
          }
        })
        break;
    }
  },
  editForm(e){
    app.wxc.loading();
    switch(e.currentTarget.dataset.type){
      case 'BleedingForm':
        // 进行更新操作
        let BleedingForm = this.data.BleedingForm;
        BleedingForm.occurrence_time = new Date(this.data.pickerDate + ' '+ this.data.pickerTime);
        app.db.collection('user_sickness').where({_id: this.data.BleedingId}).update({
          data: BleedingForm
        }).then(res =>{
          app.wxc.hide();
          if(res.errMsg == "collection.update:ok"){
            wx.navigateBack({
              delta: 1,
            })
          }else{
            app.wxc.error();
          }
        })
        break;
    }

  },
  // 重置Form
  resetForm(e){
    switch(e.currentTarget.dataset.type){
      case 'BleedingForm':
        this.setData({
          BleedingForm:{position:0,type:0,degree:0,occurrence_time:'',programme:'',note:'',del_status:0}
        })
        this.initPickerData();
        break;
      case 'PreventionForm':
        this.setData({
          PreventionForm:{dose:0,status:0,inject_time:'',note:'',del_status:0}
        })
        break;
    }
    this.initNowTime();
  },
  // input方法
  bindTextAreaInput(e){
    switch (e.currentTarget.dataset.type) {
      case 'BleedingProgramme':
        this.setData({
          'BleedingForm.programme':e.detail.value
        })
        break;
      case 'BleedingNote':
        this.setData({
          'BleedingForm.note':e.detail.value
        })
        break;
      case 'PreventionNote':
        this.setData({
          'PreventionForm.note':e.detail.value
        })
        break;
      default:
        break;
    }
  },
  initPickerData(){
    var that = this;
    if(this.data.BleedingSite.length > 0){
      this.setData({
        'BleedingForm.position':that.data.BleedingSite[0]._id
      })
    }
    if(this.data.BleedingType.length > 0){
      this.setData({
        'BleedingForm.type':that.data.BleedingType[0]._id
      })
    }
    if(this.data.BleedingDegree.length > 0){
      this.setData({
        'BleedingForm.degree':that.data.BleedingDegree[0]._id
      })
    }
    
  },
  // 出血部位变动
  BleedingSiteChange(e){
    this.setData({
      'BleedingForm.position':e.currentTarget.dataset.id
    })
  },
  BleedingTypeChange(e){
    this.setData({
      'BleedingForm.type':e.currentTarget.dataset.id
    })
  },
  BleedingDegreeChange(e){
    this.setData({
      'BleedingForm.degree':e.currentTarget.dataset.id
    })
  },
  PreventionStatusChange(e){
    this.setData({
      'PreventionForm.status':e.currentTarget.dataset.id
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
      pickerTime: e.detail.value,
    })
  },
  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {

  },

  
  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },
  editBeedingForm(){
    if(this.data.BleedingId == ''){
      return;
    }
    app.wxc.loading();
    // 查询
    app.db.collection('user_sickness').where({_id: this.data.BleedingId}).field({
      _id: false,
      _openid: false
    }).get().then(res =>{
      if(res.errMsg == 'collection.get:ok'){
        if(res.data.length > 0){
          let BleedingForm = this.data.BleedingForm;
          let data = res.data[0];
          for(var key in data){
            BleedingForm[key] = data[key]
          }
          this.initNowTime(BleedingForm.occurrence_time);
          this.setData({
            BleedingForm: BleedingForm
          })
          app.wxc.hide();
        }
      }
    })

  },
  tabSelect(e) {
    this.initNowTime();
    this.setData({
      TabCur: e.currentTarget.dataset.id,
      scrollLeft: (e.currentTarget.dataset.id-1)*60
    })
  },
  doseInput(e){
    this.setData({
      'PreventionForm.dose': e.detail.value
    })
  },
})