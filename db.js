const {MongoClient} = require('mongodb')


let dbConnection

module.exports = {
    connectToDb:(cb)=>{
        const uri = "mongodb+srv://romankhromishin:test1234@cluster0.a60ndgf.mongodb.net/"
        MongoClient.connect(uri)
        .then((client)=>{
            dbConnection = client.db()
            return cb()
        })
        .catch(err=>{
            console.log(err)
            return cb(err)
        })
    },
    getDb: ()=>dbConnection
}
  