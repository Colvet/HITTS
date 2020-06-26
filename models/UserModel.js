var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var autoIncrement = require('mongoose-auto-increment');

var UserSchema = new Schema({
    username : {
        type : String,
        required : [true, '아이디는 필수입니다']
    },
    password : {
        type : String,
        required : [true, '패스워드는 필수입니다']
    },
    stu_name : String,
    email : String,
    sex : String,
    point : Array,
    cap : {
        type : Boolean,
        default : false
    },
    year : String,
    score : Array,
    now_lecture : Array,
    past_lecture : Array,
    pro : {
        type : Boolean,
        default : false
    },

});

UserSchema.plugin( autoIncrement.plugin, { model : "users", field : "id", startAt : 1 });
module.exports = mongoose.model('users', UserSchema);