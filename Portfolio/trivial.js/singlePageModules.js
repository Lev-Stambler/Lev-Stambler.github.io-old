import { module } from "./framework.js";

window.HTMLFound = {};
window.HTMLLoading = {};
window.storedHTML = {};

class singlePageLink extends module {
  constructor(fadeTime, callback) {
    const innerScript = `<a><(innerHTML)></a><script>
                                if (!HTMLLoading['<{src}>'] || HTMLLoading['<{src}>'] === undefined) {
                                HTMLLoading['<{src}>'] = true;
                                $.get(\`<{src}>\`, (res) => {
                                    storedHTML["<{src}>"] =  res;    
                                    HTMLFound["<{src}>"] = true;
                                });
                            }                        
                        </script>`;
    super("a-sp", innerScript, { fadeTime });
    const superScope = this;
    super.init(() => {
      function checkForSourceFound() {
        setTimeout(() => {
          let htmlLoaded = true;
          // for (var j = 0; j < HTMLFound.length; j++) {
          if (eval('HTMLFound["<{src}>"]') === false) {
            (htmlLoaded = false), checkForSourceFound();
          }
          // }
          if (htmlLoaded === true) {
            superScope.addEvent("click", e => {
              e.preventDefault();
              $("#<{containerid}>").fadeOut(0, () => {
                const setContainerHTMLScript = `document.getElementById('<{containerid}>').innerHTML = storedHTML["<{src}>"]`;
                eval(setContainerHTMLScript);
                $(document).trigger("domChanged");
                const scriptTags = eval(
                  `document.getElementById('<{containerid}>')`
                ).getElementsByTagName("script");
                for (var i = 0; i < scriptTags.length; i++)
                  eval(scriptTags[i].innerHTML);

                $("#<{containerid}>").fadeIn(
                  parseInt("<(fadeTime)>"),
                  () => {}
                );
              });
            });
          }
          if(typeof callback === "function") callback()
        }, 20);
      }
      setTimeout(() => {
        eval();
        checkForSourceFound();
      }, 20);
    });
  }
}

class defaultHTML extends module {
  constructor() {
    super(
      "default-html",
      `<script>
            $.get(\`<{src}>\`, (res) => {
                try{document.getElementsByTagName('default-html')[<(count)>].innerHTML = res;}catch{}
            });
            </script>`,
      {}
    );
    super.init();
  }
}

const defaultHTMLMod = new defaultHTML();

export { singlePageLink };
