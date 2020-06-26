var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var autoIncrement = require('mongoose-auto-increment');

var ProjectSchema = new Schema({
    lecture : String,
    writer_num : String,
    title : [{
        title_name : {type : String},
        _id : false
    }],
    year : String
    
    
});


ProjectSchema.plugin(autoIncrement.plugin, {model : 'projects', field : 'id', startAt : 1});
module.exports = mongoose.model('projects', ProjectSchema);