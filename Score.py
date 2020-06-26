import sys
import re
import datetime


from pymongo import MongoClient
import numpy

client = MongoClient('localhost', 27017)
db = client.hitts

now = datetime.date.today()

stu = db.users.find({ "cap" : True, "year" : str(now.year), "pro" : False})


op = list()
lo = list()
an = list()
inf = list()
qu = list()
da = list()
tot_username = list()
tot_stu_name = list()

try :
    for i in stu:
        op.append(i['point'][0])
        lo.append(i['point'][1])
        an.append(i['point'][2])
        inf.append(i['point'][3])
        qu.append(i['point'][4])
        da.append(i['point'][5])
        tot_username.append(i['username'])
        tot_stu_name.append(i['stu_name'])


    avg_op = numpy.mean(op)
    avg_lo = numpy.mean(lo)
    avg_an = numpy.mean(an)
    avg_inf =numpy.mean(inf)
    avg_qu = numpy.mean(qu)
    avg_da = numpy.mean(da)

    std_op = numpy.std(op)
    std_lo = numpy.std(lo)
    std_an = numpy.std(an)
    std_inf =numpy.std(inf)
    std_qu = numpy.std(qu)
    std_da = numpy.std(da)

    point = list()
    for num in range(0, len(op)) :
        point.append((op[num]-avg_op) / std_op)
        point.append((lo[num]-avg_lo) / std_lo)
        point.append((an[num]-avg_an) / std_an)
        point.append((inf[num]-avg_inf) / std_inf)
        point.append((qu[num]-avg_qu) / std_qu)
        point.append((da[num]-avg_da) / std_da)

        db.users.update_one({"username" : tot_username[num]},{"$set": { "score" : point}})  
        print(point)
        point = list()

    print('success')
except Exception as e:
    print(e)




