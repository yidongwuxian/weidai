// pages/updateRefresh/updateRefresh.js
const Util = require( '../../utils/util.js' )
const app = getApp()
Page({
  data:{
    keyWord: [],
    windowHeight: 0,//获取屏幕高度  
    refreshHeight: 0,//获取高度  
    refreshing: false,//是否在刷新中  
    refreshAnimation: {}, //加载更多旋转动画数据  
    clientY: 0,//触摸时Y轴坐标  
  },
  onLoad:function(options){
    const that = this
    const param = {}
    //初始获取省份数据
    Util.request('ldd/adocdome/getprovince', param, function(data){
        that.setData({
            dataCode: data.extension
        })
    })
    //获取屏幕高度  
    wx.getSystemInfo({  
      success: function (res) {  
        that.setData({  
          windowHeight: res.windowHeight  
        })  
        console.log("屏幕高度: " + res.windowHeight)  
      }  
    }) 
  },
  scroll: function () {  
    console.log("滑动了...")  
  }, 
  lower: function () {  
    var start = 0;  
    start += 1;  
    console.log("加载了...")  
    var that = this;  
    Util.request('ldd/adocdome/getprovince', {key: '77f072d28eb141c8b6dda145ca364b92', keyWord: '好', page: start  }, function(data){ 
          var words = that.data.dataCode.concat(data.extension);  
          that.setData({  
            dataCode: words  
          })  
    })  
  },  
  upper: function () {  
    var that = this; 
    console.log("下拉了....")  
    //获取用户Y轴下拉的位移  
    if (that.data.refreshing) return;  
    that.setData({ 
      refreshing: true 
    });  
    updateRefreshIcon.call(this);   
    Util.request('ldd/adocdome/getprovince', {}, function(data){
      setTimeout(function () {  
        that.setData({  
          dataCode: data.extension,
          refreshing: false    
        })  
      }, 1000)         
    })  
  },
  start: function (e) { 
    var that = this;  
    var startPoint = e.touches[0]  
    var clientY = startPoint.clientY;  
    that.setData({  
      clientY: clientY,  
      refreshHeight: 0  
    })  
  },  
  end: function (e) {  
    var that = this; 
    var endPoint = e.changedTouches[0]  
    var y = (endPoint.clientY - that.data.clientY) * 0.6;  
    if (y > 50) {  
      y = 50;  
    }  
    that.setData({  
      refreshHeight: y  
    })  
  },  
  move: function (e) {  
    console.log("下拉滑动了...")  
  },      
  onReady:function(){
    // 页面渲染完成
  },
  onShow:function(){
    console.log('小程序显示')
  },
  onHide:function(){
    // 页面隐藏
  },
  onUnload:function(){
    // 页面关闭
  }
})

function updateRefreshIcon() {  
    var deg = 0;  
    var that = this;  
    console.log('旋转开始了.....')  
    var animation = wx.createAnimation({  
      duration: 1000  
    });  
    
    var timer = setInterval(function () {  
      if (!that.data.refreshing)  
        clearInterval(timer);  
      animation.rotateZ(deg).step();//在Z轴旋转一个deg角度  
      deg += 360;  
      that.setData({  
        refreshAnimation: animation.export()  
      })  
    }, 1000);  
}


//数据缓存练习
function loadInfo(id, obj){
  var key = 'info_'+id
  var info = wx.getStorageSync(key)
  if(info){
    obj.setData({info: info})
    return true
  }

  wx.request({
     url: 'https://laoshe.coamc.tech/ldd/adocdome/getprovince',
     data: {id: id},
     header: {
        "Content-Type": "application/x-www-form-urlencoded"
     },
     success: function(res){
        obj.setData({info: res.data}) 
        wx.setStorageSync(key, res.data)  
     },
     fail: function(res) {
        console.log('server error')
        obj.setData({toastHidden: false, msg: '当前网络异常，请稍后再试'}) 
     }
  })
}
module.exports = {
  loadInfo: loadInfo
}