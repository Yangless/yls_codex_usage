import { createApp } from "vue";
import App from "./App.vue";
import "./main.css";
import { platform } from "./platform";
import { applyVisualEnvironment } from "./platform/visual-environment";

applyVisualEnvironment(document, platform.runtime);
createApp(App).mount("#app");
