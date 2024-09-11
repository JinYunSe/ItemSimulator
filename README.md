# ItemSimulator

질문과 답변

1. 암호화 방식

- 비밀번호를 DB에 저장할 때 Hash를 이용했는데, Hash는 단방향 암호화와 양방향 암호화 중 어떤 암호화 방식에 해당할까요?

비밀번호를 암호화 시키기 위해 사용한 bcrypt.hash는 단방향 암호화 방식입니다.

- 비밀번호를 그냥 저장하지 않고 Hash 한 값을 저장 했을 때의 좋은 점은 무엇인가요?

단뱡향 암호화를 사용할 경우 암호화할 키를 바탕으로 암호화를 진행해 원본 데이터를 복원할 수 없어 악의적인 Client로부터 DB의 정보가 유출되더라도 비밀번호가 노출되지 않는 장점이 있습니다. 하지만, 암호화에 사용한 키가 노출되면 비밀번호도 노출되게 됩니다.

2. 인증 방식

- JWT(Json Web Token)을 이용해 인증 기능을 했는데, 만약 Access Token이 노출되었을 경우 발생할 수 있는 문제점은 무엇일까요?

1. 인증 정보 탈취 : 이 토큰이 탈취되면, 공격자는 해당 토큰을 사용해 사용자의 신분을 가장하여 서버에 접근할 수 있습니다. 이를 통해 사용자로서 허용된 모든 권한을 사용할 수 있게 돼 민감한 정보에 접근할 수 있게 됩니다.

2. 불법적인 API 접근 : 노출된 토큰을 이용해 공격자는 보호된 API에 접근할 수 있게 됩니다. 이를 통해 불법적으로 데이터를 읽거나 수정할 수 있으며, 민감한 정보에 접근할 수 있게 됩니다.

3. 권한 오남용 : 공격자가 토큰을 통해 특정 역할이나 권한을 얻었다면, 그 권한을 남용해서 사용할 우 있습니다. ex) 데이터에 접근, 시스템 무력화

- 해당 문제점을 보완하기 위한 방법으로는 어떤 것이 있을까요?

1. HTTPS 사용하기 : Access Token을 암호화하지 않는 HTTP 대신 HTTS를 사용합니다.

2. 토큰 만료 시간 설정하기 : 토큰의 유효 기간을 짧게 설정합니다.

3. Refresh Token과 함께 사용 : Refresh Token을 사용해 주기적으로 새로운 AccessToken을 발급하여 피해를 줄입니다.

4. IP 및 User-Agnet 검증 : 토큰을 발급할 때 IP 주소나 User-Agent 정보를 검증하여 공격자의 접근을 방지합니다.

3) 인증과 인가

- 인증과 인가가 무엇인지 각각 설명해 주세요.

인증(Authentication) : 인증은 사용자가 누구인지 확인하는 과정으로 로그인을 통해
JWT 토큰, OAuth 등을 사용하여 시스템이 사용자 신원을 확인하는 것을 말합니다.

인가(Authorization) : 인가는 특정 사용자에게 허용된 권한을 확인하는 과정입니다.
인증된 사용자가 특정 작업을 수행할 수 있는 권한이 결정되는 절차입니다.

- 위 API 구현 명세에서 인증을 필요로 하는 API와 그렇지 않은 API의 차이가 뭐라고 생각하시나요?

개인정보 또는 개인의 소유물일 경우 인증 과정을 거쳐 해당 사용자인지 확인을 합니다.

- 아이템 생성, 수정 API는 인증을 필요로 하지 않는다고 했지만 사실은 어느 API보다도 인증이 필요한 API입니다. 왜 그럴까요?

악의적인 Clinet가 아이템을 악의적으로 생성해 게임 벨런스를 무너뜨릴 수 있고,
아이템을 판매해 게임, 현실 경제에 악영향을 끼칠 수 있습니다.

4. Http Status Code

- 과제를 진행하면서 사용한 Http Status Code를 모두 나열하고, 각각이 의미하는 것과 어떤 상황에 사용했는지 작성해 주세요.

200 : Clinet의 요청이 성공적으로 처리됨
201 : 요청이 성공적으로 처리 됐으며 새로운 자원이 생성됨

400 : 서버가 잘못된 요청을 이해할 수 없음
403 : 요청이 허용되지 않았음
404 : 요청한 리소스를 찾을 수 없음
409 : Clinet의 요청이 서버의 현재 상태와 충돌했음
ex) 데이터베이스에 새로운 데이터를 추가하려고 할 때,
해당 데이터가 이미 존재하거나 다른 클라이언트가 동시에 리소스를 수정한 경우

예외적으로 : Client의 잘못된 입력으로 인해,
500도 출력 되는걸 봤습니다. 지금 나오면 큰일나는 코드...

5. 게임 경제

- 현재는 간편한 구현을 위해 캐릭터 테이블에 money라는 게임 머니 컬럼만 추가하였습니다.
  이렇게 되었을 때 어떠한 단점이 있을 수 있을까요?

