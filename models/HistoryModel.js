var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var autoIncrement = require('mongoose-auto-increment');

var HistorySchema = new Schema({
    title : String,
    lecture : String,
    term : String,
    year : String,
    record : String,
    description : String,
    created_at : {
        type : Date,
        default : Date.now()
    },
    writer : String
    
});

HistorySchema.virtual('getDate').get(function () {
    var date = new Date(this.created_at);
    return {
        year : date.getFullYear(),
        month : date.getMonth()+1,
        day : date.getDate()
    }
  });


HistorySchema.plugin(autoIncrement.plugin, {model : 'histories', field : 'id', startAt : 1});
module.exports = mongoose.model('histories', HistorySchema);