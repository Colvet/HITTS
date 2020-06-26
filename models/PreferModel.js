var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var autoIncrement = require('mongoose-auto-increment');

var PreferSchema = new Schema({
    lecture : String,
    stu_name : String,
    stu_num : String,
    prefer : [{
        rank : {type : String},
        _id : false
    }],
    assign : String,
    year : String
    
});

PreferSchema.plugin( autoIncrement.plugin, { model : "prefers", field : "id", startAt : 1 });
module.exports = mongoose.model('prefers', PreferSchema);