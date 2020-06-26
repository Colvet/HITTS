var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var autoIncrement = require('mongoose-auto-increment');

var TimetableSchema = new Schema({
    stu_name : String,
    stu_num : String,
    lecture : String,
    year : String,
    date : [{
        day : {type : String},
        _id : false
    }],


});

TimetableSchema.virtual('getDate').get(function () {
    var date = new Date(this.created_at);
    return {
        year : date.getFullYear(),
        month : date.getMonth()+1,
        day : date.getDate()
    }
  });


TimetableSchema.plugin(autoIncrement.plugin, {model : 'timetable', field : 'id', startAt : 1});
module.exports = mongoose.model('timetable', TimetableSchema);