var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var autoIncrement = require('mongoose-auto-increment');

var InviteSchema = new Schema({
    lecture : String,
    send_num : String,
    send_name : String,
    get_num : String,
    get_name : String,
    okay : {
        type : Boolean,
        default : true
    },
    year : String
    
});

InviteSchema.plugin( autoIncrement.plugin, { model : "invites", field : "id", startAt : 1 });
module.exports = mongoose.model('invites', InviteSchema);