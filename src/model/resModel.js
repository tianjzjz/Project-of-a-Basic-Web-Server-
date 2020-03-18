class BaseModel{
    constructor(data, message){

        //data是个对象, message是个string
        
        if(typeof data === 'string'){
            this.message = data
            data = null
            message = null
        }

        if(data){
            this.data = data
        }

        if(message){
            this.message = message
        }
    }
}

//

class SuccessModel extends BaseModel{
    constructor(data, message){

        //执行父类的构造函数
        super(data, message)
        this.errno = 0
    }
}

class ErrorModel extends BaseModel{
    constructor(data, message){
        super(data, message)
        this.errno = -1
    }
}


//父类不用输出
module.exports = {
    SuccessModel,
    ErrorModel,
}