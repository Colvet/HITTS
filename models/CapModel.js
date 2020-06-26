var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var autoIncrement = require('mongoose-auto-increment');

var CapSchema = new Schema({
    team_name : String,
    theme : String,
    category : String,
    professional : String,
    created_at : {
        type : Date,
        default : Date.now()
    },
    result : String,   
    year : String,   
    writer : String,
    writer_num : String
});

CapSchema.virtual('getDate').get(function () {
    var date = new Date(this.created_at);
    return {
        year : date.getFullYear(),
        month : date.getMonth()+1,
        day : date.getDate()
    }
  });


CapSchema.plugin(autoIncrement.plugin, {model : 'caps', field : 'id', startAt : 1});
module.exports = mongoose.model('caps', CapSchema);


