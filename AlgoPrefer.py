import sys
import datetime

from pymprog import *
from random import *
from pymongo import MongoClient



client = MongoClient('localhost', 27017)
db = client.hitts
now = datetime.date.today()

lecture = sys.argv[1]

db.prefers.find({'lecture' : lecture, 'assign' : '?' ,"year" : str(now.year)})
db.teams.remove({'lecture' : lecture ,"year" : str(now.year)})

try : 
    prefer = db.prefers.find({ "lecture" : lecture, "year" : str(now.year)})
    project = db.projects.find({"lecture" : lecture, "year" : str(now.year) })

    a = list()
    b = list()
    c = tuple()
    li = list()

    tot_username = list()
    tot_name = list()



    for i in prefer :
        a.append(i['prefer'])
        tot_username.append(i['stu_num'])
        tot_name.append(i['stu_name'])
    
    stu_num = len(a)  #학생수
    project_num = len(a[0]) #프로젝트수
    for j in range(0, stu_num) :
        for k in range(0, project_num) :
            b.append(int(a[j][k]['rank']))

    start = 0 
    num = len(a[0])  #숫자
    
    for i in range(0, stu_num) :
        for j in range(start, num):
            c += (b[j],)
        li.append(c)
        c = tuple()
        start = start + project_num
        num = num + project_num
        if num > stu_num * project_num:
            break

    m = len(a) # student   len(a)  
    n = len(a[0]) # project     len(a[0])
    N = range(n) # set of project
    M = range(m) # set of student
    LB = m//n
    bigM = 1000

    # 모델시작
    p = model("assign")
    p.verb = True
    A = iprod(M, N)
    x = p.var('x', A, kind=bool) # kind=bool is binary
    W = p.var('W')
    tc = par('li', li)
    bigM = par('bigM', bigM)

    # First Model Objective Function
    p.max(sum(tc[i][j]*x[i,j] for i,j in A), 'allocate')

    # First Model Constraints
    p.st([sum(x[k,j] for j in N) == 1 for k in M], 'student')
    p.st([sum(x[i,k] for i in M) >=LB for k in N], 'LBproject')
    p.st([sum(x[i,k] for i in M) <=LB+1 for k in N], 'UBproject')

    # First Model Run
    p.solve()
    firstObj = p.vobj()
    assign = [(i,j) for i in M for j in N 
                    if x[i,j].primal==1]


    # First Model assign reset
    i,j = assign[0]

    # Second Model Objective Function
    p.max(W)

    # Second Model Constraints
    p.st([sum(tc[i][j]*x[i,j] for i,j in A) == firstObj], 'first objective')
    p.st([sum(x[k,j] for j in N) == 1 for k in M], '2student')
    p.st([sum(x[i,k] for i in M) >=LB for k in N], '2LBproject')
    p.st([sum(x[i,k] for i in M) <=LB+1 for k in N], '2UBproject')
    for i,j in A:
        p.st([(tc[i][j]+random())*x[i,j]+bigM*(1-x[i,j]) >= W], 'add')

    # Second Model Run
    p.solve()
    secondObj = p.vobj()

    assign = [(i,j) for i in M for j in N
                    if x[i,j].primal==1]


    # for i,j in assign:
    #     print("Student %d gets Project %d with Preference %r"%(i, j, tc[i][j]))

    p.end()


    username = list()
    name = list()
    team = list()
    mem = dict()
    member = list()


    for i in range(0, project_num) :
        for j in range(0, stu_num):
            if assign[j][1] == i :
                username.append(tot_username[j])
                name.append(tot_name[j])
                mem['stu_num'] = tot_username[j]
                mem['stu_name'] = tot_name[j]
                db.prefers.update_one({"stu_num" : tot_username[j]},{ "$set": {"assign" : i+1}})
                member.append(mem)
                mem = dict()
        tttt = { "lecture" : lecture,
            "year" : str(now.year),
            "member" : member,
            "prefer" : i+1
        }
        # db.teams.insert_one(tttt)
        
        username = list()
        name = list()
        member = list()
    print('success')
except Exception as e:
    # print(e)
    print('fail')



            
        


