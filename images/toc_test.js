$(document).ready(function () {
  // 클래스 이름 입력
  var inputVal = {
    entryName: "entry-content", // 게시글 내용 출력 부분
    entryWrapName: "entry-wrap", // 게시글 내용 출력 감싸는 부분(toc넣을 곳)
    navName: "toc-list", // 네비게이션 리스트 이름 지정
    headerName: "header", // 상단 헤더 클래스 이름
    gap: 40, // toc 상단 위치값
  };

  function checkArticleStructure() {
    if (
      document.querySelector("." + inputVal.entryWrapName) === null ||
      document.querySelector("." + inputVal.entryName) === null ||
      document.querySelector("." + inputVal.navName) === null
    ) {
      return false;
    }
  }

  if (checkArticleStructure() !== false) {
    tocInit(inputVal);
  } else {
    console.log("no structure");
  }
});

function tocInit(inputVal) {
  var tocVars = {
    navItem: [],
    offsetTops: [],
    mainWrap: document.querySelector("." + inputVal.entryWrapName),
    contentWrap: document.querySelector("." + inputVal.entryName),
    navWrap: document.querySelector("." + inputVal.navName),
    headings: [],
    newHeadings: [],
    navItemArr: [],
    headerHeight:
      inputVal.headerName != "" &&
      document.querySelector("." + inputVal.headerName)
        ? document.querySelector("." + inputVal.headerName).offsetHeight
        : 0,
    scriptScroll: false,
    gap: inputVal.gap,
  };
  var scriptScroll = false;

  function getHeadingData() {
    var contentWrap = tocVars.contentWrap;

    var offsetTops = tocVars.offsetTops;
    var newHeadings = tocVars.newHeadings;

    var headings = contentWrap
      ? contentWrap.querySelectorAll("h1, h2, h3, h4")
      : [];
    tocVars.headings = headings;

    Array.prototype.forEach.call(headings, function (item, index, headings) {
      item.id = "toc-link-" + index;
      if (item.innerText.trim() == "") {
        return;
      }

      offsetTops.push(
        parseInt(
          item.offsetTop +
            tocVars.mainWrap.offsetTop -
            tocVars.headerHeight -
            tocVars.gap
        )
      );
      newHeadings.push({
        name: item.localName,
        index: parseInt(item.localName.substr(1)),
        text: item.innerText,
        id: item.id,
        top: item.offsetTop + tocVars.headerHeight + tocVars.mainWrap.offsetTop,
      });
    });
  }

  function renderToc() {
    // 리스트 html 만들고 렌더링
    function makeHtmlFrag(newHeadings) {
      var html = "";
      newHeadings.forEach(function (item, idx, newHeadings) {
        var prevLevel = idx > 0 ? newHeadings[idx - 1].index : 0;
        var currentLevel = item.index;
        var levelGap = prevLevel - currentLevel;

        // start idx
        if (idx === 0) {
          for (var i = 1; i < currentLevel; i++) {
            html += '<ul class="lv-' + i + '"><li>';
          }
          html += '<ul class="lv-' + currentLevel + '">';
        }

        // middle idx
        if (idx > 0 && levelGap < 0) {
          for (var i = 1; i < Math.abs(levelGap); i++) {
            html += "<ul><li>";
          }
          html += '<ul class="lv-' + currentLevel + '">';
        }
        if (idx > 0 && levelGap > 0) {
          for (var i = 0; i < levelGap; i++) {
            html += "</li></ul>";
          }
        }
        html +=
          '<li><a class="toc-item" href="#' +
          item.id +
          '" target-idx =' +
          idx +
          " >" +
          item.text +
          "</a>";
        var arrayLen = newHeadings.length - 1;

        // end idx
        if (idx === arrayLen) {
          for (var i = 0; i < currentLevel; i++) {
            html += "</li></ul>";
          }
        }
      });
      return html;
    }

    tocVars.navWrap.classList.add(inputVal.navName);
    tocVars.navWrap.innerHTML = makeHtmlFrag(tocVars.newHeadings);
    tocVars.mainWrap.insertBefore(tocVars.navWrap, null);
  }

  function changeCurrent(targetIndex) {
    var navItemArr = tocVars.navItemArr;
    navItemArr.forEach(function (item, index) {
      if (index !== targetIndex) {
        item.classList.remove("on");
      } else {
        item.classList.add("on");
      }
    });
  }

  function onClickMove() {
    function onClickHandle(e) {
      e.preventDefault();

      var targetElem = e.target;
      if (targetElem.tagName != "A") {
        return;
      }
      var targetIdx = parseInt(targetElem.attributes["target-idx"].value);
      tocVars.scriptScroll = true;
      changeCurrent(targetIdx);
      console.log(tocVars.offsetTops[targetIdx]);
      $("html, body").animate(
        {
          scrollTop: tocVars.offsetTops[targetIdx],
        },
        300,
        function () {
          tocVars.scriptScroll = false;
        }
      );
    }
    // 클릭 시 이동
    var navItem = tocVars.navWrap.querySelectorAll("a");
    var navItemArr = tocVars.navItemArr;
    Array.prototype.forEach.call(navItem, function (item) {
      navItemArr.push(item);
    });

    tocVars.navWrap.addEventListener("click", function (e) {
      onClickHandle(e);
    });
  }

  function onScrollMove(scriptScroll) {
    // 스크롤 이벤트
    var navItemArr = tocVars.navItemArr;
    var tocOnScroll = function (e) {
      var scrollTop = e.target.scrollingElement.scrollTop;
      if (tocVars.scriptScroll == true) {
        return;
      } else {
        var targetIndex = 0;
        var offsetTops = tocVars.offsetTops;
        offsetTops.forEach(function (item, idx) {
          if (scrollTop >= item) {
            targetIndex = idx;
          }
        });
        changeCurrent(targetIndex);
      }
    };

    var timer;
    $(window).on("scroll", function (e) {
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
      Array.prototype.forEach.call(tocVars.headings, function (item) {
        offsetTops.push(parseInt(item.offsetTop));
      });
      tocVars.headerHeight =
        headerName != ""
          ? document.querySelector("." + headerName).offsetHeight
          : 0;
    };
    var timer;
    $(window).on("resize", function (e) {
      clearTimeout(timer);
      timer = setTimeout(function () {
        getOffset(e);
      }, 200);
    });
  }

  function headerFix() {
    var scrollTop = 0;
    var tocNav = tocVars.navWrap;
    var tocNavUl = tocVars.navWrap.childNodes[0];
    var $contentWrap = $(".entry-content");
    var fixOffset =
      $contentWrap.offset().top - tocVars.headerHeight - tocVars.gap;
    var endOffset =
      $contentWrap.offset().top + $contentWrap.height() - tocNavUl
        ? tocNavUl.offsetHeight
        : 0 - tocVars.headerHeight - tocVars.gap - tocVars.gap;

    console.log($contentWrap.offset().top, tocVars.headerHeight, tocVars.gap);
    console.log(fixOffset);
    $(window).on("scroll", function (e) {
      scrollTop = e.target.scrollingElement.scrollTop;
      if (scrollTop < fixOffset) {
        tocNavUl.style.position = "absolute";
        tocNavUl.style.top = "0";
      } else if (scrollTop < endOffset) {
        tocNavUl.style.position = "fixed";
        tocNavUl.style.top = tocVars.headerHeight + gap + "px";
        tocNavUl.style.bottom = "auto";
      } else if (scrollTop > endOffset) {
        tocNavUl.style.position = "absolute";
        tocNavUl.style.top = "auto";
        tocNavUl.style.bottom = gap + "px";
      }
    });
  }

  // 함수 실행

  $(window).on("load", function () {
    getHeadingData();
    renderToc();
    onClickMove();
    onScrollMove();
    onResizeCheck();
    headerFix();
    changeCurrent(0);
  });
}
