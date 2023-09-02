import pluginManager from "@/api/pluginManager";

pluginManager.init(() => {
  console.log()

  const permanentpiece = document.querySelector("#permanentpiece");

  pluginManager.recommendedPluginNames().slice(0, 3).forEach((plugin) => {

    permanentpiece.innerHTML += `<a href="./available?filter=${plugin}" class="jenkins-button">
      <span>${plugin}</span>
      <span>Appearance</span>
    </a>`;

  })

})
