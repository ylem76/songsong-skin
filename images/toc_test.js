// toc
class TableOfContents {
  constructor() {
    this.headingElements = Array.from(
      document.querySelectorAll(
        ".entry-content h1, .entry-content h2, .entry-content h3, .entry-content h4, .entry-content h5, .entry-content h6"
      )
    ).filter((heading) => heading.textContent.trim() !== "");
    this.headingOffsets = [];
    this.currentIdx = 0;
    this.debouncedScroll;

    this.initialize();
  }

  initialize() {
    this.createTocMarkup();
    this.setHeadingOffsets();
    this.bindClickEvent();
    this.bindScrollEvent();
    this.bindResizeEvent();
  }

  // 생성한 리스트 화면에 붙이기
  createTocMarkup() {
    const headingData = this.getHeadingData(this.headingElements);
    const filteredHeadingData =
      headingData[0].text === "" ? headingData[0].items : headingData;

    const tocElement = this.createMarkup(filteredHeadingData);
    const navElement = document.createElement("nav");
    navElement.classList.add("toc-list");
    navElement.appendChild(tocElement);
    document.querySelector(".entry-wrap").appendChild(navElement);
  }

  // 출처 : https://stackoverflow.com/questions/71724698/heading-items-to-tree-structure-with-missing-items
  // 스택 활용하여 헤딩 구조 생성
  getHeadingData(headings) {
    const stack = [{ text: "root", level: 0, items: [] }];

    headings.forEach((heading, idx) => {
      heading.setAttribute("id", `heading-${idx}`);

      const self = {
        text: heading.textContent.trim(),
        level: +heading.tagName.charAt(1),
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
  }

  // toc 리스트 마크업 생성
  createMarkup(items) {
    const ol = document.createElement("ol");

    items.forEach((item) => {
      if (item.text !== "") {
        const li = document.createElement("li");
        const anchor = document.createElement("a");
        anchor.textContent = item.text;
        anchor.classList.add("toc-item");
        anchor.href = `#${item.id}`;

        li.appendChild(anchor);
        li.classList.add(`lv-${item.level}`);
        ol.appendChild(li);
      }

      if (item.items.length > 0) {
        const li = document.createElement("li");
        const childOl = this.createMarkup(item.items);
        li.appendChild(childOl);
        ol.appendChild(li);
      }
    });

    return ol;
  }

  // 개별 헤딩 위치값 가져오기
  setHeadingOffsets() {
    const margin = document.querySelector(".entry-wrap").offsetTop - 74;
    this.headingOffsets = this.headingElements.map(
      (heading) => heading.offsetTop + margin
    );
  }

  // 클릭 이벤트 바인딩 : 클릭한 위치로 이동
  bindClickEvent() {
    const navElem = document.querySelector(".toc-list");
    navElem.addEventListener("click", (e) => {
      e.preventDefault();
      const targetId = e.target.getAttribute("href");
      const targetIdx = parseInt(targetId.split("-")[1]);
      window.scrollTo({
        top: this.headingOffsets[targetIdx],
        behavior: "smooth",
      });
    });
  }

  // 스크롤 이벤트 바인딩 : 스크롤 위치에 따라 해당 섹션 on
  bindScrollEvent() {
    const handleScroll = () => {
      const scrollOffset = window.pageYOffset;
      this.currentIdx = this.headingOffsets.findIndex(
        (offset) => offset >= scrollOffset
      );
      if (this.currentIdx === -1) {
        this.currentIdx = this.headingOffsets.length - 1;
      }
      this.updateActiveLink();
    };

    this.debouncedScroll = this.debounce(handleScroll, 50);

    if (window.innerWidth >= 767) {
      window.addEventListener("scroll", this.debouncedScroll);
    }
  }

  // 리사이즈 이벤트 바인딩 : 화면 사이즈에 따라 스크롤 이벤트 on/off
  bindResizeEvent() {
    window.addEventListener("resize", () => {
      clearTimeout(this.resizeTimeout);
      this.resizeTimeout = setTimeout(() => {
        if (window.innerWidth < 767) {
          window.removeEventListener("scroll", this.debouncedScroll);
        } else {
          window.addEventListener("scroll", this.debouncedScroll);
        }
      }, 200);
    });
  }

  // this.currentIdx에 따라 현재 섹션 on 처리
  updateActiveLink() {
    const navElem = document.querySelector(".toc-list");
    const links = navElem.querySelectorAll(".toc-item");
    links.forEach((link, idx) => {
      link.classList.toggle("on", this.currentIdx === idx);
    });
  }

  debounce(func, delay) {
    let timeoutId;
    return function (...args) {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        func.apply(this, args);
      }, delay);
    };
  }
}

window.addEventListener("load", () => {
  if (document.querySelector(".entry-content")) {
    new TableOfContents();
  }
});
