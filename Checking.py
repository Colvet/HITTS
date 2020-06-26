import sys
from pymongo import MongoClient
from selenium import webdriver
from bs4 import BeautifulSoup

client = MongoClient('localhost', 27017)

db = client.hitts
a = sys.argv[1]
b = sys.argv[2]
# c = sys.argv[3]

# Chrome의 경우 | 아까 받은 chromedriver의 위치를 지정해준다.
driver = webdriver.Chrome('/Users/Administrator/Documents/chromedriver_win32/chromedriver')

# 암묵적으로 웹 자원 로드를 위해 3초까지 기다려 준다.
driver.implicitly_wait(1)

# 웹 페이지 열기
driver.get('http://eclass2.hufs.ac.kr:8181/ilos/main/member/login_form.acl')

# # 아이디/비밀번호를 입력해준다.
# driver.find_element_by_name('usr_id').send_keys('201300625')
# driver.find_element_by_name('usr_pwd').send_keys('rlatlsgkr1')

driver.find_element_by_name('usr_id').send_keys(a)
driver.find_element_by_name('usr_pwd').send_keys(b)

#로그인 버튼 누르기
submit_element = driver.find_element_by_css_selector(".btntype").click()

try:
    driver.get('http://eclass2.hufs.ac.kr:8181/ilos/mp/course_register_list_form.acl')
    driver.quit()
    print('success')

except Exception as e:
    driver.quit()
    print('fail')

    