money로만 물건을 사고 팔 수 있기 때문에 money의 가치가 너무 높아지거나 너무 낮아질 경우 게임 내 경제가 망가질 수 있습니다.

- 이렇게 하지 않고 다르게 구현할 수 있는 방법은 어떤 것이 있을까요?

특정 퀘스트를 만족하면 제공하는 마일리지를 바탕으로, 특정 물건을 살 수 있게 만듭니다.

- 아이템 구입 시에 가격을 클라이언트에서 입력하게 하면 어떠한 문제점이 있을 수 있을까요?

어떤 품목의 물품은 너무 높은 가격으로 평균 가격이 측정될 수 있고.
어떤 품목은 너무 낮은 가격으로 평균 가격이 측정될 수 있어
시장 안정화가 어렵습니다.

어려웠던 점 :

긴 강의 내용과 처음 사용해보는 패키지와 DB 베이스 모델로 인해 학습시간이 너무 오래 소요됐고, 그에 따라 새벽 늦게까지 학습을 이어가야 했습니다. 그러한 누적 피로와 스트레스 때문에 위장 장애가 발생해 수시로 가슴과 배 사이에 통증이 발생해서 원활한 작업이 이뤄지지 않았습니다...

강의 내용을 바탕으로 과제를 수행하면서 필수 과제는 강의 내용을 정리한 것을 바탕으로 개발을 진행할 수 있었습니다.

필수 개발 과제인 회원가입, 로그인, 캐릭터 생성, 조회, 삭제는 간단했지만,
아이템 생성과 수정에서 Item_Stat 내부 health,
power의 유효성과 DB 저장 로직 구현이 까다로웠고,
다시 입력된 상태로 결과가 출력되기 때문에 입력 원본 상태로 만드는 과정이 복잡했습니다.

마지막으로 Cookie를 바탕으로 JWT Token을 Client에게 전달해줬는데 Header의 authorization으로 전달하는 과정에서 방법을 몰라 방황을 조금 했습니다.
문승현 튜터님과 김진엽님에게 Insomnia와 VSCode 상에서 적용 방법을 알게 됐고
코드 수정을 거쳐 Cookie가 아닌 Header의 authorization으로 Token 발행이 가능했습니다.

트러블 슈팅 :

1.

아이템 수정 진행 중 아이템 변경을 위해 새로운 이름을 제공해줘도 다른 Colum은 바꿔도 이름이 변경되지 않는 문제가 발생했었습니다.

(수정하기에 급급해 잘 기억은 나지 않지만...)
이유로는 const { itemName, itemState = {} } = req.body로
객체 구조 분해 할당으로 아이템 이름을 받아왔는데,

joi함수명.validateAsync({})의 input 값으로 itemName.itemName 줘
undefined가 발생했던 것이 원인이었던 것 같습니다.

처음에는 joi 함수가 동작해 유효성에서 걸러질거라 생각했지만,
itemName을 제공하지 않고, undefined를 제공해 유효성 검사를 벗어난 것 같았습니다.

2.

아이템 생성을 모두 구현 후, 아이템 수정을 구현하는 과정에서
ItemCode가 req.params로 제공된다는 점과 수정될 수 있는 항목이
이름, 체력, 공격력만 된다는 사실로 인해 모든 Colum을 위한 값들이
들어와야 동작하는 유효성 검사 함수를 {ItemCode},{이름, 체력, 공격력 증가}, {가격}
으로 분할하게 됐고 그에 따른 아이템 생성 코드 수정이 힘들었습니다.
이때, 아이템 생성 수정 로직 구현 중 아이템 수정 로직에서
이름, 체력, 공격력 증가가 입력되지 않을 경우 이름은 그대로,
체력은 0, 공격력 증가는 0으로 만들어야 한다는 사실로 인해 더 어려움을 겪게 됐습니다.

3.

4.

마지막으로 아이템 생성, 아이템 수정에 따른 결과를 DB에서 꺼내
입력과 동일한 형식으로 만들어 리턴하는 과정이 복잡했습니다.
특히 아이템 수정에서 체력과 공격력 증가가 입력되지 않았을 때
결과로 출력하지 않는 것을 어떻게 반영해줄지가 굉장히 막막했었습니다.

해결 방법으로는 아이템 생성에서는

itemList = itemList.map(item => ({
item_id: item.itemId,
item_code: item.itemCode,
item_name: item.itemName,
item_stat: {
health: item.addHealth,
power: item.addPower,
},
item_price: item.price,
}));

map 함수를 사용해 입력 형식과 동일하게 만들어줬고,

아이템 수정에서는

const response = {
item_code: updateItem.itemCode,
item_name: updateItem.itemName || isExist.itemName,
item_stat: {},
};
if (item_stat.health !== undefined)
response.item_stat.health = updateItem.addHealth;
if (item_stat.power !== undefined)
response.item_stat.power = updateItem.addPower;

위와 같은 코드 형식으로 이름, 체력, 공격력의 입력 유무를 바탕으로
update된 Item에서 값을 가져오는 식으로 구현해냈다.
