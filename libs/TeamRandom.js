var express = require('express');
var co = require('co');

var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var autoIncrement = require('mongoose-auto-increment');

var UserModel = require('../models/UserModel');
var RandomModel = require('../models/RandomModel');
var TeamModel = require('../models/TeamModel');

var dt = new Date();
Array.prototype.shuffle = function() {
    var i = this.length, j, temp;
    if ( i == 0 ) return this;
    while ( --i ) {
        j = Math.floor( Math.random() * ( i + 1 ) );
        temp = this[i];
        this[i] = this[j];
        this[j] = temp;
    }
    return this;
}


var Numbering = function (total, limit, team) { 
    var start = 0;
    var ranNum = [];
    num = parseInt(total/limit); //7   팀 갯수
    remain = total%limit;   //2        남은인원
    plus = num * limit;  //35          남은 인원 시작 번호

    // 팀 1에 0,0,0,0,0 팀 2에 1,1,1,1,1 .... 뿌려주기
    for(var i = 0; i < num ; i++){
        for(var j = 0; j < limit ; j ++){
            team[start] = i;
            start ++;
        }
    }
    // 팀 남은 인원 랜덤으로 팀 선택
    for(var i = 0; i < remain ; i++){
        ranNum[i] = Math.floor(Math.random() * num);
        for(var j = 0; j < i; j++ ){
            // 이전값과 비교하여 중복일경우 random 값 다시 생성
            if(ranNum[i] == ranNum[j]){
                i = i - 1;
                break;
            }
        }
    }
    // 남은 인원 할당
    for(var i = 0; i < remain ; i ++){
        team[plus] = ranNum[i];
        plus++;
    }
};



module.exports = function (lecture, select) {
    var team = [];
    var member = [];

    // var getData = co(function *() {
    //     var user = yield UserModel.find({now_lecture : lecture},{"_id" : false, "stu_name" : true}).exec();
    //     return user;
    // });
    UserModel.find({now_lecture : lecture, pro : false}, {_id : false, username : true,stu_name : true}).exec(function (err, user) { 
        if(!user){
            console.log("없엉");
        }
        if(!err){
            TeamModel.deleteMany({lecture : lecture}).exec();
            var num = user.map(function (obj) {
                return obj.username;
            });
            var name = user.map(function (obj) {
                return obj.stu_name
            })
            
        }
        var total = name.length;   //총 인원수
        var limit = parseInt(select);                //팀원 수
        team_num = parseInt(total/limit);

        Numbering(total, limit, team);
        team.shuffle();

        

        for(var t=0; t < team_num ; t++){
            for(var k=0; k < team.length; k++){
                if(team[k]==t){
                    member.push({stu_name : name[k], stu_num : num[k]});
                }
            }
            random = new TeamModel ({
                lecture : lecture,
                year : dt.getFullYear(),
                member : member
           });
           random.save({});
           member = [];
        }
        if(err) console.log(err);
    });
    return "success";
    
}


