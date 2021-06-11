var WrittenRecords = ['正在煲汤','正在炒菜','西红柿鸡蛋','正在吃饭','游戏中','Q我吧','哈拉少','奥里给','Strong','AILOLI'];

function loading(msg){
  // msg = msg == undefined?(WrittenRecords[(Math.floor( Math.random()*10 ))]):msg;
  msg = msg == undefined?'loading':msg;
  wx.showLoading({
    title: msg,
    mask: true
  })
};
function hide(){
  wx.hideLoading()
};
function msg(msg){
  wx.showToast({
    title: msg == undefined?'不知道想说什么':msg,
    icon:'none',
    duration:2500
  })
};
function error(){
  wx.showToast({
    title: '发生了未知问题',
    duration:2500,
    icon:'none'
  })
}
module.exports = {
  loading:loading,
  hide:hide,
  msg:msg
}