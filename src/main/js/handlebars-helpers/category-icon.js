import {
  ANALYTICS,
  BRUSH,
  CODE_WORKING,
  CUBE,
  EXTENSION_PUZZLE,
  FOLDER,
  GIT_MERGE,
  HAMMER,
  LANGUAGE,
  NOTIFICATIONS,
  PEOPLE,
  SERVER,
} from "@/util/symbols";

const icons = {
  "Organization and Administration": FOLDER,
  "Build Features": EXTENSION_PUZZLE,
  "Build Tools": HAMMER,
  "Build Analysis and Reporting": ANALYTICS,
  "Pipelines and Continuous Delivery": GIT_MERGE,
  "Source Code Management": CODE_WORKING,
  "Distributed Builds": SERVER,
  "User Management and Security": PEOPLE,
  "Notifications and Publishing": NOTIFICATIONS,
  Appearance: BRUSH,
  Languages: LANGUAGE,
};

export default function categoryIcon(category) {
  return (icons[category] || CUBE).replace("<svg ", '<svg aria-hidden="true" ');
}
