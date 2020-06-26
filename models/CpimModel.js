var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var autoIncrement = require('mongoose-auto-increment');

var CpimSchema = new Schema({
    title : String,
    record : String,
    description : String,
    writer : String,
    writer_num : String,
    created_at : {
        type : Date,
        default : Date.now()
    },
    
});

CpimSchema.virtual('getDate').get(function () {
    var date = new Date(this.created_at);
    return {
        year : date.getFullYear(),
        month : date.getMonth()+1,
        day : date.getDate()
    }
  });


CpimSchema.plugin(autoIncrement.plugin, {model : 'cpims', field : 'id', startAt : 1});
module.exports = mongoose.model('cpims', CpimSchema);