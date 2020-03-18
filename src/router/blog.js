const { 
    getList, 
    getDetail,
    newBlog,
    updateBlog,
    delBlog
} = require('../controller/blog.js')
const { SuccessModel, ErrorModel } = require('../model/resModel')

// 统一的登陆验证函数
const loginCheck = (req)=>{
    if(!req.session.username){
        return Promise.resolve(new ErrorModel('尚未登录'))
    }
}

const handleBlogRouter = (req, res) =>{
    const method = req.method //GET POST
    const id = req.query.id 



    //获取博客列表
    if(method === 'GET' && req.path === '/api/blog/list'){
         
        let author = req.query.author || ''
        const keyword = req.query.keyword || ''

        //如果是管理员界面
        if (req.query.isadmin){
            //管理员界面
            const loginCheckResult = loginCheck(req)
            if(loginCheckResult){
                return loginCheckResult //尚未登录
            }
            author = req.session.username
        }


        // result 是一个返回的promise
        const result = getList(author,keyword)

        // resolve里面返回的就是listData
        // 返回个promise
        return result.then(listData =>{
            return new SuccessModel(listData)
        })
    }

    if(method === 'GET' && req.path === '/api/blog/detail'){

        // const data = getDetail(id)
        // return new SuccessModel(data)

        const result = getDetail(id)
        return result.then(data =>{
            return new SuccessModel(data)
        })
    }

    //之前学的是异步:通过数据流的方式来接受数据
    if(method === 'POST' && req.path === '/api/blog/new'){
        // const data = newBlog(req.body)
        // return new SuccessModel(data)

        const loginCheckResult = loginCheck(req)
        if(loginCheckResult){  //有返回
            //未登录
            return loginCheckResult  //下面就不会再执行
        }

        req.body.author=req.session.username  //登陆验证已经通过
        const result = newBlog(req.body)
        return result.then(data =>{
            return new SuccessModel(data)
        })

        
    }

    if(method === 'POST' && req.path === '/api/blog/update'){
        const loginCheckResult = loginCheck(req)
        if(loginCheckResult){  //有返回
            //未登录
            return loginCheckResult  //下面就不会再执行
        }

        const result = updateBlog(id, req.body)
        return result.then(val=>{
            if(val){
                return new SuccessModel()
            }
            else{
                return new ErrorModel('更新博客失败')
            }
        })


    }

    if(method === 'POST' && req.path === '/api/blog/del'){

        const loginCheckResult = loginCheck(req)
        if(loginCheckResult){  //有返回
            //未登录
            return loginCheckResult  //下面就不会再执行
        }

        const author=req.session.username  //假数据,待开发登陆时再改成真实数据
        const result = delBlog(id,author)
        return result.then(val=>{
            if(val){
                return new SuccessModel()
            }
            else{
                return new ErrorModel('删除博客失败')
            }
        })
    }

}
module.exports = handleBlogRouter
