import sys
from pymongo import MongoClient
from selenium import webdriver
from bs4 import BeautifulSoup


client = MongoClient('localhost', 27017)
db = client.hitts

f = sys.argv[1]
password = sys.argv[2]

# Chrome의 경우 | 아까 받은 chromedriver의 위치를 지정해준다.
driver = webdriver.Chrome('/Users/Administrator/Documents/chromedriver_win32/chromedriver')

# 암묵적으로 웹 자원 로드를 위해 3초까지 기다려 준다.
driver.implicitly_wait(1)

# 웹 페이지 열기
driver.get('http://eclass2.hufs.ac.kr:8181/ilos/main/member/login_form.acl')

# 아이디/비밀번호를 입력해준다.


driver.find_element_by_name('usr_id').send_keys(f)
driver.find_element_by_name('usr_pwd').send_keys(password)

#로그인 버튼 누르기
submit_element = driver.find_element_by_css_selector(".btntype").click()

try : 

    driver.get('http://eclass2.hufs.ac.kr:8181/ilos/main/main_form.acl')
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


    driver.quit()
    db.now_lectures.update({"username" : f , "lecture" : data })

    print('success')
except Exception as e:
    print(e)
    driver.quit()
    print('fail')


