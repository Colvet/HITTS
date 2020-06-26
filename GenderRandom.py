# Input data element is 'm' and 'z' and 'c'
# m is total student, z is upper bound total student in each team, c is binary(1 is girl, 0 is boy)

import sys
import re
import datetime

from pymprog import *
from random import *
from pymongo import MongoClient


client = MongoClient('localhost', 27017)
db = client.hitts

lecture = sys.argv[1]
limit = int(sys.argv[2])


now = datetime.date.today()

tot_username = list()
tot_name = list()
gender = list()
c = list()

sexx = db.users.find({'now_lecture' : lecture, 'pro' : False})
db.teams.remove({'lecture' : lecture, "year" : str(now.year)})

try : 
    for i in sexx :
        tot_username.append(i['username'])
        tot_name.append(i['stu_name'])
        gender.append(int(i['sex']))
        c.append(int(i['sex']))

    m = len(tot_username) # student
    M = range(m) # set of student
    z = limit # 교수가 지정해주는 최소 팀원 수
    n = m//z # team 수 저절로 지정
    N = range(n)
    bigM = 1000



    p = model("ratio")
    p.verb = True
    A = iprod(M, N)
    x = p.var('x', A, kind=bool) # kind=bool is binary
    y = p.var('y', N)
    W = p.var('W')
    c = par('c', c)

    # First Model Constraints
    # p.st([sum(x[k,j] for j in N) == 1 for k in M], 'student')
    [sum(x[k,j] for j in N) == 1 for k in M]
    # p.st([sum(x[i,k] for i in M) >=LB for k in N], 'LBproject')
    [sum(x[i,k] for i in M) >=z for k in N]
    # p.st([sum(x[i,k] for i in M) <=LB+1 for k in N], 'UBproject')
    [sum(x[i,k] for i in M) <=z+1 for k in N]
    # p.st([sum(x[i,k]*c[i] for i in M) == y[k] for k in N], 'sum')
    [sum(x[i,k]*c[i] for i in M) == y[k] for k in N]
    # p.st(W >= y[k] for k in N)
    [W >= y[k] for k in N]

    # First Model Run
    p.min(W)
    p.solve()

    Obj = p.vobj()
    assign = [(i,j) for i in M for j in N 
                    if x[i,j].primal==1]


    # First Model assign reset
    p.end()

    username = list()
    name = list()
    team = list()
    mem = dict()
    member = list()
    wcount =0
    stu_num = len(tot_username)

    for i in range(0, n) :
        for j in range(0, stu_num):
            if assign[j][1] == i :
                username.append(tot_username[j])
                name.append(tot_name[j])
                wcount =  wcount + gender[j]
                mem['stu_num'] = tot_username[j]
                mem['stu_name'] = tot_name[j]
                member.append(mem)
                mem = dict()
        tttt = { "lecture" : lecture,
            "year" : str(now.year),
            "member" : member,
            "wcount" : wcount,
            "prefer" : ""
        }
        db.teams.insert_one(tttt)
        
        
        username = list()
        name = list()
        member = list()
        wcount = 0
    print('success')
    

except Exception as e:
    print(e)
    print(now.year)