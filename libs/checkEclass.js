var PythonShell = require('python-shell');


module.exports = function (req, res, next ) {
    var options = {
        mode: 'text',
        pythonPath: '',
        pythonOptions: ['-u'],
        scriptPath: '',
        args: [req.body.username, req.body.password]
    };
    PythonShell.run('Checking.py', options, function (err, results) {
        if (results=='fail\r') {
            res.send('<script>alert("비밀번호를 다시 확인해 주세요"); location.href="accounts/join"</script>');
        }
        else{
            res.send('<script>alert("수정 완료"); location.href="/accounts/login";</script>');
        };
    });
};



