var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var autoIncrement = require('mongoose-auto-increment');

var TeamSchema = new Schema({
    lecture : String,
    member : [{
        stu_name : { type : String},
        stu_num : { type : String},
        _id : false
    }],
    prefer : String,
    wcount : Number,
    year : String
    

});

TeamSchema.plugin( autoIncrement.plugin, { model : "teams", field : "id", startAt : 1 });
module.exports = mongoose.model('teams', TeamSchema);
