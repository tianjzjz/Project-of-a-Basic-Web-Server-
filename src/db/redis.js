const redis = require('redis')
const {REDIS_CONF} = require('../conf/db')

// 创建客户端

const redisClient = redis.createClient(REDIS_CONF.port, REDIS_CONF.host)
redisClient.on('error',err =>{
    console.error(err)
})

function set(key,val){
    if(typeof val === 'object'){
        val = JSON.stringify(val)  //对象转字符串
    }
    redisClient.set(key,val,redis.print)

}

function get(key){

    const promise = new Promise((resolve,reject)=>{

        redisClient.get(key,(err,val) =>{
            if(err){
                reject(err)
                return
            }
            if(val==null){
                resolve(null)
                return
            }

            try{
                resolve(
                    JSON.parse(val) //如果是JSON就直接返回一个JSON对象
                )

            }catch(ex){ //如果不是JSON格式就会不成功
                resolve(val)

            }

        })
    })

    return promise
    

}

module.exports = {
     set,
     get
}