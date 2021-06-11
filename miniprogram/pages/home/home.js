// pages/home/home.js
import * as echarts from '../../ec-canvas/echarts';
import time from '../../utils/TIME.js';

const app = getApp();
// 颜色布局

// 出血部位百分比占比图。
var BleedingCharts = null;
function BleedingChartsOptions(list){
  var option = {
    backgroundColor: "#ffffff",
    color: app.globalData.colorList,
    series: [{
      label: {
        normal: {
          fontSize: 14
        }
      },
      type: 'pie',
      radius: '55%',
      center: ['50%', '50%'],
      data: list||[{value:100,name:'暂无数据'}],
      itemStyle:{
        normal:{
          label:{
            show:true,
            formatter: '{b} : {c}次\n ({d}%)',
          },
          labelLine :{show:true}
        }
      },
      
    }]
  };
  return option;
};
Component({
  options: {
    addGlobalClass: true
  },
  /**
   * 组件的属性列表
   */
  properties: {
  },

  /**
   * 组件的初始数据
   */
  data: {
    user_sickness:0,
    user_treatment:0,
    // 标签组
    BleedingCharts: {
      onInit: function(canvas, width, height, dpr){
        BleedingCharts = echarts.init(canvas, null, {
          width: width,
          height: height,
          devicePixelRatio: dpr // new
        });
        canvas.setChart(BleedingCharts);
        BleedingCharts.setOption(BleedingChartsOptions());
      }
    },
    sickNessNEW:null,
    ForrestGump:[
      "Life was like a box of chocolate, you never know what you're gonna get.",
      "Miracles happen every day.",
      "Stupid is as stupid does.",
      "There is one small step for man, a giant leap for mankind.",
      "I am a man of my word.",
      "There is only so much of fortunea man really needs, and the rest is just for showing off.",
      "Don't you be afraid, sweetheart.",
      "You’ve got to put the past behind you before you can move on.",
      "Aren’t I going to be me?",
      "There is only so much of fortunea man really needs, and the rest is just for showing off.",
    ],
    pickerDate:'',
    pickerTime:'',
    echartsH:500
  },

  /**
   * 组件的方法列表
   */
  methods: {
    StewSoup(){
      app.wxc.loading();
      app.ReadyApp('',this).then((res) => {
        app.ReadyLabel(this).then((res) =>{
          // 标签初始化完毕
            app.wxc.hide();
            this.getRecordTotal();
            this.getNewSickNessMsg();
        })
      });
    },
    // 获取有多少条
    getRecordTotal(){
      app.db.collection('user_sickness').where({_openid:this.data.openId,del_status:0}).count().then((res)=>{
        if(this.data.user_sickness != res.total){
          this.GetBleedingSiteEchartsData();
        }
        this.setData({
          'user_sickness': res.total
        })
      });
      app.db.collection('user_treatment').where({_openid:this.data.openId,del_status:0}).count().then((res)=>{
        this.setData({
          'user_treatment': res.total
        })
      });
    },
    // 获取比例标签数
    GetBleedingSiteEchartsData(){
      app.wxc.loading("正在计算数据");
      app.db.collection('user_sickness').aggregate().match({
        del_status: 0,
        _openid: this.data.openId
      }).group({
        // 按 category 字段分组
        _id: '$position',
        num: app.db.command.aggregate.sum(1)
      }).end().then((res)=>{
        if(res.errMsg == 'collection.aggregate:ok'){
          res.list.forEach(ele =>{
            ele.name = (this.data.BleedingSiteJSON[Number(ele._id)]).lab_value;
            ele.value = ele.num;
          })
          setTimeout(()=>{
            app.wxc.hide();
            BleedingCharts.clear()
            BleedingCharts.setOption(BleedingChartsOptions(res.list));
          },500)
        }
      })
    },
    // 获取最新的一条出血记录
    getNewSickNessMsg(){
      app.db.collection('user_sickness').where({del_status: 0,_openid: this.data.openId}).orderBy('occurrence_time', 'desc')
          .limit(1).get().then(res =>{
            if(res.errMsg == "collection.get:ok"){
              if(res.data.length>0){
                let ele = res.data[0];
                ele.positionName = (this.data.BleedingSiteJSON[Number(ele.position)]).lab_value;
                ele.typeName = (this.data.BleedingTypeJSON[Number(ele.type)]).lab_value;
                ele.degreeName = ele.degree == undefined?'未设置':((this.data.BleedingDegreeJSON[Number(ele.degree)]).lab_value)
                ele.occurrence_time = this.rTime(ele.occurrence_time);
                (ele.recovery_time != undefined && ele.recovery_time != "" && ele.recovery_time != null)?(ele.recovery_time = this.rTime(ele.recovery_time)):(ele.recovery_time == "");
                ele.agan = this.data.ForrestGump[(Math.floor( Math.random()*10 ))];
                this.setData({
                  sickNessNEW: ele
                })
              }
            }
          })
    },
    // 我好啦
    AMDYES(){
      app.wxc.loading();
      let recovery_time = new Date(this.data.pickerDate + ' '+ this.data.pickerTime);
      let recovery_spec = this.recoverySpecSet((this.data.sickNessNEW.occurrence_time).replace(/-/g, '/'),this.data.pickerDate + ' '+ this.data.pickerTime);
      app.db.collection('user_sickness').where({_id: this.data.sickNessNEW._id,_openid: this.data.sickNessNEW.openId}).update({
        data:{
          recovery_time:recovery_time,recovery_spec:recovery_spec
        }
      }).then(res =>{
        app.wxc.hide();
        if(res.errMsg == "collection.update:ok"){
          this.hideModal();
          app.wxc.msg("哈哈哈哈~");
        }else{
          app.wxc.error();
        }
        this.getNewSickNessMsg();
      })
    },
    recoverySpecSet(begin,end){
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
    ImOk(){
      this.initNowTime();
      this.setData({
        modalName:'Modal',
        echartsH:0
      })
    },
    hideModal(){
      this.setData({
        modalName:'',
        echartsH:500
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
    },
    rTime(date) {
      return app.FormatTime('yyyy-MM-dd hh:mm:ss',date);
    },
    goSicknessPage(){
      wx.navigateTo({
        url: '/pages/record/sickness/sickness',
      })
    },
    goTreatmentPage(){
      wx.navigateTo({
        url: '/pages/record/treatment/treatment',
      })
    },
  },
  pageLifetimes:{
    show: function() {
      this.StewSoup();
    }
  },
})
