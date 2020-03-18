const {login} = require('../controller/user')
const { SuccessModel, ErrorModel } = require('../model/resModel')
const {set} = require('../db/redis')

// 获取cookie的过期时间
const getCookieExpires = () =>{
    const d = new Date()
    d.setTime(d.getTime()+(24*60*60*1000))
    console.log('d.toGMTString() is ',d.toGMTString())
    return d.toGMTString()
}



const handleUserRouter = (req, res) => {
    const method = req.method //GET POST


    //登陆

    if (method === 'POST' && req.path ==='/api/user/login'){
        
        //username 和 password 在body里
        const { username, password} = req.body
        const result = login(username, password)
        return result.then(data =>{
            if(data.username){
                //操作session
                req.session.username=data.username
                req.session.realname=data.realname


                //同步到redis
                set(req.sessionId,req.session)
                
                return new SuccessModel()
            }
            else{
                return new ErrorModel('登陆失败')
            }
        })


    }


    // // 登陆验证的测试
    // if(method === 'GET' && req.path ==='/api/user/login-test'){
    //     if(req.session.username){
    //         return Promise.resolve(new SuccessModel({
    //             session: req.session
    //         }))

    //     }
    //     else{
    //         return Promise.resolve(new ErrorModel('尚未登陆'))
    //     }
    // }



}

module.exports = handleUserRouter