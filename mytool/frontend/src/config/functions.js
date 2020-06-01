import Vue from 'vue'

// 时间格式化
import dateFormat from 'dateformat'

// 定义POST请求方法
function post (action, params) {
  Vue.http.options.root = Vue.HOST_SITE
  if (params) {
    for (let k in params) {
      if (params[k] === undefined) {
        delete params[k]
        console.error('传参' + k + '为undefined')
      }
    }
  }
  return Vue.http.post(action, params)
}

//导出excel
function exportExcel(data, fileName) {
  const wopts = { bookType: 'xlsx', bookSST: true, type: 'binary' };//这里的数据是用来定义导出的格式类型
  downloadExl(data, fileName)
  function downloadExl(data, fileName) {
    var wb = { SheetNames: ['Sheet1'], Sheets: {}, Props: {} };
    //wb.Sheets['Sheet1'] = XLSX.utils.json_to_sheet(data);//通过json_to_sheet转成单页(Sheet)数据
    data = XLSX.utils.json_to_sheet(data);
    wb.Sheets['Sheet1'] = data;
    saveAs(new Blob([s2ab(XLSX.write(wb, wopts))], { type: "application/octet-stream"}), fileName + '.' + (wopts.bookType == "biff2" ? "xls" : wopts.bookType));
  }
  //如果使用 FileSaver.js 就不要同时使用以下函数
  function saveAs(obj, fileName) {//当然可以自定义简单的下载文件实现方式
    var tmpa = document.createElement("a");
    tmpa.download = fileName || "下载";
    tmpa.href = URL.createObjectURL(obj); //绑定a标签
    tmpa.click(); //模拟点击实现下载
    setTimeout(function () { //延时释放
      URL.revokeObjectURL(obj); //用URL.revokeObjectURL()来释放这个object URL
    }, 100);
  }
  function s2ab(s) {
    if (typeof ArrayBuffer !== 'undefined') {
      var buf = new ArrayBuffer(s.length);
      var view = new Uint8Array(buf);
      for (var i = 0; i != s.length; ++i) view[i] = s.charCodeAt(i) & 0xFF;
      return buf;
    } else {
      var buf = new Array(s.length);
      for (var i = 0; i != s.length; ++i) buf[i] = s.charCodeAt(i) & 0xFF;
      return buf;
    }
  }
}
export {
  post,
  exportExcel,
  dateFormat
}
