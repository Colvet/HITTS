var PythonShell = require('python-shell');


module.exports = function (req, res, next ) {
    var options = {
        mode: 'text',
        pythonPath: '',
        pythonOptions: ['-u'],
        scriptPath: '',
        args: [req.body.username, req.body.password]
    };
    PythonShell.run('Loading.py', options, function (err, results) {
        
        if (results=='fail\r') {
            res.send('<script>alert("eclass ID/pw 확인 바랍니다."); location.href="/hitts/accounts/eclass/join";</script>');
        }
        else{
            res.send('<script>alert("회원가입 성공"); location.href="/hitts/accounts/login";</script>');
        };
    });
};



