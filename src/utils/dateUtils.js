/**
 * 将毫秒，转换成时间字符串。例如说，xx 分钟
 *
 * @param ms 毫秒
 * @returns {string} 字符串
 */
export function getDate(ms) {
  const day = Math.floor(ms / (24 * 60 * 60 * 1000));
  const hour =  Math.floor((ms / (60 * 60 * 1000) - day * 24));
  const minute =  Math.floor(((ms / (60 * 1000)) - day * 24 * 60 - hour * 60));
  const second =  Math.floor((ms / 1000 - day * 24 * 60 * 60 - hour * 60 * 60 - minute * 60));
  if (day > 0) {
    return day + "天" + hour + "小时" + minute + "分钟";
  }
  if (hour > 0) {
    return hour + "小时" + minute + "分钟";
  }
  if (minute > 0) {
    return minute + "分钟";
  }
  if (second > 0) {
    return second + "秒";
  } else {
    return 0 + "秒";
  }
}

export function beginOfDay(date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

export function endOfDay(date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate(), 23, 59, 59, 999);
}

export function betweenDay(date1, date2) {
  date1 = convertDate(date1);
  date2 = convertDate(date2);
  // 计算差值
  return Math.floor((date2.getTime() - date1.getTime()) / (24 * 3600 * 1000));
}

export function formatDate(date, fmt) {
  date = convertDate(date);
  const o = {
    "M+": date.getMonth() + 1, //月份
    "d+": date.getDate(), //日
    "H+": date.getHours(), //小时
    "m+": date.getMinutes(), //分
    "s+": date.getSeconds(), //秒
    "q+": Math.floor((date.getMonth() + 3) / 3), //季度
    "S": date.getMilliseconds() //毫秒
  };
  if (/(y+)/.test(fmt)) { // 年份
    fmt = fmt.replace(RegExp.$1, (date.getFullYear() + "").substr(4 - RegExp.$1.length));
  }
  for (const k in o) {
    if (new RegExp("(" + k + ")").test(fmt)) {
      fmt = fmt.replace(RegExp.$1, (RegExp.$1.length === 1) ? (o[k]) : (("00" + o[k]).substr(("" + o[k]).length)));
    }
  }
  return fmt;
}

export function addTime(date, time) {
  date = convertDate(date);
  return new Date(date.getTime() + time);
}

export function convertDate(date) {
  if (typeof date === 'string') {
    return new Date(date);
  }
  return date;
}
export function formatDateToStrTime(date) {
  if (!(date instanceof Date)) {
    date = new Date(date);
  }
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const seconds = String(date.getSeconds()).padStart(2, '0');
  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
}
// 使用示例
/*
  const timestamp = 1696123456; // 秒级时间戳
  console.log(formatTimestamp(timestamp)); // 输出 "2023-09-30 12:04:16" (GMT+8时区)
  console.log(formatTimestamp(timestamp, "yyyy/MM/dd", "GMT+0")); // 输出 "2023/09/30" (GMT时区)
  */
export function formatTimestamp(timestamp, pattern = "yyyy-MM-dd HH:mm:ss", timezone = "GMT+8") {
  // 转换为毫秒级时间戳
  if (timestamp.toString().length === 10) timestamp *= 1000;
  // 创建基础日期对象
  const date = new Date(timestamp);
  // 处理时区偏移
  const timezoneOffset = parseInt(timezone.replace("GMT", "")) * 60;
  const adjustedDate = new Date(date.getTime() + (timezoneOffset * 60000));
  // 定义格式化函数
/*  const formatters = {
    yyyy: adjustedDate.getFullYear(),
    MM: String(adjustedDate.getMonth() + 1).padStart(2, '0'),
    dd: String(adjustedDate.getDate()).padStart(2, '0'),
    HH: String(adjustedDate.getHours()).padStart(2, '0'),
    mm: String(adjustedDate.getMinutes()).padStart(2, '0'),
    ss: String(adjustedDate.getSeconds()).padStart(2, '0')
  };*/
  const formatters = {
    yyyy: adjustedDate.getUTCFullYear(),
    MM: String(adjustedDate.getUTCMonth() + 1).padStart(2, '0'),
    dd: String(adjustedDate.getUTCDate()).padStart(2, '0'),
    HH: String(adjustedDate.getUTCHours()).padStart(2, '0'),
    mm: String(adjustedDate.getUTCMinutes()).padStart(2, '0'),
    ss: String(adjustedDate.getUTCSeconds()).padStart(2, '0')
  };

  // 替换模式中的占位符
  return pattern.replace(/yyyy|MM|dd|HH|mm|ss/g, match => formatters[match]);

}
