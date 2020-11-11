// var AipNlpClient = require("baidu-aip-sdk").nlp;

// // 设置APPID/AK/SK
// var APP_ID = "22964054";
// var API_KEY = "UiQaiRPW83gKMUMTCwIahuyf";
// var SECRET_KEY = "GGUFl7iGrGjSGKTfbgVn2oZ4UoXdrqB4";

// // 新建一个对象，建议只保存一个对象调用服务接口
// var client = new AipNlpClient(APP_ID, API_KEY, SECRET_KEY);

// var HttpClient = require("baidu-aip-sdk").HttpClient;

// // 设置request库的一些参数，例如代理服务地址，超时时间等
// // request参数请参考 https://github.com/request/request#requestoptions-callback
// HttpClient.setRequestOptions({timeout: 5000});

// // 也可以设置拦截每次请求（设置拦截后，调用的setRequestOptions设置的参数将不生效）,
// // 可以按需修改request参数（无论是否修改，必须返回函数调用参数）
// // request参数请参考 https://github.com/request/request#requestoptions-callback
// HttpClient.setRequestInterceptor(function(requestOptions) {
//     // 查看参数
//     console.log(requestOptions)
//     // 修改参数
//     requestOptions.timeout = 5000;
//     // 返回参数
//     return requestOptions;
// });

// var text = "苹果是一家伟大的公司";

// // 调用情感倾向分析
// client.sentimentClassify(text).then(function(result) {
//     console.log(JSON.stringify(result));
// }).catch(function(err) {
//     // 如果发生网络错误
//     console.log(err);
// });

//创建HTTP服务器

//1. 加载http模块
var uu = require('url');
var http = require('http');
var rp = require('request-promise');
var fs = require('fs')
//2. 创建http服务器
// 参数: 请求的回调, 当有人访问服务器的时候,就会自动调用回调函数

var label1 = {
    'pessimistic':'负向情绪','neutral':'中性情绪','optimistic':'正向情绪'
}
var label2 = {
    'happy':'开心','thankful':'感谢','complaining':'抱怨','angry':'愤怒','like':'喜爱','disgusting':'厌恶','fearful':'恐惧','sad':'悲伤'
}

var qs = require('querystring');

const param = qs.stringify({
    'grant_type': 'client_credentials',
    'client_id': 'UiQaiRPW83gKMUMTCwIahuyf',
    'client_secret': 'GGUFl7iGrGjSGKTfbgVn2oZ4UoXdrqB4'
});
var request = require('request');
const { decode } = require('punycode');

async function getAct() {
    var access_token = '';
    await rp({
        method: 'GET',
        uri: 'https://aip.baidubce.com/oauth/2.0/token?' + param,
        json: true // Automatically stringifies the body to JSON
    }).then(d => {
        access_token = d.access_token
    })
    return access_token
}

async function postData(text) {
    var a = await getAct()
    var rq = {    }
    var dd = [];
    var tlr = await getTuling(text)
    rq.tl = tlr
    await rp({
        method: 'POST',
        uri: 'https://aip.baidubce.com/rpc/2.0/nlp/v1/emotion?charset=UTF-8&access_token=' + a,
        json: true, // Automatically stringifies the body to JSON
        headers: {
            'Content-Type': 'application/json'
        },
        body: {
            "text": text
        }
    // await request.post({
    //     url: 'https://aip.baidubce.com/rpc/2.0/nlp/v1/emotion?charset=UTF-8&access_token=' + a,
    //     json: true,
    //     headers: {
    //         'Content-Type': 'application/json'
    //     },
    //     body: {
    //         "text": text
    //     }
    }).then( body=> {
        for (var i =0;i<body.items.length;i++){
            var lb = '';
            var pro = '';
            if(body.items[i].subitems.length>0){
                if(body.items[i].subitems[0].prob){
                    pro = body.items[i].subitems[0].prob
                }
                if(body.items[i].subitems[0].label){
                    lb = label2[body.items[i].subitems[0].label]
                }
            }
            dd[i]={
                'type':label1[body.items[i].label],
                'prob':body.items[i].prob,
                'pro':pro,
                'lb':lb
            }
        }
        rq.dd = dd
    })
    return rq
}

async function getTuling(text) {
    var dd = ''
    await rp({
        method: 'POST',
        uri: 'http://openapi.tuling123.com/openapi/api/v2',
        json: true, // Automatically stringifies the body to JSON
        headers: {
            'Content-Type': 'application/json'
        },
        body: {
            "reqType": 0,
            "perception": {
                "inputText": {
                    "text": text
                },
            },
            "userInfo": {
                "apiKey": "5397e106da5b408d8a74fc1007db4450",
                "userId": "xlelou"

            }
        }
    }).then(d => {
        dd = d.results[0].values.text
    })
    return dd
}


var server = http.createServer(async function (request, response) {

    var parseObj = uu.parse(request.url, true);
    // console.log(parseObj);

    var pathname = parseObj.pathname; //相当于无参数的url路径
    // console.log(pathname);
    // 这里将解析拿到的查询字符串对象作为一个属性挂载给 req 对象，这样的话在后续的代码中就可以直接通过 req.query 来获取查询字符串了
    request.query = parseObj.query;
    // console.log(request.query);
    var t= request.query.text
    // console.log(t);
    var url= request.url;
    // console.log(url)
    if(pathname === '/'){
        // fs.readFile('./index.html',function(err, data){
        //     if(!err){
        //         response.writeHead(200, {"Content-Type": "text/html;charset=UTF-8"});
        //         response.end(data);
        //     }else{
        //         throw err;
        //     }
        // })
        response.write('Hello, welcome!')
        response.write('Behind every successful man, there is a woman. And behind every unsuccessful man, there are two.')
        response.end()
    }else if(pathname === '/getD'){
        console.log(11)
        var d = await postData(t)
        response.writeHead(200, {"Content-Type": "text/json;charset=UTF-8"});
        console.log(d)
        response.end(JSON.stringify(d) );
       
    }else if(pathname ==='/page'){
        console.log(111)
         fs.readFile('./index.html',function(err, data){
            if(!err){
                response.writeHead(200, {"Content-Type": "text/html;charset=UTF-8"});
                response.end(data);
            }else{
                throw err;
            }
        })
    console.log('有人访问page')

    }
    // console.log('有人访问了服务器')

    //回调数据
    // response.write('Hello, My Love')
    // response.end()
})



//3. 绑定端口
server.listen(3030)

//4. 执行
console.log('执行了3030')

