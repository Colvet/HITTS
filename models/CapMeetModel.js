var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var autoIncrement = require('mongoose-auto-increment');

var CapMeetSchema = new Schema({
    num : String,
    record : String,
    created_at : {
        type : Date,
        default : Date.now()
    },
    writer : String,
    writer_num : String,
    year : String
    
});

CapMeetSchema.virtual('getDate').get(function () {
    var date = new Date(this.created_at);
    return {
        year : date.getFullYear(),
        month : date.getMonth()+1,
        day : date.getDate()
    }
  });


CapMeetSchema.plugin(autoIncrement.plugin, {model : 'cap_meets', field : 'id', startAt : 1});
module.exports = mongoose.model('cap_meets', CapMeetSchema);