import * as https from 'https';
import * as querystring from 'querystring';
import md5 = require('md5');
import {appid, password} from './private';

type ErrorMap = {
  [key:string]: string | undefined
}
const errorMap:ErrorMap = {
  52000: '成功',
  52001: '请求超时,请重试',
  52002: '系统错误,请重试',
  52003: '未授权用户,请检查您的appid是否正确，或者服务是否开通',
  54000: '必填参数为空,请检查是否少传参数',
  54001: '签名错误,请检查您的签名生成方法',
  54003: '访问频率受限,请降低您的调用频率，或进行身份认证后切换为高级版/尊享版',
  54004: '账户余额不足,请前往管理控制台为账户充值',
  54005: '	长query请求频繁,请降低长query的发送频率，3s后再试',
  58000: '	客户端IP非法，请检查个人资料里填写的IP地址是否正确，可前往开发者信息-基本信息修改，可前往开发者信息-基本信息修改',
  58001: '	译文语言方向不支持,请检查译文语言是否在语言列表里',
  58002: '	服务当前已关闭	,请前往管理控制台开启服务',
  90107: '	认证未通过或未生效	,请前往我的认证查看认证进度',
  unknown: '服务器繁忙'
};
export const translate = (word:string) => {
  // console.log(word);
  const q = word;
  let from:string, to:string;
  if (/[a-zA-Z]/.test(q[0])) {
    from = 'en';
    to = 'zh';
  } else {
    from = 'zh';
    to = 'en';
  }
  const salt = Math.random();
  // const salt = '1435660288'
  const sign = md5(appid + q + salt + password);
  const query = querystring.stringify({q, from, to, appid, salt, sign});
  // console.log(query);
  const options = {
    hostname: 'api.fanyi.baidu.com',
    port: 443,
    path: '/api/trans/vip/translate?' + query,
    method: 'GET'
  };

  const request = https.request(options, (response) => {
    let chunks:Buffer[] = [];
    response.on('data', (data:Buffer) => {
      chunks.push(data);
    });
    response.on('end', () => {
      const string = Buffer.concat(chunks).toString();
      type BaiduResult = {
        from: string;
        to: string;
        trans_result: {
          src: string;
          dst: string;
        }[]
        error_code?: string;
        error_message?: string;
      }
      const obj: BaiduResult = JSON.parse(string);
      if (obj.error_code) {
        console.error(errorMap[obj.error_code] || obj.error_message);
        process.exit(2);
      } else {
        console.log(obj.trans_result[0].dst);
        process.exit(0);

      }
    });
  });

  request.on('error', (e) => {
    console.error(e);
  });
  request.end();
};

