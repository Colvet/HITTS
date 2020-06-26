var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var autoIncrement = require('mongoose-auto-increment');

var CapFileSchema = new Schema({
    num : String,
    class : String,
    record : String,
    created_at : {
        type : Date,
        default : Date.now()
    },
    year : String,
    writer : String,
    writer_num : String
    
});

CapFileSchema.virtual('getDate').get(function () {
    var date = new Date(this.created_at);
    return {
        year : date.getFullYear(),
        month : date.getMonth()+1,
        day : date.getDate()
    }
  });


CapFileSchema.plugin(autoIncrement.plugin, {model : 'cap_files', field : 'id', startAt : 1});
module.exports = mongoose.model('cap_files', CapFileSchema);