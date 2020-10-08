import * as https from 'https';
import * as querystring from 'querystring';
import md5 = require('md5');
import {appid, password} from './private';

export const translate = (word) => {
  // console.log(word);
  const q = word, from = 'en', to = 'zh';
  const salt = Math.random()
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
    let chunks = []
    response.on('data', (data,error) => {
      chunks.push(data)
    });
    response.on('end',()=>{
      const string = Buffer.concat(chunks).toString()
      type BaiduResult = {
        from: string;
        to: string;
        trans_result:{
          src:string;
          dst:string;
        }[]
        error_code?:string;
        error_message?:string;
      }
      const obj:BaiduResult = JSON.parse(string)
      console.log(obj.trans_result[0].dst)
    })
  });

  request.on('error', (e) => {
    console.error(e);
  });
  request.end();
};

