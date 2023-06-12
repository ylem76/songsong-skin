const tocInit = () => {
  const headingNodeList = document
    .querySelector(".entry-content")
    .querySelectorAll("h1,h2,h3,h4,h5,h6");
  const headingElements = Array.from(headingNodeList).filter(
    (heading) => heading.textContent.trim() !== ""
  );

  // article의 heading 요소 모아서 리스트 데이터 생성
  const getHeadingData = (headings) => {
    const stack = [{ text: "root", level: 0, items: [] }];

    [...headings].forEach((heading, idx) => {
      heading.setAttribute("id", `heading-${idx}`);

      const self = {
        text: heading.textContent.trim(),
        level: +heading.nodeName.replace("H", ""),
        id: `heading-${idx}`,
        items: [],
      };

      while (self.level <= stack[stack.length - 1].level) {
        stack.pop();
      }

      while (self.level - stack[stack.length - 1].level > 1) {
        const empty = {
          text: "",
          items: [],
          level: stack[stack.length - 1].level + 1,
        };
        stack[stack.length - 1].items.push(empty);
        stack.push(empty);
      }

      stack[stack.length - 1].items.push(self);
      stack.push(self);
    });
    return stack[0].items;
  };

  // 데이터 이용하여 마크업 생성
  const createMarkup = (items) => {
    const ol = document.createElement("ol");

    items.forEach((item) => {
      if (item.text !== "") {
        const li = document.createElement("li");
        const anchor = document.createElement("a");
        anchor.textContent = item.text;
        anchor.classList.add("toc-item");
        anchor.setAttribute("href", `#${item.id}`);

        li.appendChild(anchor);
        ol.classList.add(`lv-${item.level}`);
        ol.appendChild(li);
      }

      if (item.items.length > 0) {
        const li = document.createElement("li");
        const childOl = createMarkup(item.items);
        li.appendChild(childOl);
        ol.appendChild(li);
      }
    });

    return ol;
  };

  // 생성한 마크업 toc-list에 붙이기
  const headingData = getHeadingData(headingElements);
  const filteredHeadingData =
    headingData[0].text === "" ? headingData[0].items : headingData;

  const tocElement = createMarkup(filteredHeadingData);
  const navElement = document.createElement("nav");
  navElement.classList.add("toc-list");
  navElement.appendChild(tocElement);
  document.querySelector(".entry-wrap").appendChild(navElement);

  // offset 배열 생성
  const getHeadingOffset = (headingElements) => {
    const array = [];
    const margin = document.querySelector(".entry-wrap").offsetTop - 74;
    headingElements.forEach((heading) => {
      if (heading.textContent.trim() === "") {
        return;
      }

      array.push(heading.offsetTop + margin);
    });

    return array;
  };

  window.addEventListener("load", () => {
    const headingOffsets = getHeadingOffset(headingElements);
    // 클릭 시 해당 위치로 이동
    const onClickMove = () => {
      const navElem = document.querySelector(".toc-list");

      navElem.addEventListener("click", (e) => {
        e.preventDefault();

        const targetId = e.target.getAttribute("href");
        const targetIdx = parseInt(targetId.split("-")[1]);
        window.scrollTo({
          top: headingOffsets[targetIdx],
          behavior: "smooth",
        });
      });
    };
    onClickMove();

    // scroll 이벤트
    function onScrollMove() {
      function debounce(func, delay) {
        let timeoutId;

        return function () {
          const context = this;
          const args = arguments;

          clearTimeout(timeoutId);

          timeoutId = setTimeout(function () {
            func.apply(context, args);
          }, delay);
        };
      }

      function handleScroll() {
        const scrollOffset = window.pageYOffset;
        let currentIdx = 0;
        for (let i = 0; i < headingOffsets.length; i++) {
          if (headingOffsets[i] <= scrollOffset) {
            currentIdx = i;
          } else {
            break;
          }
        }

        const navElem = document.querySelector(".toc-list");
        const links = navElem.querySelectorAll(".toc-item");
        links.forEach((link, idx) => {
          if (currentIdx === idx) {
            link.classList.add("on");
          } else {
            link.classList.remove("on");
          }
        });
      }

      const debouncedScroll = debounce(handleScroll, 50);

      window.addEventListener("scroll", debouncedScroll);
    }

    onScrollMove();
  });
};

document.addEventListener("DOMContentLoaded", function () {
  if (document.querySelector(".entry-content") !== null) tocInit();
});
