## 네이버 베스트 상품 크롤러 3.0 🚀
![이미지](https://github.com/gojaebeom/AmozonReviewCounter/blob/main/thumbnail.png)
💡 CORS 등 보안사항이 있어 직접 네이버 사이트에 들어가 DOM을 변조하여 크롤링하는 방법을 사용합니다.

### 사용 목적 
- 네이버의 인기 상품의 데이터 수집

### 사용 방법
#### top20ListCrawler.js
1. [네이버 쇼핑 top 100](https://search.shopping.naver.com/best100v2/main.nhn) 사이트에 접속한다. 
2. (윈도우 os 기준) F12 키를 눌러 개발자모드의 콘솔창을 켠다.
3. top20ListCrawler.js 파일의 소스코드를 전체 복사하여 실행한다.
4. 다른 새창을 키고 [카테고리 페이지](https://search.shopping.naver.com/best100v2/main.nhn)에 접속하여 원하는 카테고리에 들어간다.
5. 들어간 카테고리의 url을 복사하여 탐색한다.([샘플](https://search.shopping.naver.com/best100v2/detail.nhn?catId=50000008))
6. 탐색할때 개발자모드 창의 Network의 검색창에 'paged-reviews?page=1'를 치면 해당 소스 파일들이 추가되는 것을 볼 수 있다.
7. 해당 파일은 같은 파일이 두개씩 올라오는데 홀수에 하나씩 링크를 복사하여 productReviewCrawler.js 로 실행한 앱의 url에 붙여넣고 날짜를 지정하여 탐색하면 된다.
8. 추출한 데이터는 데이터 복사 버튼을 클릭하면 상품코드, 전체리뷰수, 검색리뷰수가 복사가 된다. 
9. 복사한 파일을 네이버 TOP20 상품리스트 크롤러의 해당 상품 input박스에 복사 후 마우스로 다른 공간을 클릭하면 데이터가 자동 삽입이된다.
10. 추출한 데이터를 사용자의 db에 넣고 싶은 경우 top20ListCrawler.js 파일 하단의 reviewParser 함수에서 진행가능

#### productReviewCrawler.js 
1. 스마트스토어의 아무 회사의 스토어에 접속(스마트스토어 메인은 안됌) [샘플주소](https://smartstore.naver.com/pgw)  
2. 개발자모드(F12)를 켜고 Console 메뉴로 변경
3. productReviewCrawler.js  파일 내용을 전체 복사하여 입력후 enter
4. 화면이 새로 갱신되면 성공