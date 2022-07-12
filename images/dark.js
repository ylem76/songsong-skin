function darkMode() {
  console.log("theme");
  // 테마 가져오기
  var storedTheme = localStorage.getItem("theme");
  var prefersDarkMode = window.matchMedia(
    "(prefers-color-scheme: dark)"
  ).matches;
  var themeType = storedTheme;

  // 저장된 테마가 없으면 선호 모드에 따라 로컬 스토리지 셋팅
  if (!storedTheme) {
    if (prefersDarkMode == false) {
      themeType = "light";
    } else {
      themeType = "dark";
    }
    localStorage.setItem("theme", themeType);
  }

  // 데이터에 따라 html attribute 지정
  document.documentElement.setAttribute("theme-color", themeType);
}

darkMode();
