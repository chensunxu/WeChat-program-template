var sha1 = require("sha1.js");
var host = ""; // 请求域名

var versions = "0.0.1",
  platform = "3"
let moduls = {
  objKeySort(obj) { //排序的函数
    var newkey = Object.keys(obj).sort();
    //先用Object内置类的keys方法获取要排序对象的属性名，再利用Array原型上的sort方法对获取的属性名进行排序，newkey是一个数组
    var newObj = {}; //创建一个新的对象，用于存放排好序的键值对
    for (var i = 0; i < newkey.length; i++) { //遍历newkey数组
      newObj[newkey[i]] = obj[newkey[i]]; //向新创建的对象中按照排好的顺序依次增加键值对
    }
    return newObj; //返回排好序的新对象
  },
  // 返回加密后的sha1字符串
  encryption(paramsData, token) {
    paramsData.platform = platform;
    paramsData.version = versions;
    paramsData.timestamp = parseInt(new Date() / 1000);
    if (token != null)
      paramsData.accessToken = token;
    var paramsDateSort = this.objKeySort(paramsData)
    var arr = [];
    for (var key in paramsDateSort) {
      if (paramsDateSort[key] != '') {
        arr.push(key + '=' + paramsDateSort[key]);
      }
    }
    var arrays = arr.join('&')
    var array = "HwwUmqrubAKkDK0WhWgymfl98TwnX14c" + arrays + "HwwUmqrubAKkDK0WhWgymfl98TwnX14c"
    return sha1.hex_sha1(array)
  },
  /**
   * 返回header
   * params:参数
   * token:登录时传null
   * method: GET POST
   */
  returnHeader(paramsData, token, method) {
    // let header = {} //非签名
    let header = {
      platform: platform,
      version: versions,
      timestamp: parseInt(new Date() / 1000),
      "sign": this.encryption(paramsData, token)
    } //签名
    if (method == "POST") {
      header["content-type"] = "application/x-www-form-urlencoded"
    } else {
      header["content-type"] = "application/json"
    }
    return header
  },
  // 获取token
  getToken() {
    var that = this;
    return new Promise((resolve, reject) => {
      wx.login({
        success: (res) => {
          wx.getUserInfo({
            withCredentials: false,
            success: function (data) {
              var paramsData = {
                "source": "source",
                "code": res.code,
                "invitation_code": "",
                'nickname': data.userInfo.nickName,
                'head_image': data.userInfo.avatarUrl,
                'type': 0
              }
              wx.request({
                url: host + "/site/auth-login-unify",
                data: paramsData,
                header: that.returnHeader(paramsData, null, "POST"),
                method: 'POST',
                success: (r) => {
                  console.log(r)
                  let nowTime = new Date().getTime()
                  wx.setStorageSync("access_token", r.data.data.access_token)
                  wx.setStorageSync("tokenTime", nowTime)
                  resolve(r)
                },
                fail: (err) => {
                  reject(err);
                },
              })
            },
            fail: function () {
              wx.hideLoading()
            }
          })
        }
      })
    })
  },
  /**
   * params:格式params={data:{},url:""}
   * method: POST GET
   */
  request(params, method = "POST") {
    var that = this
    wx.showLoading({
      title: '载入中',
    })
    let nowTime = new Date().getTime()
    let tokenTime = wx.getStorageSync("tokenTime")
    let token = wx.getStorageSync("access_token")
    if (nowTime - tokenTime > 54e5) { // 默认一个半小时刷新一次token
      this.getToken().then((restoken) => {
        let nowTime = new Date().getTime()
        wx.setStorageSync("access_token", restoken.data.data.access_token)
        wx.setStorageSync("tokenTime", nowTime)
        return new Promise((resolv, rejec) => {
          wx.request({
            url: host + params.url + "?accessToken=" + restoken.data.data.access_token,
            data: params.data,
            method: method,
            header: this.returnHeader(params.data, restoken.data.data.access_token, method),
            success: (r) => {
              console.log(r)
              wx.hideLoading();
              resolv(r)
            },
            fail: (err) => {
              wx.hideLoading();
              rejec(err);
            },
          })
        })
      })
    } else {
      return new Promise((resolve, reject) => {
        wx.request({
          url: host + params.url + "?accessToken=" + token,
          data: params.data,
          method: method,
          header: this.returnHeader(params.data, token, method),
          success: (r) => {
            /**
             * token==401即视为token过期
             * 具体状态看自家后台的设置
             * token过期则重新请求token,并重新请求之前获取数据的方法
             */
            if (r.data.code == 401) {
              this.getToken().then((restoken) => {
                let nowTime = new Date().getTime()
                wx.setStorageSync("access_token", restoken.data.data.access_token)
                wx.setStorageSync("tokenTime", nowTime)
                this.request(params, method)
              })
            }
            if (r.data.code == 200) {
              resolve(r)
            }
            wx.hideLoading();
          },
          fail: (err) => {
            wx.hideLoading();
            reject(err);
          },
        })
      })
    }
  }
}
module.exports = moduls