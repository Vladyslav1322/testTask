const {Schema, model} = require('mongoose');

const RoleEntity = new Schema({
    value: {
        type: String,
        unique: true,
    },
});

module.exports = model("RoleEntity", RoleEntity);