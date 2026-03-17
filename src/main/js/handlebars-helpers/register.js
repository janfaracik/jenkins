import id from "./id";
import ifeq from "./ifeq";
import ifneq from "./ifneq";
import inArray from "./in-array";
import replace from "./replace";

let registered = false;

export default function registerHandlebarsHelpers(Handlebars) {
  if (registered) {
    return;
  }

  Handlebars.registerHelper("id", id);
  Handlebars.registerHelper("ifeq", ifeq);
  Handlebars.registerHelper("ifneq", ifneq);
  Handlebars.registerHelper("in-array", inArray);
  Handlebars.registerHelper("replace", replace);

  registered = true;
}
