// pages/evaluation/evaluation.js
const Util = require( '../../utils/util.js' )
const app = getApp()
Page({
  data:{
     goHome:true,
     goShop:false,
     loadingHidden: true,
     banCodeHidden: true
  },
  goHome:function(e){
      this.setData({
          goShop:false,
          goHome:true
      })
  },
  goShop:function(e){
      this.setData({
          goHome:false,
          goShop:true
      })
  },
  onLoad:function(options){
    //初始获取省份数据
    const that = this
    const param = {}
        Util.request('ldd/adocdome/getprovince', param, function(data){
            setTimeout(function(){
              that.setData({
                  loadingHidden: true
              })
            }, 300)
            that.setData({
                province: data.extension
            })
        })
        that.setData({
            provinceIndex:0,
            cityIndex:0,
            banIndex:0,
            houseIndex:0,
            inputValue:'',
            loadingHidden: false
        })
    },
    //选择省份
    provincePickerChange: function(e){
        const that = this
        that.setData({
            provinceIndex : e.detail.value,
            loadingHidden: false
        })

        const param = {}
              param.province      =  this.data.province[e.detail.value].code
              param.provinceName  =  this.data.province[e.detail.value].province

        Util.request('ldd/adocdome/getCity', param, function(data){
            setTimeout(function(){
              that.setData({
                  loadingHidden: true
              })
            }, 300)
            that.setData({
                city: data.extension
            })
        })
    },
    //选择城市
    cityPickerChange: function(e){
        const that = this
        that.setData({
            cityIndex : e.detail.value
        })
    },
    //搜索小区关键词
    bindKeyInput: function(e) {
        const that = this
        that.setData({
            banCodeHidden: false,
            inputValue: e.detail.value
        })

        const param = {}
              param.city  =  e.target.dataset.cityname
              param.name  =  e.detail.value

        Util.request('ldd/adocdome/getProjectList', param, function(data){
            that.setData({
                banCode: data.extension
            })
        })
        app.CityName = param.city
    },
    //获取小区code
    getUnitCode: function(e){
        const that = this
        that.setData({
            inputValue: e.target.dataset.unitname,
            loadingHidden: false,
            banCodeHidden: true
        })

        const param = {}
              param.city         =  app.CityName
              param.newCode      =  e.target.dataset.unitcode
              param.projectName  =  e.target.dataset.unitname
           
        Util.request('ldd/adocdome/getBanUnitList',param,function(data){
            setTimeout(function(){
              that.setData({
                  loadingHidden: true
              })
            }, 300)
            if(data.result == '0'){
                wx.showModal({
                    title: '提示',
                    content: '暂无该房产信息，请重新选择房产',
                    showCancel: false,
                    confirmColor: '#0093fd'
                })
            }else{
                that.setData({
                    ban : data.extension
                })
            }
        });
        app.UnitCode = param.newCode
    },
    //选择楼栋
    banPickerChange: function(e){
        const that = this;
        that.setData({
            banIndex : e.detail.value,
            loadingHidden: false
        })

        const banCodes  =  this.data.ban[e.detail.value].sBanCode+'_'+this.data.ban[e.detail.value].sUnitCode
        const param = {};
              param.city     =  app.CityName
              param.newCode  =  app.UnitCode
              param.banCode  =  banCodes
              param.banName  =  this.data.ban[e.detail.value].sBanName
              param.unitCode =  this.data.ban[e.detail.value].sUnitCode

        Util.request('ldd/adocdome/getRoomList', param, function(data){
            setTimeout(function(){
              that.setData({
                  loadingHidden: true
              })
            }, 300)
            that.setData({
                house : data.extension
            })
        })
        app.BanCode   =  this.data.ban[e.detail.value].sBanCode
        app.SunitCode =  param.unitCode
    },
    //选择房号
    roomPickerChange:function(e){
        const that = this;
        that.setData({
            houseIndex : e.detail.value,
            loadingHidden: false
        })

        const param = {};
              param.city     =  app.CityName
              param.newCode  =  app.UnitCode
              param.roomId   =  this.data.house[e.detail.value].sRoomID
              param.roomNo   =  this.data.house[e.detail.value].sRoomNo

        Util.request('ldd/adocdome/getRoomInfoById', param, function(data){
            setTimeout(function(){
              that.setData({
                  loadingHidden: true
              })
            }, 300)
            that.setData({
                fArea : data.extension.fArea
            });
            if(data.extension.fArea ==""){
                wx.showModal({
                    title: '提示',
                    content: '未查询到面积，请手动输入',
                    showCancel: false,
                    confirmColor: '#0093fd'
                })
            }
        })
        app.SroomId = param.roomId
    },
    //表单提交
    formBindsubmit: function(e){
        const that = this
        const param = {}
              param.city     = app.CityName
              param.newCode  = app.UnitCode
              param.banCode  = app.BanCode
              param.unitCode = app.SunitCode
              param.roomId   = app.SroomId
              param.area     = e.detail.value.farea

        Util.request('ldd/adocdome/evaluation', param, function(data){
            if( data.result=='0') {
                wx.showModal({
                    title: '提示',
                    content: data.message,
                    showCancel: false,
                    confirmColor: '#0093fd'
                })
            }else{
                wx.showModal({
                    title: '提示',
                    content: "评估成功！评估总资产："+ data.extension.fTotalPrice+"元",
                    showCancel: false,
                    confirmColor: '#0093fd'
                })
            }
        })
    },
    //表单重置
    formReset: function(e){
    }
})
