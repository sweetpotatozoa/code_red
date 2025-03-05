import React from 'react'

const Danger = () => {
  return (
    <div
      dangerouslySetInnerHTML={{
        __html: `
        <!-- 디버깅용 텍스트 -->
        <p>SalesMap 폼 로드 중...</p>
        
        <div id="salesmap-web-form" data-web-form="https://salesmap.kr/web-form/a64935d8-524d-4f2b-b2ff-57f83b5a14eb">
          <script>
            !(function (window, document) {
              var currentScript = document.currentScript;
              var scriptElement = document.createElement('script');
              scriptElement.onload = function () {
                window.SmFormSettings.loadForm();
                console.log("SalesMap 스크립트가 로드되었습니다"); // 디버깅용
              };
              scriptElement.id = 'loadFormScript';
              scriptElement.src = 'https://salesmap.kr/web-form-loader-v3.js';
              currentScript.parentNode.insertBefore(scriptElement, currentScript);
            })(window, document);
          </script>
        </div>
        `,
      }}
    />
  )
}

export default Danger
