$(document).ready(function () {
	// 게시글 페이지에서 동작
	if ($("#tt-body-page").length == 1) {
		kakaoShareFix();
	}
});

function kakaoShareFix() {
	// 포스트 하단 공유 기능 fix
	// 기존 카카오 클린업
	Kakao.Link.cleanup();
	Kakao.cleanup();

	// 새로운 키를 이용하여 init
	Kakao.init("97f86710c1661d48252b0b2cffc5d05b");

	// 버튼 요소 생성 및 변경
	var kakaoBtnNew = document.createElement("button");
	var kakaoIco = document.createElement("span");
	var kakaoBtnTxt = document.createTextNode("카카오톡으로 공유");
	kakaoIco.classList.add("ico_sns");
	kakaoIco.classList.add("ico_kt");
	kakaoBtnNew.appendChild(kakaoIco);
	kakaoBtnNew.appendChild(kakaoBtnTxt);
	kakaoBtnNew.classList.add("btn_mark");

	var kakaoBtnOld = document.querySelector('a[data-service="kakaotalk"]');
	var kakaoBtnWrap = document.querySelector(".bundle_post");

	// 공유 정보 가져오기
	var shareContent = {
		title: document.querySelector('[property="og:title"]').attributes.content
			.value,
		desc: document.querySelector('[property="og:description"]').attributes
			.content.value,
		image: document.querySelector('[property="og:image"]').attributes.content
			.value,
		url: document.querySelector('[property="og:url"]').attributes.content.value,
	};

	// 카카오 공유
	var kakaoShareFunc = function (shareContent) {
		Kakao.Link.sendDefault({
			objectType: "feed",
			content: {
				title: shareContent.title,
				description: shareContent.desc,
				imageUrl: shareContent.image,
				imageWidth: 1200,
				imageHeight: 630,
				link: {
					webUrl: shareContent.url,
				},
			},
			buttons: [
				{
					title: "자세히 보기",
					link: {
						webUrl: "https://songsong.dev",
					},
				},
			],
		});
	};

	// 공유 함수 연결
	kakaoBtnNew.addEventListener("click", function () {
		kakaoShareFunc(shareContent);
	});

	// 기존 버튼과 새로 만든 버튼 바꿔치기
	kakaoBtnWrap.replaceChild(kakaoBtnNew, kakaoBtnOld);
}
