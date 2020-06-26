var express = require('express');
const nodemailer = require('nodemailer');
const smtpPool = require('nodemailer-smtp-pool');

var UserModel = require('../models/UserModel');

// smtpPool는 smtp서버를 사용하기 위한 모듈로
// transporter객체를 만드는 nodemailer의 createTransport메소드의 인자로 사용된다.

module.exports = function (lecture, sender,email) {

  const config = {
    mailer: {
      service: 'Gmail',
      host: 'localhost',
      port: '3000',
      user: 'imehufs@gmail.com',
      password: 'imehufs!@#',
    },
  };

  const from = '< imehufs@gmail.com >';
  const to = email;
  const subject = 'HITTS 팀 초청 알람이 왔습니다!!';
  const html = lecture + ' 과목에서 ' + sender + '님이 팀 초대를 보냈습니다. 확인바랍니다!!!!';
  // const text = 'This is just text.';

  const mailOptions = {
    from,
    to,
    subject,
    html,
    // text,
  };
  // 본문에 html이나 text를 사용할 수 있다.

  const transporter = nodemailer.createTransport(smtpPool({
    service: config.mailer.service,
    host: config.mailer.host,
    port: config.mailer.port,
    auth: {
      user: config.mailer.user,
      pass: config.mailer.password,
    },
    tls: {
      rejectUnauthorize: false,
    },
    maxConnections: 5,
    maxMessages: 10,
  }));

  // 메일을 전송하는 부분
  transporter.sendMail(mailOptions, (err, res) => {
    if (err) {
      console.log(email);
    } else {
      console.log('하......');
    }

    transporter.close();
  });
};
