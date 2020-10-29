/* DOM 그리기 🎨 */
domRedraw();
function domRedraw()
{
    document.body.style.display = "flex";
    document.body.style.flexDirection = "column";
    document.body.style.justifyContent = "center";
    document.body.style.alignItems = "center";
    document.body.style.height = "100vh";
    document.body.style.background = "linear-gradient(#04B431, #04B486)";
    document.body.innerHTML = `
    <form id="bestForm" style="width:800px;padding:12px;border-radius:5px;background:#FFFFFF;">
        <h1 style="color:'#2E2E2E';margin:10px 0px 20px 0px;">네이버 TOP20 상품 리스트 크롤러 🧀</h1>
        <label for="bestUrl">Best 상품 URL 20개 추출하기</label>
        <input id="bestUrl" style="width:97%;padding:12px 8px;border: 1px solid #BDBDBD;border-radius:3px;"><br><br>
        <button type="button" id="bestButton" style="padding:14px 15px;border:none;border-radius:3px;background:#04B431;color:white;font-weight:bold;">탐색</button>
        <br>
        <br>
        <label for="date">상품이름을 클릭하면 해당 상품페이지로 이동합니다.</label>
        <table style="border-collapse:collapse;border: 1px solid #BDBDBD;width:100%;table-layout:fixed">
            <tr>
                <th style="border: 1px solid #BDBDBD;padding:8px;">No</th>
                <th style="border: 1px solid #BDBDBD;padding:8px;">상품이름</th>
                <th style="border: 1px solid #BDBDBD;padding:8px;">가격</th>
                <th style="border: 1px solid #BDBDBD;padding:8px;">채널이름</th>
                <th style="border: 1px solid #BDBDBD;padding:8px;">카테고리</th>
                <th style="border: 1px solid #BDBDBD;padding:8px;">상품코드</th>
                <th style="border: 1px solid #BDBDBD;padding:8px;">전체리뷰수</th>
                <th style="border: 1px solid #BDBDBD;padding:8px;">검색리뷰수</th>
            </tr>
            <tbody id="productIdTbody" style="max-height:300px;overflow:hidden;"></tbody>
        </table>
    </form>
    <div id="bestPageWrap" style="display:none;"></div>
    <div id="reviewPageWrap" style="display:none;"></div>
    `;
}
/* 사용하기 편하게 dom을 변수에 할당 🚗 : url, date, button, tbody */
const bestButton = document.getElementById('bestButton');
const bestUrl = document.getElementById('bestUrl');
const productIdTbody = document.getElementById('productIdTbody');

const bestPageWrap = document.getElementById('bestPageWrap');
const reviewPageWrap = document.getElementById('reviewPageWrap');


/* 탐색버튼 클릭 이벤트 🔥 */
bestButton.onclick = async () => 
{
    //url, date 미 입력시 빠꾸
    if(!bestUrl.value)
    {
        alert('url 은 필수 입력값입니다. ☹');
        return false;
    }

    //버튼 문구 변경
    bestButton.textContent = '탐색중..';
    productIdTbody.innerHTML = '';

    //bestProduct 상품들을 조회, 조회가 끝나면 카테고리명과 상품 20개의 각각의 정보들을 가져옴
    let {category , products} = await getBestProductList(bestUrl.value);
    let i = 0;
    let searchReview = 0;
    for(let product of products)
    {
        productIdTbody.innerHTML += 
        `
        <tr style="height:30px;text-align:center;">
            <td>${++i}</td>
            <td title="${product.title}" style="text-overflow:ellipsis;overflow:hidden;white-space:nowrap;">${product.title}</td>
            <td>${product.price}</td>
            <td title="${product.channelName}" style="text-overflow:ellipsis;overflow:hidden;white-space:nowrap;">${product.channelName}</td>
            <td>${category}</td>
            <td>조회 대기</td>
            <td>조회 대기</td>
            <td id="searchReview${i}">조회 대기</td>
        </tr>
        `;
        
        try
        {
            await getProductReviewList(product.productUrl, i);
        }catch(err)
        {
            console.error("에러발생!!");
            console.error(err);
        }
        

        console.table
        ({
            'no':i,
            '상품명':product.title,
            '카테고리':category,
            '채널이름':product.channelName,
            '상품가격':product.price,
        });
    }

    //버튼 문구 변경
    bestButton.textContent = '탐색';
    bestUrl.value = '';

    //best iframe 제거
    while (reviewPageWrap.hasChildNodes()) {
        reviewPageWrap.removeChild(reviewPageWrap.firstChild);
    }
    console.log(`%c top 20 rank iframe 제거`, `color:green`);
}

/* TOP 20 상품 리스트 가져오기 🥞 */
async function getBestProductList(url)
{
    const rankListDom = await fetch(url).then(res=>res.text()).then(html=>html);
    bestPageWrap.innerHTML = rankListDom;

    //카테고리 값 추출 후 category 변수에 할당
    const category = bestPageWrap.querySelector('.search_breadcrumb').querySelector('.on').textContent;

    const rankListDom_SoltByNomalProduct = 
        await fetch(`https://search.shopping.naver.com/best100v2/detail/prod/list.nhn?listType=B10001&catId=${url.split('catId=')[1]}`)
                .then(res=>res.text()).then(html=>html);
    bestPageWrap.innerHTML = rankListDom_SoltByNomalProduct;

    //상품 정보들을 배열에 담기 위해 products 배열 및 각 값을 담을 변수들 선언
    const products = [];
    let productUrl;
    let title;
    let price;
    let channelName;
    for(let i = 1; i <= 20; i++)
    {
        //상품페이지 링크
        productUrl = document.querySelector(`#productListArea  li:nth-child(${i})`).getElementsByTagName('a')[0].href;
        //타이틀 값을 추출 title 변수에 할당
        title = document.querySelector(`#productListArea  li:nth-child(${i})`).getElementsByTagName('a')[0].title;
        //가격 값을 추출, 숫자 사이의 ','를 제거하고 정수값으로 변환 후 price 변수에 할당
        price = +document.querySelector(`#productListArea  li:nth-child(${i})`)
                    .getElementsByClassName("price")[0].getElementsByClassName("num")[0].textContent.replaceAll(',', "");
        //채널이름을 받아온다.
        channelName = document.querySelector(`#productListArea  li:nth-child(${i})`)
                    .getElementsByClassName("info")[0].getElementsByTagName('span')[0].getElementsByTagName('a')[0].textContent;

        //products 배열에 객체 타입으로 값 저장
        products.push({productUrl, title, price, channelName});
    }    

    return {category, products};
}

/* 상품의 리뷰 리스트 가져오기 🍔 */
async function getProductReviewList(url,  i)
{
    return new Promise((resolve, reject)=>
    {
        const iframe = document.createElement('iframe');
        iframe.setAttribute('id',`productReviewIframe${i}`);
        iframe.src = url;

        try{
            reviewPageWrap.appendChild(iframe);
        }catch(err){
            console.error("에러발생!!");
            console.error(err);
        }
        
        const productReviewIframe = document.getElementById(`productReviewIframe${i}`);

        productReviewIframe.onload = () => 
        {
            console.log(`%c product rivew iframe 생성`, `color:green`);
            resolve('done!');
        }
    })
}