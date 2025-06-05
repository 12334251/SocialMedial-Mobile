// metro.config.js
const { getDefaultConfig } = require("@expo/metro-config");
const { withNativeWind } = require("nativewind/metro");
const {
  wrapWithReanimatedMetroConfig,
} = require("react-native-reanimated/metro-config");

module.exports = (async () => {
  // 1) Start with Expo's default Metro configuration
  const expoConfig = await getDefaultConfig(__dirname);

  // 2) Ensure the Expo asset plugin for hashing is present
  //    (so that static image imports get hashed correctly)
  const { assetPlugins = [] } = expoConfig.transformer || {};
  expoConfig.transformer = {
    ...expoConfig.transformer,
    assetPlugins: Array.from(
      new Set([...assetPlugins, "expo-asset/tools/hashAssetFiles"])
    ),
  };

  // 3) Add any extra asset extensions you need (png, jpg, jpeg are usually already included)
  const { assetExts = [] } = expoConfig.resolver || {};
  expoConfig.resolver = {
    ...expoConfig.resolver,
    assetExts: Array.from(new Set([...assetExts, "png", "jpg", "jpeg"])),
  };

  // 4) Wrap the Expo config with NativeWind’s Metro plugin, pointing to global.css
  const nativeWindConfig = withNativeWind(expoConfig, {
    input: "./global.css", // this file must exist at the project root (see next section)
  });

  // 5) Wrap the merged config with Reanimated
  return wrapWithReanimatedMetroConfig(nativeWindConfig);
})();
