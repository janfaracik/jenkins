import analytics from "../../../../war/src/main/resources/images/symbols/analytics.svg?raw";
import brush from "../../../../war/src/main/resources/images/symbols/brush-outline.svg?raw";
import codeWorking from "../../../../war/src/main/resources/images/symbols/code-working.svg?raw";
import extensionPuzzle from "../../../../war/src/main/resources/images/symbols/extension-puzzle-outline.svg?raw";
import cube from "../../../../war/src/main/resources/images/symbols/cube.svg?raw";
import folder from "../../../../war/src/main/resources/images/symbols/folder.svg?raw";
import gitMerge from "../../../../war/src/main/resources/images/symbols/git-merge-outline.svg?raw";
import hammer from "../../../../war/src/main/resources/images/symbols/hammer.svg?raw";
import language from "../../../../war/src/main/resources/images/symbols/language-outline.svg?raw";
import notifications from "../../../../war/src/main/resources/images/symbols/notifications.svg?raw";
import people from "../../../../war/src/main/resources/images/symbols/people.svg?raw";
import server from "../../../../war/src/main/resources/images/symbols/server.svg?raw";

const icons = {
  "Organization and Administration": folder,
  "Build Features": extensionPuzzle,
  "Build Tools": hammer,
  "Build Analysis and Reporting": analytics,
  "Pipelines and Continuous Delivery": gitMerge,
  "Source Code Management": codeWorking,
  "Distributed Builds": server,
  "User Management and Security": people,
  "Notifications and Publishing": notifications,
  Appearance: brush,
  Languages: language,
};

export default function categoryIcon(category) {
  return (icons[category] || cube)
    .replace(/<title>.*?<\/title>/, "")
    .replace("<svg ", '<svg aria-hidden="true" ');
}
