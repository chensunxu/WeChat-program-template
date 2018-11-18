const app = getApp()

Page({
  data: {

  },
  onLoad: function () {
    new app.ToastPannel();
    this.show("欢迎使用小程序模版，我是陈孙旭")
  },
})
