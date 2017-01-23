function formatTime(date) {
  var year = date.getFullYear()
  var month = date.getMonth() + 1
  var day = date.getDate()

  var hour = date.getHours()
  var minute = date.getMinutes()
  var second = date.getSeconds()


  return [year, month, day].map(formatNumber).join('/') + ' ' + [hour, minute, second].map(formatNumber).join(':')
}

function formatNumber(n) {
  n = n.toString()
  return n[1] ? n : '0' + n
}

function json2Form(json) {
    var str = [];
    for(var p in json){
        str.push(encodeURIComponent(p) + "=" + encodeURIComponent(json[p]));
    }
    return str.join("&");
}

function request(url,dataJSON,successFun){
    //dataJSON = dataJSON||{};
    wx.request({
        url: 'https://laoshe.coamc.tech/'+url,
        data: json2Form(dataJSON),
        header: {
            "Content-Type": "application/x-www-form-urlencoded"
        },
        method: 'POST',
        success: function(res){
            if(res.statusCode == '200'){
                successFun(res.data)
            }
        },
        fail: function(err) {
            console.log(err)
        },
        complete: function() {
            // complete
        }
    });
}

module.exports = {
  formatTime:  formatTime,
  json2Form:   json2Form,
  request:     request
}
