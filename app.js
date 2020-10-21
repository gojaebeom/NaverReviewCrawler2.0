/* DOM 그리기 🎨 */
document.body.style.display = "flex";
document.body.style.justifyContent = "center";
document.body.style.alignItems = "center";
document.body.style.height = "100vh";
document.body.style.background = "linear-gradient(#e66465, #9198e5)";
document.body.innerHTML = `
<form id="form" style="width:600px;padding:12px;border-radius:5px;background:#FFFFFF;">
    <h1 style="color:'#2E2E2E';margin:10px 0px 20px 0px;">네이버 리뷰 크롤러 2.0 🍰</h1>
    <label for="url">URL을 입력하세요</label><br>
    <input id="url" style="width:95%;padding:12px 8px;border: 1px solid #BDBDBD;border-radius:3px;"><br><br>
    <label for="date">제한날짜를 입력하세요</label><br>
    <input id="date" type="date" style="width:30%;padding:12px 8px;border: 1px solid #BDBDBD;border-radius:3px;">
    <button type="button" id="button" style="padding:14px 15px;border-radius:3px;background:#5F04B4;color:white;font-weight:bold;">탐색하기</button>
    <br>
    <br>
    <label for="date">탐색한 데이터를 확인하세요</label><br>
    <table style="border-collapse:collapse;border: 1px solid #BDBDBD;width:100%;">
        <tr>
            <th style="border: 1px solid #BDBDBD;padding:8px;">총 페이지</th>
            <th style="border: 1px solid #BDBDBD;padding:8px;">종료 페이지</th>
            <th style="border: 1px solid #BDBDBD;padding:8px;">리뷰 수(클릭시 복사가능)</th>
        </tr>
        <tr style="font-size:18px;">
            <td id="totalPages" style="border: 1px solid #BDBDBD;text-align:center;padding:8px;">🍕</td>
            <td id="stopPage" style="border: 1px solid #BDBDBD;text-align:center;padding:8px;">🍔</td>
            <td id="reviewTotal" class="copy" style="border: 1px solid #BDBDBD;text-align:center;padding:8px; cursor:pointer;">🍟</td>
        </tr>
    </table>
</form>
`;


/* 생성된 DOM을 참조 ✨  */
const form = document.getElementById("form");
const urlInput = document.getElementById("url");
const dateInput = document.getElementById("date");
const button = document.getElementById("button");

const totalPagesTd = document.getElementById("totalPages");
const stopPageTd = document.getElementById("stopPage");
const reviewTotalTd = document.getElementById("reviewTotal");


/* 리뷰 크롤링 함수 🚀  */
async function getNaverStoreReview(url, date, func){

    const checkDate = new Date(date); //date 파라미터를 Date 타입으로 형변환
    
    let totalPages; //총 페이지 수를 할당
    let splitUrl = url.split('page=1');//page=1 문자열을 기준으로 앞뒤 값을 배열로 저장함
    let count = 0; //리뷰의 개수를 할당
    let stopPageNumber; //종료한 페이지 번호
    
    //댓글의 전체 페이지 수를 받아온다.
    try{
        totalPages = await fetch(url)
                        .then(response => response.json())
                            .then(json => json.totalPages);
    }catch(e){
        console.log('%c 💡 페이지 수를 가져오지 못했습니다. URL을 채크해주세요.','background:#FA5858;color:white;padding:5px 10px;');
        alert("💡 페이지 수를 가져오지 못했습니다. URL을 채크해주세요.");
        urlInput.value = '';
        button.textContent = "탐색하기";
        return false;
    }
    
    let json;
    let crowlingStop = false;
    
    for(let page = 1; page < totalPages; page++){
        
        //각 페이지마다의 컨텐츠를 가져온다.
        try{
            json = await fetch(splitUrl[0]+`page=${page}`+splitUrl[1])
                                .then(response => response.json())
                                    .then(json => json);
        }catch(e){
            console.log('%c 💡 컨텐츠를 가져오지 못했습니다.','background:#FA5858;color:white;padding:5px 10px;');
            alert("💡 컨텐츠를 가져오지 못했습니다.");
            urlInput.value = '';
            button.textContent = "탐색하기";
            return false;
        }

        json.contents.forEach(content=>{
            let searchDate = new Date(content.createDate);//날짜 추출
            
            //오늘 날짜부터 지정한 날짜까지의 댓글들을 탐색하면서 카운터 증가 / 지정한 날짜를 넘으면 페이지를 돌리는 for문을 멈춰 크롤링을 중단한다.
            if(searchDate >= checkDate){
                // console.log(searchDate); /*💡 무슨 날짜들을 받아왔는지 확인하려면 console.log의 주석을 풀어주세요.💡*/
                count++;
            }else{
                crowlingStop = true;
            }
        })

        //크롤링의 종료
        if(crowlingStop){
            stopPageNumber = page;
            break;
        }
    }

    //모든 작업이 끝나면 콜백함수에게 필요 데이터를 전달한다. 데이터를 나타내는 방식은 콜백함수에서 진행
    func(totalPages, stopPageNumber, count);
}

/* 탐색 버튼 클릭 이벤트 👆 */
button.onclick = ()=> {

    //console.log('데이터 탐색!');

    //URL과 DATE input의 값이 없으면 경고
    if(!urlInput.value || !dateInput.value){
        alert("URL과 제한 날짜는 필수값입니다 😐");
        return false;
    }

    button.textContent = "데이터를 불러오는 중입니다..";

    //크롤링 함수 실행
    getNaverStoreReview(
        urlInput.value,
        dateInput.value,
        (totalPages, stopPageNumber, count)=>{
            urlInput.value = '';
            button.textContent = "탐색하기";

            totalPagesTd.textContent = totalPages;
            stopPageTd.textContent = stopPageNumber;
            reviewTotalTd.textContent = count;

            console.log('%c 검색 결과 🍰','background:linear-gradient(#00BFFF, #01DFA5);color:white;padding:5px 10px;');
            console.table({"전체페이지":totalPages,"종료페이지":stopPageNumber,"리뷰 수":count});
    });
}

/* 클립보드 복사 이벤트 🔗 */
document.querySelector(".copy").addEventListener("click", function(){
    let tempElem = document.createElement('textarea');
    tempElem.value = reviewTotalTd.textContent;  
    document.body.appendChild(tempElem);

    tempElem.select();
    document.execCommand("copy");
    document.body.removeChild(tempElem);
});


