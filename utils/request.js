var host = "";

/**
 * POST请求，
 * URL：接口
 * postData：参数，json类型
 * doSuccess：成功的回调函数
 * doFail：失败的回调函数
 */
function post(url, postData, doSuccess, doFail) {
  wx.showLoading({
    title: '加载中',
  })
  var promise = new Promise((resolve, reject) => {
    wx.request({
      url: host + url,
      header: {
        "content-type": "application/json;charset=UTF-8"
      },
      data: postData,
      method: 'POST',
      success: function(res) {
        wx.hideLoading();
        //参数值为res.data,直接将返回的数据传入
        doSuccess(res.data);
      },
      fail: function() {
        wx.hideLoading();
        doFail();
      },
    })
    return promise
  })
}

//GET请求，不需传参，直接URL调用，
function getData(url, doSuccess, doFail) {
  wx.showLoading({
    title: '加载中',
  })
  var promise = new Promise((resolve, reject) => {
    wx.request({
      url: host + url,
      header: {
        "content-type": "application/json;charset=UTF-8"
      },
      method: 'GET',
      success: function(res) {
        wx.hideLoading();
        doSuccess(res.data);
      },
      fail: function() {
        wx.hideLoading();
        doFail();
      },
    })
  })
  return promise
}

module.exports = {
  getData: getData,
  post: post
}