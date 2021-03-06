var http = require("../../utils/request.js")

Page({
  data: {
    //判断小程序的API，回调，参数，组件等是否在当前版本可用。
    canIUse: wx.canIUse('button.open-type.getUserInfo')
  },
  onLoad: function (options) {
    // 查看是否授权
    // wx.getSetting({
    //   success: function (res) {
    //     if (res.authSetting['scope.userInfo']) {
    //       wx.switchTab({
    //         url: '/pages/index/index'
    //       });
    //     }
    //   }
    // })
  },
  bindGetUserInfo: function (e) {
    var that = this;
    if (e.detail.userInfo) {
      var pageUrl = wx.getStorageSync("page");
      var route = wx.getStorageSync("route");
      /**
      * pageUrl:跳转到login之前的页面，可带参(/pages/help/help?id=32),授权成功后将带着原来的参数返回界面
      * rout:路由类型 redirectTo switchTab
      */
      console.log(pageUrl)
      http.getToken().then(res => {
        //授权成功后，跳转进入小程序首页
        if (pageUrl) {
          if (route == "redirectTo") {
            wx.redirectTo({
              url: pageUrl,
            })
          }
          if (route == "switchTab") {
            wx.switchTab({
              url: pageUrl
            })
          }
          wx.removeStorageSync("page")
          wx.removeStorageSync("pageType")
        } else {
          wx.switchTab({
            url: '/pages/index/index'
          })
        }
      })
    } else {
      //用户按了拒绝按钮
      wx.showModal({
        title: '警告',
        content: '您点击了拒绝授权，将无法进入小程序，请授权之后再进入!!!',
        showCancel: false,
        confirmText: '返回授权',
        success: function (res) {
          if (res.confirm) {
            console.log('用户点击了“返回授权”')
          }
        }
      })
    }
  },
})