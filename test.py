import sys
import re

from pymongo import MongoClient
from selenium import webdriver
from bs4 import BeautifulSoup

client = MongoClient('localhost', 27017)
db = client.hitts

def infiniti():
    try:
        while True :
            driver.find_element_by_id('onceLecture').click()
    except Exception as e:
        pass

def cancel():
    try:
        while True :
            alert = driver.switch_to_alert()
            alert.dismiss()
    except Exception as e:
        pass




eclass_id = '201300624'
eclass_password = 'rlatlsgkr1'

# Chrome의 경우 | 아까 받은 chromedriver의 위치를 지정해준다.
driver = webdriver.Chrome('/Users/Administrator/Documents/chromedriver_win32/chromedriver')

# 암묵적으로 웹 자원 로드를 위해 3초까지 기다려 준다.
driver.implicitly_wait(1)

# 웹 페이지 열기
driver.get('http://eclass2.hufs.ac.kr:8181/ilos/main/member/login_form.acl')

# # 아이디/비밀번호를 입력해준다.

driver.find_element_by_name('usr_id').send_keys(eclass_id)
driver.find_element_by_name('usr_pwd').send_keys(eclass_password)

#로그인 버튼 누르기
submit_element = driver.find_element_by_css_selector(".btntype").click()
try:
    driver.get('http://eclass2.hufs.ac.kr:8181/ilos/main/main_form.acl')
    cancel()
    html = driver.page_source
    soup = BeautifulSoup(html, 'html.parser')


    # 크롤링 하기
    box = soup.find('div' ,{'class' : 'm-box2'})
    lecture = box.find_all("em")
    time = box.find_all('span')


    time_data = []
    lecture_data = []
    data = []
    
    for n in time:
        a= n.string.strip()
        time_data.append(a)

    del time_data[0:2]

    for n in lecture :
        b = n.string.strip()
        c = b.split()
        lecture_data = c[0]
        lecture = lecture_data.replace('[글로벌]','').replace('[서울]','')
        data.append(lecture)

    db.users.update_one({ "username" : eclass_id} , { '$set': { 'now_lecture' : data }} )

    driver.implicitly_wait(3)

    #수강목록으로 가기
    driver.get('http://eclass2.hufs.ac.kr:8181/ilos/mp/course_register_list_form.acl')

    # 이전학기 불러오기 버튼 클릭
    infiniti()
    
    html = driver.page_source
    soup = BeautifulSoup(html, 'html.parser')

    # 파싱
    notices = soup.find_all(["span","p"],"content-title")

    driver.quit()

    past_lecture = []

    for n in notices:
        title = n.string.strip()
        parse_title = re.sub('[(012)]','',title)
        past_lecture.append(parse_title)
    
    ff = set(past_lecture)

    operation = ["경영과학","계량분석개론","비즈니스어낼리틱스응용","비즈니스어낼리틱스입문","최적화모델링","확률적의사결정","경영수학"]
    logistics = ["생산계획및통제","SCM","프로세스분석및설계","제조공학및자동화실습","물류시스템"]
    analysis = ["공학경제","경영수학","기초확률및통계","공학회계","시뮬레이션","프로세스분석및설계","기업정보시스템","시스템통합및설계"]
    info = ["컴퓨터프로그래밍","자료구조및알고리즘","데이터베이스설계및응용","객체지향프로그래밍","통신및정보기술","산업정보프로그래밍","정보시스템개발및실습","시스템통합및설계","산업정보공학특론","산업경영공학특론"]
    quality = ["경영수학","기초확률및통계","공학통계","품질경영및관리","실험계획및분석","산업시스템공학특론","서비스경영","기술사업화","창업및기술사업화","기술경영전략"]
    data = ["산업경영공학특론","경영수학","기초확률및통계","데이터베이스설계및응용","데이터마이닝응용","데이터어낼리틱스특론","산업정보공학특론","공학통계"]

    op = set(operation)
    lo = set(logistics)
    an = set(analysis)
    inf = set(info)
    qu = set(quality)
    da = set(data)

    pt_operation = len(op.intersection(ff))
    pt_logistics = len(lo.intersection(ff))
    pt_analysis = len(an.intersection(ff))
    pt_info = len(inf.intersection(ff))
    pt_quality = len(qu.intersection(ff))
    pt_data = len(da.intersection(ff))

    asd = operation + logistics + analysis + info + quality + data

    pt_sum = len(ff.intersection(asd))

    abil_operation = pt_operation/(1-pt_operation/(pt_sum+1))
    abil_logistics = pt_logistics/(1-pt_logistics/(pt_sum+1))
    abil_analysis = pt_analysis/(1-pt_analysis/(pt_sum+1))
    abil_info = pt_info/(1-pt_info/(pt_sum+1))
    abil_quality = pt_quality/(1-pt_quality/(pt_sum+1))
    abil_data = pt_data/(1-pt_data/(pt_sum+1))

    point = list()
    point.append(abil_operation)
    point.append(abil_logistics)
    point.append(abil_analysis)
    point.append(abil_info)
    point.append(abil_quality)
    point.append(abil_data)

    # db.users.update_one({ 'username' : eclass_id } ,{ '$set': { 'past_lecture' : past_lecture, 'point' : point }} )
    print('success')
    print(past_lecture)
except Exception as e:
    driver.quit()
    print('fail')

    









