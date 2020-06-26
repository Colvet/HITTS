var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var autoIncrement = require('mongoose-auto-increment');

var RandomSchema = new Schema({
    lecture : String,
    member : [{
        stu_name : { type : String},
        stu_num : { type : String},
        _id : false
    }],
    year : String
    

});

RandomSchema.plugin( autoIncrement.plugin, { model : "randoms", field : "id", startAt : 1 });
module.exports = mongoose.model('randoms', RandomSchema);

