const CLOUD_ENV_ID = "cloud1-4gh72aev1c85874d";
const CLOUD_FILE_PREFIX = `cloud://${CLOUD_ENV_ID}.636c-cloud1-4gh72aev1c85874d-1360566409`;

App({
  onLaunch() {
    // Initialize cloud capabilities if available
    if (wx.cloud) {
      wx.cloud.init({
        env: CLOUD_ENV_ID,
        traceUser: true,
      });
    }
  },
  globalData: {
    cloudPrefix: CLOUD_FILE_PREFIX,
  },
});
