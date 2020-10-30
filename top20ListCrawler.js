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
        <input id="bestUrl" style="width:85%;padding:12px 8px;border: 1px solid #BDBDBD;border-radius:3px;">
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
    for(let product of products)
    {
        productIdTbody.innerHTML += 
        `
        <tr style="height:30px;text-align:center;padding:8px;border-bottom:1px solid gray;">
            <td>${++i}</td>
            <td class="bestInfoTd" title="${product.title}" style="text-overflow:ellipsis;overflow:hidden;white-space:nowrap;">
                <a href="${product.href}" target="_blank">
                    ${product.title}
                </a>
            </td>
            <td class="bestInfoTd">${product.price}</td>
            <td class="bestInfoTd" title="${product.channelName}" style="text-overflow:ellipsis;overflow:hidden;white-space:nowrap;">${product.channelName}</td>
            <td class="bestInfoTd">${category}</td>
            ${
                (product.smartstoreCheck)
                ?'<td class="reviewInfoTd" colspan="3"><input style="width:80%;padding:10px;" placeholder="상품리뷰 copy text를 붙여넣으세요"onchange="reviewParser(this)"></td><td class="reviewInfoTd" style="display:none;"></td><td class="reviewInfoTd" style="display:none;"></td>'
                :'<td class="reviewInfoTd" colspan="3">스마트스토어 상품이 아닙니다😥</td>'
            }
        </tr>
        `;
        

        await getProductReviewJson(product.href, i);
        

        console.table
        ({
            'no':i,
            '상품명':product.title,
            '채널이름':product.channelName,
            '카테고리':category,
            '상품가격':product.price,
            '스마트스토어상품 여부':product.smartstoreCheck
        });
    }

    //모든 처리가 끝나고 버튼 문자열 초기화, input 비우기, 필요없는 iframe 삭제
    bestButton.textContent = '탐색';
    bestUrl.value = '';
    while (reviewPageWrap.hasChildNodes()) 
    {
        reviewPageWrap.removeChild(reviewPageWrap.firstChild);
    }
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
    let href;
    let title;
    let price;
    let channelName;
    let smartstoreCheck = true;
    for(let i = 1; i <= 20; i++)
    {
        //상품페이지 링크
        href = document.querySelector(`#productListArea  li:nth-child(${i})`).getElementsByTagName('a')[0].href;
        //스마트스토어 상품인지 확인
        smartstoreCheck = (href.indexOf('adcrNoti.nhn') !== -1) ? false : true;  
        //타이틀 값을 추출 title 변수에 할당
        title = document.querySelector(`#productListArea  li:nth-child(${i})`).getElementsByTagName('a')[0].title;
        //가격 값을 추출, 숫자 사이의 ','를 제거하고 정수값으로 변환 후 price 변수에 할당
        price = +document.querySelector(`#productListArea  li:nth-child(${i})`)
                    .getElementsByClassName("price")[0].getElementsByClassName("num")[0].textContent.replaceAll(',', "");
        //채널이름을 받아온다.
        channelName = document.querySelector(`#productListArea  li:nth-child(${i})`)
                    .getElementsByClassName("info")[0].getElementsByTagName('span')[0].getElementsByTagName('a')[0].textContent;

        //products 배열에 객체 타입으로 값 저장
        products.push({href, smartstoreCheck, title, price, channelName});
    }    

    return {category, products};
}

/* 상품리뷰 json 파일 가져오기(cors, https 정책문제로 직접 dom을 다룰 수는 없으나 네트워크 통신기록을 가지고 리뷰크롤러로 조회) 🍔 */
async function getProductReviewJson(url,  i)
{
    return new Promise((resolve, reject)=>
    {
        const iframe = document.createElement('iframe');
        iframe.setAttribute('id',`productReviewIframe${i}`);
        iframe.src = url;
        reviewPageWrap.appendChild(iframe);

        const productReviewIframe = document.getElementById(`productReviewIframe${i}`);

        productReviewIframe.onload = () => 
        {
            console.log(`%c product rivew iframe 생성`, `color:green`);
            resolve('done!');
        }
    })
}

/* 상품리뷰 데이터를 파싱해서 각각의 돔에 넣어준다. 
해당 함수 마지막 부분에서 데이터베이스로 파일을 넣는 코드 작성가능 🎈 */
function reviewParser(dom)
{
    let productCode = +dom.value.split('*^*')[0];
    let totalReview = +dom.value.split('*^*')[1];
    let searchReview = +dom.value.split('*^*')[2];
    console.log(productCode);
    console.log(totalReview);
    console.log(searchReview);
    if(dom.value.indexOf('*^*') === -1)
    {
        alert('올바른 값을 기입해주세요 🙁');
        dom.value='';
        return false;
    }

    const productTitleTd = dom.parentElement.parentElement.getElementsByClassName('bestInfoTd')[0];
    const productPriceTd = dom.parentElement.parentElement.getElementsByClassName('bestInfoTd')[1];
    const productChannelTd = dom.parentElement.parentElement.getElementsByClassName('bestInfoTd')[2];
    const productCategoryTd = dom.parentElement.parentElement.getElementsByClassName('bestInfoTd')[3];

    const productCodeTd = dom.parentElement.parentElement.getElementsByClassName('reviewInfoTd')[0];
    const totalReviewTd = dom.parentElement.parentElement.getElementsByClassName('reviewInfoTd')[1];
    const searchReviewTd = dom.parentElement.parentElement.getElementsByClassName('reviewInfoTd')[2];

    productCodeTd.style.display="table-row";
    productCodeTd.colspan=1;
    productCodeTd.textContent=productCode;
    totalReviewTd.style.display="table-cell";
    totalReviewTd.textContent=totalReview;
    searchReviewTd.style.display="table-cell";
    searchReviewTd.textContent=searchReview;


    console.table
    ({
        '상품명':productTitleTd.textContent,
        '상품가격':productPriceTd.textContent,
        '채널이름':productChannelTd.textContent,
        '카테고리':productCategoryTd.textContent,
        '상품코드':productCodeTd.textContent,
        '전체리뷰수':totalReviewTd.textContent,
        '검색리뷰수':searchReviewTd.textContent
    });


    /* ---------input your database code------------- */
}