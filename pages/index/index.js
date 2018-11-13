const app = getApp()

Page({
  data: {

  },
  onLoad: function () {
    new app.ToastPannel();
    this.show("showToast")
  },
})
