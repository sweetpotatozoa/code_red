import React from 'react'
import styles from './Danger.module.css'

const Danger = () => {
  return (
    <div className={styles.calculatorContainer}>
      <div
        dangerouslySetInnerHTML={{
          __html: `
        <div id="salesmap-web-form" data-web-form="https://salesmap.kr/web-form/a64935d8-524d-4f2b-b2ff-57f83b5a14eb">
          <script>
            !(function (window, document) {
              var currentScript = document.currentScript;
              var scriptElement = document.createElement('script');
              scriptElement.onload = function () {
                window.SmFormSettings.loadForm();
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
    </div>
  )
}

export default Danger
