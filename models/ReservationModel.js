var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var autoIncrement = require('mongoose-auto-increment');

var ReservationSchema = new Schema({
    stu_name : String,
    stu_num : String,
    class : String,
    year : String,
    month : String,
    day : String
    

});

ReservationSchema.plugin( autoIncrement.plugin, { model : "reservation", field : "id", startAt : 1 });
module.exports = mongoose.model('reservation', ReservationSchema);

