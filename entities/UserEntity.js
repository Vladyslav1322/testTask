const {Schema, model} = require('mongoose')

const UserEntity = new Schema({
    username: {
         type: String,
         unique: true,
         required: true
     },
    password: {
        type: String,
        required: true
    },
    boss: {
        type: String,
        default: null,
    },
    subordinates: [{
        type: String,
        default: null,
    }],
     role: {
         type: String,
         ref: "RoleEntity"
     }
})

module.exports = model("UserEntity", UserEntity)