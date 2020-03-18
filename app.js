const querystring = require('querystring')
const {get,set}=require('./src/db/redis')
const handleBlogRouter = require('./src/router/blog.js')
const handleUserRouter = require('./src/router/user.js')
const {access} = require('./src/utils/log')

const getCookieExpires = () =>{
    const d = new Date()
    d.setTime(d.getTime()+(24*60*60*1000))
    console.log('d.toGMTString() is ',d.toGMTString())
    return d.toGMTString()
}

// session 数据/全局
// const SESSION_DATA ={}

//用于处理post data

const getPostData = (req) =>{
    const promise = new Promise((resolve,reject) =>{
        if(req.method !== 'POST'){
            resolve({})
            return
        }
        if(req.headers['content-type'] !== 'application/json'){
            resolve({})
            return
        }

        let postData = ''
        req.on('data',chunk=>{
            postData+=chunk.toString() //本身是二进制格式

        })
        req.on('end',()=>{
            if(!postData){
                resolve({})
                return
            }
            resolve(
                JSON.parse(postData)
            )
        })
    })
    return promise
}

const serverHandle = (req, res) => {

    // 记录access log

    access(`${req.method} -- ${req.url} -- ${req.headers['user-agent']} -- ${Date.now()}`)

    //设置返回格式 JSON
    res.setHeader('Content-type', 'application/json')

    //获取 path
    const url = req.url
    req.path = url.split('?')[0]

    //后半部分就是参数
    req.query = querystring.parse(url.split('?')[1])

    // 解析cookie
    req.cookie ={}
    const cookieStr = req.headers.cookie || '' //k1=v1;k2=v2
    cookieStr.split(';').forEach(item =>{
        if(!item){
            return
        }
        const arr=item.split('=')
        const key=arr[0].trim()
        const val=arr[1].trim()
        req.cookie[key]=val
    })

    // // 解析session
    // let needSetCookie=false
    // let userId=req.cookie.userid
    // if(userId){
    //     if(!SESSION_DATA[userId]){
    //         SESSION_DATA[userId]={}        
    //     }        
    // }
    // else{
    //     needSetCookie=true
    //     userId=`${Date.now()}_${Math.random()}`
    //     SESSION_DATA[userId]={}        
    // }
    // req.session = SESSION_DATA[userId]
    
    //解析session (使用redis)
    let needSetCookie=false
    let userId = req.cookie.userid
    if(!userId){
        needSetCookie=true
        userId=`${Date.now()}_${Math.random()}`

        // 初始化redis中的session值
        set(userId,{})
    }
    // 获取session
    req.sessionId = userId
    get(req.sessionId).then(sessionData =>{
        if(sessionData == null){

            //初始化session
            set(req.sessionId,{})
            //设置session
            req.session = {}

        }
        else{
            req.session = sessionData
        }
        //处理post data
        return getPostData(req)
    })
    .then(postData =>{
        
        req.body = postData

        //处理路由

        const blogResult = handleBlogRouter(req,res)
        if(blogResult){
            blogResult.then(blogData =>{

                if(needSetCookie){
                    res.setHeader('Set-Cookie',`userid=${userId}; path=/;httpOnly; expires=${getCookieExpires()}'`)
                }
                res.end(
                    JSON.stringify(blogData)
                )
            })
            return
        }
        //如果是user路由的, blogData就是nothing

    
        //处理 user 路由
        const userResult = handleUserRouter(req,res)
        if(userResult){
            userResult.then(userData =>{
                if(needSetCookie){
                    res.setHeader('Set-Cookie',`userid=${userId}; path=/;httpOnly; expires=${getCookieExpires()}'`)
                }
                res.end(
                    JSON.stringify(userData)
                )
            })
            return
        }
    
        // const userData = handleUserRouter(req,res)
        // if(userData){
        //     res.end(
        //         JSON.stringify(userData)
        //     )
        //     return
        // }
    
        //未命中路由, 返回404
    
        //返回一个纯文本, 不常用, 覆盖JSON格式
        res.writeHead(404, {"content-type": "text/plain"}) 
        res.write("404 Not Found\n")
        res.end()
    
    })

   

}

module.exports = serverHandle
// process.env.NODE_ENV 