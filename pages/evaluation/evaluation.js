// pages/evaluation/evaluation.js
const Util = require( '../../utils/util.js' )
const app = getApp()
Page({
  data:{
     goHome:true,
     goShop:false,         
     banCodeHidden: true,           //小区搜索结果默认隐藏  
     banItem: [
      {name: '小区', value: '小区', checked: 'true'},
      {name: '地址', value: '地址'}
     ]
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
    const that = this
    const param = {}
        //初始获取省份数据
        Util.request('ldd/adocdome/getprovince', param, function(data){
            Util.hiddenLoading(that)
            that.setData({
                province: data.extension
            })
        })
        //获取朝向数据
        Util.request('ldd/adocdome/getForward', param, function(data){
            var forwardData = []
            for(var key in data.extension){
                forwardData.push({key:key,value:data.extension[key]});
            }
            that.setData({
                forward: forwardData
            })
        })

        that.setData({
            provinceIndex:0,
            cityIndex:0,
            banIndex:0,
            houseIndex:0,
            forwardIndex: 0,
            inputValue:'',
            loadingHidden: false,                                                              //loading动画默认隐藏
            houseHidden: true,                                                                //房号默认显示
            unitHidden:  false,                                                              //楼栋单元默认隐藏
            extHidden:   false,                                                             //房间号、朝向、总楼层、所在楼层默认隐藏
            ban: [{ sBanCode: "-1", sBanName: "请选择所在楼栋", sUnitCode:"-1" }],         //楼栋默认显示文案
            house : [{sRoomID: "-1", sRoomNo: "请选择所属房间号" }]                       //房号默认显示文案
        })
       
  },
    //选择省份
    provincePickerChange: function(e){
        const that = this
        that.setData({
            provinceIndex : e.detail.value,
            city: null,
            inputValue: ''
        })
        Util.showLoading(that)
        var   param = {}
              param.province      =  this.data.province[e.detail.value].code
              param.provinceName  =  this.data.province[e.detail.value].province

        Util.request('ldd/adocdome/getCity', param, function(data){
            Util.hiddenLoading(that)
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
             ban: null,
             house : null,
             fArea: '',
             extUnit: '',
             roomNo : '',
             forwardIndex: 0,
             extTotalfloor: '',
             extLocalfloor: '',
             extHidden:   false
        })
        var   param = {}
              param.city  =  e.target.dataset.cityname
              param.name  =  e.detail.value
         
         app.CityName = param.city
         app.Name = param.name

         if(param.name == ''){
            that.setData({
                inputValue:  '',
                unitHidden:  false,
                houseHidden: true
            })
         }else{
            that.setData({
                inputValue: e.detail.value
            })
         }
    },
    //监听小区或地址搜索切换
    banSwitch: function(e){
        const that = this
        if(e.detail.value == "小区"){
            app.unCode = e.detail.value;
        }
        if(e.detail.value == "地址"){
            app.unCode = e.detail.value;
        }
    },
    //小区搜索按钮
    codeSearch: function(e){
        const that = this
        that.setData({
            banCodeHidden: false
        })
        if(app.Name != ""){
            if(app.unCode == "地址"){
                Util.request('ldd/adocdome/getProjectListByKeyword', {city: app.CityName, name: app.Name }, function(data){
                    that.setData({
                        banCode: data.extension
                    })
                })
            }
            else{
                Util.request('ldd/adocdome/getProjectList', {city: app.CityName, name: app.Name }, function(data){
                    that.setData({
                        banCode: data.extension
                    })
                })
            }
        }else{
            that.setData({
                banCodeHidden: true,
                banCode: null
            })
        } 
    },
    //获取小区code
    getUnitCode: function(e){
        const that = this
        that.setData({
            inputValue: e.target.dataset.unitname,
            banCodeHidden: true
        })
        if(app.unCode == "地址"){
            banIndex: 0
        }
        Util.showLoading(that)
        var   param = {}
              param.city         =  app.CityName
              param.newCode      =  e.target.dataset.unitcode
              param.projectName  =  e.target.dataset.unitname
           
        Util.request('ldd/adocdome/getBanUnitList',param,function(data){
            Util.hiddenLoading(that)
            if(data.result == '0'){
                wx.showModal({
                    title: '提示',
                    content: '暂无该房产信息，请重新选择房产',
                    showCancel: false,
                    confirmColor: '#0093fd'
                })
            }else{
                const banData = data.extension
                banData.splice(0,0,{ sBanCode: "-1", sBanName: "请选择所在楼栋", sUnitCode:"-1" })
                banData.push({sBanCode: "999999", sBanName: "其他", sUnitCode:"999999" })
                that.setData({
                    ban : banData
                })
            }
        });

        app.UnitCode    = param.newCode
    },
    //选择楼栋
    banPickerChange: function(e){
        const that = this;
        that.setData({
            banIndex : e.detail.value,
            fArea: '',
            roomNo : '',
            forwardIndex: 0,
            extTotalfloor: '',
            extLocalfloor: ''
        })
        Util.showLoading(that)
        const banCodes  =  this.data.ban[e.detail.value].sBanCode+'_'+this.data.ban[e.detail.value].sUnitCode
        var   param = {};
              param.city     =  app.CityName
              param.newCode  =  app.UnitCode
              param.banCode  =  banCodes
              param.banName  =  this.data.ban[e.detail.value].sBanName
              param.unitCode =  this.data.ban[e.detail.value].sUnitCode

        if(param.unitCode =="999999"){
            that.setData({
                houseHidden:   false,  
                unitHidden:    true,          
                extHidden:     true,
                loadingHidden: true,
                extUnit:       ''
            })
            app.SroomId = "999999"                            //楼栋选择“其他”时,“房号”为999999
        }
        else{
            that.setData({
                houseHidden: true, 
                unitHidden:  false,                
                extHidden:   false,
                houseIndex : 0
            })
            Util.request('ldd/adocdome/getRoomList', param, function(data){
                Util.hiddenLoading(that)
                const houseData = data.extension
                houseData.splice(0,0,{sRoomID: "-1", sRoomNo: "请选择所属房间号" })
                houseData.push({sRoomID: "999999", sRoomNo: "其他" })
                that.setData({
                    house : houseData
                })
            })
        }
        app.BanCode   =  this.data.ban[e.detail.value].sBanCode
        app.SunitCode =  param.unitCode
        app.abanName  =  param.banName
    },
    //选择房号
    roomPickerChange:function(e){
        const that = this;
        if(app.abanName != ''){
            that.setData({
                houseIndex : e.detail.value
            })
        }else{
            that.setData({
                houseIndex : 0
            })
        }
        
      Util.showLoading(that)
      var param = {};
          param.city     =  app.CityName
          param.newCode  =  app.UnitCode
          param.roomId   =  this.data.house[e.detail.value].sRoomID 
          param.roomNo   =  this.data.house[e.detail.value].sRoomNo

        if(param.roomId =="999999"){
            that.setData({          
                extHidden:   true,
                loadingHidden: true
            })
        }
        else{
            that.setData({         
                extHidden:   false
            })
            Util.request('ldd/adocdome/getRoomInfoById', param, function(data){
                Util.hiddenLoading(that)
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
        }
        app.SroomId = param.roomId
        app.roomNo  = param.roomNo
    },
    //选择朝向
    forwardPickerChange: function(e){
        const that = this;
        that.setData({
            forwardIndex : e.detail.value
        })
        app.forward = parseInt(e.detail.value)+1
    },
    //表单提交
    formBindsubmit: function(e){
        const that = this
        //小区选择其他
        if(app.BanCode == '999999' || app.SunitCode == '999999'){
            if(e.detail.value.extUnit.length == 0 ){
                wx.showModal({
                    title: '提示',
                    content: '请将楼栋单元补充完整！',
                    showCancel: false,
                    confirmColor: '#0093fd'
                })
            }
            else if( e.detail.value.roomNo.length == 0 ){
                wx.showModal({
                    title: '提示',
                    content: '请将房间号补充完整！',
                    showCancel: false,
                    confirmColor: '#0093fd'
                })
            }
            else if( e.detail.value.extTotalfloor.length == 0 || e.detail.value.extLocalfloor.length == 0){
                wx.showModal({
                    title: '提示',
                    content: '请将总楼层、所在楼层补充完整！',
                    showCancel: false,
                    confirmColor: '#0093fd'
                })
            }
            else if( e.detail.value.extTotalfloor < e.detail.value.extLocalfloor ){
                 wx.showModal({
                    title: '提示',
                    content: '请输入正确的所在楼层！',
                    showCancel: false,
                    confirmColor: '#0093fd'
                })
            }
            else if( e.detail.value.farea.length == 0 ){
                 wx.showModal({
                    title: '提示',
                    content: '请将面积补充完整！',
                    showCancel: false,
                    confirmColor: '#0093fd'
                })
            }
            else{
                var param = {}
                param.city       = app.CityName
                param.newCode    = app.UnitCode
                param.banCode    = app.BanCode
                param.unitCode   = app.SunitCode
                param.roomId     = app.SroomId
                param.area       = e.detail.value.farea
                param.banName    = e.detail.value.extUnit
                param.roomNo     = e.detail.value.roomNo
                param.forward    = parseInt(e.detail.value.forward)+1 || app.forward
                param.totalFloor = e.detail.value.extTotalfloor
                param.floor      = e.detail.value.extLocalfloor

                Util.showLoading(that)
                Util.request('ldd/adocdome/evaluation', param, function(data){
                    Util.hiddenLoading(that)
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
            }  
        }
        //房号选择其他
        else if( app.SroomId == '999999'){
            if( e.detail.value.roomNo.length == 0 ){
                wx.showModal({
                    title: '提示',
                    content: '请将房间号补充完整！',
                    showCancel: false,
                    confirmColor: '#0093fd'
                })
            }
            else if( e.detail.value.extTotalfloor.length == 0 || e.detail.value.extLocalfloor.length == 0){
                wx.showModal({
                    title: '提示',
                    content: '请将总楼层、所在楼层补充完整！',
                    showCancel: false,
                    confirmColor: '#0093fd'
                })
            }
            else if( e.detail.value.extTotalfloor < e.detail.value.extLocalfloor ){
                 wx.showModal({
                    title: '提示',
                    content: '请输入正确的所在楼层！',
                    showCancel: false,
                    confirmColor: '#0093fd'
                })
            }
            else if( e.detail.value.farea.length == 0 ){
                 wx.showModal({
                    title: '提示',
                    content: '请将面积补充完整！',
                    showCancel: false,
                    confirmColor: '#0093fd'
                })
            }
            else{
                var param = {}
                param.city       = app.CityName
                param.newCode    = app.UnitCode
                param.banCode    = app.BanCode
                param.unitCode   = app.SunitCode
                param.roomId     = app.SroomId
                param.area       = e.detail.value.farea
                param.roomNo     = e.detail.value.roomNo
                param.forward    = parseInt(e.detail.value.forward)+1 || app.forward
                param.totalFloor = e.detail.value.extTotalfloor
                param.floor      = e.detail.value.extLocalfloor

                Util.showLoading(that)
                Util.request('ldd/adocdome/evaluation', param, function(data){
                    Util.hiddenLoading(that)
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
            }
        }
        //选择相应小区、房号
        else{
            var param = {}
                param.city     = app.CityName
                param.newCode  = app.UnitCode
                param.banCode  = app.BanCode
                param.unitCode = app.SunitCode
                param.roomId   = app.SroomId 
                param.area     = e.detail.value.farea

            Util.showLoading(that)
            Util.request('ldd/adocdome/evaluation', param, function(data){
                Util.hiddenLoading(that)
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
        }
    }
})
