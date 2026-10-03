import { Config } from "@remotion/cli/config";

// Three.js needs ANGLE for reliable headless rendering.
Config.setChromiumOpenGlRenderer("angle");
