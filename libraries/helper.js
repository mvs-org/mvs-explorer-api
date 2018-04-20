var functions = {};

module.exports=functions;

functions.checkError = function(condition, message, returnOnSuccess){
    return new Promise((resolve,reject)=>{
        if(condition)
            resolve(returnOnSuccess);
        else
            reject(Error(message));
    });
};
