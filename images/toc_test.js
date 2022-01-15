$(document).ready(function () {
	var entryName = 'entry-content'; // 게시글 내용 출력 부분
	if (document.querySelector('.' + entryName) !== null) {
		tocInit();
	}
});

function tocInit() {
	// 사용자 커스텀
	var entryWrapName = 'entry-wrap'; // 게시글 내용 출력 감싸는 부분(toc넣을 곳)
	var navName = 'toc-list'; // 네비게이션 리스트 이름 지정
	var headerName = 'header'; // 상단 헤더 클래스 이름
	var gap = 40; // toc 상단 위치값

	var TOC_CONST = {
		navItem: [],
		offsetTops: [],
		mainWrap: document.querySelector('.' + entryWrapName),
		contentWrap: document.querySelector('.' + entryName),
		navWrap: document.querySelector('.' + navName),
		headings: [],
		newHeadings: [],
		navItemArr: [],
		headerHeight: headerName != '' ? document.querySelector('.' + headerName).offsetHeight : 0,
		scriptScroll: false,
	};
	var scriptScroll = false;

	function getHeadingData() {
		var contentWrap = TOC_CONST.contentWrap;
		var offsetTops = TOC_CONST.offsetTops;
		var newHeadings = TOC_CONST.newHeadings;

		var headings = contentWrap ? contentWrap.querySelectorAll('h1, h2, h3, h4') : [];
		TOC_CONST.headings = headings;

		Array.prototype.forEach.call(headings, function (item, index, headings) {
			item.id = 'toc-link-' + index;
			if (item.innerText.trim() == '') {
				return;
			}

			offsetTops.push(parseInt(item.offsetTop + TOC_CONST.mainWrap.offsetTop - TOC_CONST.headerHeight - gap));
			newHeadings.push({
				name: item.localName,
				index: parseInt(item.localName.substr(1)),
				text: item.innerText,
				id: item.id,
				top: item.offsetTop + TOC_CONST.headerHeight + TOC_CONST.mainWrap.offsetTop,
			});
		});
	}
	function renderToc() {
		// 리스트 html 만들고 렌더링
		var newHeadings = TOC_CONST.newHeadings;
		var mainWrap = TOC_CONST.mainWrap;
		var listHtml = '';
		newHeadings.forEach(function (item, idx, newHeadings) {
			var html = '';
			if (idx > 0) {
				var prevLevel = newHeadings[idx - 1].index;
			}
			var currentLevel = item.index;
			if (idx == 0 || prevLevel - currentLevel == -1) {
				html += '<ul class="lv-' + currentLevel + '">';
			} else if (prevLevel - currentLevel == -2) {
				html += '<ul><li>';
				html += '<ul class="lv-' + currentLevel + '">';
			} else if (prevLevel - currentLevel == -3) {
				html += '<ul><li><ul><li>';
				html += '<ul class="lv-' + currentLevel + '">';
			} else if (prevLevel - currentLevel == 1) {
				html += '</li></ul>';
			} else if (prevLevel - currentLevel == 2) {
				html += '</li></ul>';
				html += '</li></ul>';
			} else if (prevLevel - currentLevel == 3) {
				html += '</li></ul>';
				html += '</li></ul>';
				html += '</li></ul>';
			}
			html += '<li><a class="toc-item" href="#' + item.id + '" target-idx =' + idx + ' >' + item.text + '</a>';
			var arrayLen = newHeadings.length - 1;
			if (idx == arrayLen) {
				if (currentLevel == 1) {
					html += '</li></ul>';
				} else if (currentLevel == 2) {
					html += '</li></ul></li></ul>';
				} else if (currentLevel == 3) {
					html += '</li></ul></li></ul></li></ul>';
				} else if (currentLevel == 4) {
					html += '</li></ul></li></ul></li></ul>';
				}
			}
			listHtml += html;
		});
		var newNode = document.createElement('nav');
		newNode.classList.add(navName);
		newNode.innerHTML = listHtml;
		TOC_CONST.navWrap = newNode;
		mainWrap.insertBefore(newNode, null);
	}
	function changeCurrent(targetIndex) {
		var navItemArr = TOC_CONST.navItemArr;
		navItemArr.forEach(function (item, index) {
			if (index !== targetIndex) {
				item.classList.remove('on');
			} else {
				item.classList.add('on');
			}
		});
	}
	function onClickMove() {
		// 클릭 시 이동
		var navWrap = TOC_CONST.navWrap;
		var navItem = navWrap.querySelectorAll('a');
		var navItemArr = TOC_CONST.navItemArr;
		Array.prototype.forEach.call(navItem, function (item) {
			navItemArr.push(item);
		});

		navWrap.addEventListener('click', function (e) {
			var targetElem = e.target;
			var offsetTops = TOC_CONST.offsetTops;
			e.preventDefault();
			if (targetElem.tagName != 'A') {
				return;
			}
			var targetIdx = parseInt(targetElem.attributes['target-idx'].value);
			TOC_CONST.scriptScroll = true;
			changeCurrent(targetIdx);
			$('html, body').animate({ scrollTop: offsetTops[targetIdx] }, 300, function () {
				TOC_CONST.scriptScroll = false;
			});
		});
	}

	function onScrollMove(scriptScroll) {
		// 스크롤 이벤트
		var navItemArr = TOC_CONST.navItemArr;
		var tocOnScroll = function (e) {
			var scrollTop = e.target.scrollingElement.scrollTop;
			if (TOC_CONST.scriptScroll == true) {
				return;
			} else {
				var targetIndex = 0;
				var offsetTops = TOC_CONST.offsetTops;
				offsetTops.forEach(function (item, idx) {
					if (scrollTop >= item) {
						targetIndex = idx;
					}
				});
				changeCurrent(targetIndex);
			}
		};

		var timer;
		$(window).on('scroll', function (e) {
			if (!timer) {
				timer = setTimeout(function () {
					timer = null;
					tocOnScroll(e);
				}, 400);
			}
		});
	}

	function onResizeCheck() {
		// 리사이징 후 오프셋 값 가져오기
		var getOffset = function (e) {
			offsetTops = [];
			if (e.target.innerWidth < 767) {
				return;
			}
			Array.prototype.forEach.call(TOC_CONST.headings, function (item) {
				offsetTops.push(parseInt(item.offsetTop));
			});
			TOC_CONST.headerHeight = headerName != '' ? document.querySelector('.' + headerName).offsetHeight : 0;
		};
		var timer;
		$(window).on('resize', function (e) {
			clearTimeout(timer);
			timer = setTimeout(function () {
				getOffset(e);
			}, 200);
		});
	}

	function headerFix() {
		var scrollTop = 0;
		var tocNav = TOC_CONST.navWrap;
		var tocNavUl = TOC_CONST.navWrap.childNodes[0];
		var $contentWrap = $('.entry-content');
		var fixOffset = $contentWrap.offset().top - TOC_CONST.headerHeight - gap;
		var endOffset = $contentWrap.offset().top + $contentWrap.height() - tocNavUl.offsetHeight - TOC_CONST.headerHeight - gap - gap;

		$(window).on('scroll', function (e) {
			scrollTop = e.target.scrollingElement.scrollTop;
			if (scrollTop < fixOffset) {
				tocNavUl.style.position = 'absolute';
				tocNavUl.style.top = '0';
			} else if (scrollTop < endOffset) {
				tocNavUl.style.position = 'fixed';
				tocNavUl.style.top = TOC_CONST.headerHeight + gap + 'px';
				tocNavUl.style.bottom = 'auto';
			} else if (scrollTop > endOffset) {
				tocNavUl.style.position = 'absolute';
				tocNavUl.style.top = 'auto';
				tocNavUl.style.bottom = gap + 'px';
			}
		});
	}

	// 함수 실행
	getHeadingData();
	renderToc();
	onClickMove();
	onScrollMove();
	onResizeCheck();
	headerFix();
	changeCurrent(0);
}
