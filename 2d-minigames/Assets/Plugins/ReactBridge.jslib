mergeInto(LibraryManager.library, {
  ReportUnlockToReact: function (jsonPtr) {
    try {
      // 1. Convert the pointer (int) to a string
      var jsonString = UTF8ToString(jsonPtr);

      // 2. Dispatch the event to the React Unity WebGL library
      window.dispatchReactUnityEvent("ReportUnlockToReact", jsonString);
    } catch (e) {
      console.warn("Failed to dispatch event to React:", e);
    }
  },
});
