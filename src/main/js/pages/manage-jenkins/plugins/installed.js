import pluginManager from "@/api/pluginManager";

pluginManager.init(() => {
  const permanentpiece = document.querySelector("#permanentpiece");


  setTimeout(() => {
    permanentpiece.innerHTML = "";
    console.log(pluginManager.recommendedPluginNames())
    pluginManager.recommendedPluginNames().slice(0, 3).forEach((plugin) => {
      permanentpiece.innerHTML +=
        `<a href="./available?filter=${plugin}" class="jenkins-button">
        <span>${plugin}</span>
        <span>Appearance</span>
      </a>`;
    });
  }, 500)
})
