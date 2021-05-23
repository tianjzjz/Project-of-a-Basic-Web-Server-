const{exec} = require('../db/mysql')
const xss = require('xss')

const getList = async (author, keyword) => {

    let sql = `select * from blogs where 1=1 `
    if(author){
        sql+= `and author='${author}' `
    }
    if(keyword){
        //模糊查询
        sql+=`and title like '%${keyword}%' `
    }
    sql += `order by createtime desc;`

    // 返回promise
    return await exec(sql)

}


const getDetail = async (id) => {

    const sql = `select * from blogs where id='${id}'`

    const rows = await exec(sql)
    return rows[0]

    // return await exec(sql).then( rows =>{
    //     return rows[0]
    // })

}

const newBlog = async (blogData = {}) =>{

    //返回的是新建博客插入到数据表里的id

    const title = xss(blogData.title)
    const content = xss(blogData.content)
    const author =blogData.author
    const createtime = Date.now()

    const sql=`
    insert into blogs (title, content, createtime,author)
    values('${title}','${content}',${createtime},'${author}');
    `

    const insertData = await exec(sql)
    return {
        id: insertData.insertId
    }

    // return exec(sql).then(insertData =>{
    //     // console.log('insertData is', insertData)
    //     return{
    //         id:insertData.insertId
    //     }
    // })
    

}

const updateBlog = async (id,blogData = {}) =>{
    
    const title = blogData.title
    const content = blogData.content

    const sql=`
        update blogs set title='${title}', content='${content}' where id='${id}'
    `

    const updateData = await exec(sql)
    if(updateData.affectedRows > 0){
        return true
    }
    return false

    // return exec(sql).then(updateData=>{
    //     // console.log('updatedata is ',updateData)
    //     if(updateData.affectedRows > 0){
    //         return true
    //     }
    //     return false
    // })
    

}

const delBlog = async (id,author) =>{
    const sql = `delete from blogs where id='${id}' and author='${author}'`
    const delData = await exec(sql)
    if(delData.affectedRows > 0){
        return true
    }
    return false

    // return exec(sql).then(delData=>{
    //     if(delData.affectedRows > 0){
    //         return true
    //     }
    //     return false
    // })
}
module.exports = {
    getList,
    getDetail,
    newBlog,
    updateBlog,
    delBlog
}