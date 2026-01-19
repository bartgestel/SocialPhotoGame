mergeInto(LibraryManager.library, {
  ReportUnlockToReact: function (jsonPtr) {
    try {
      var jsonString = UTF8ToString(jsonPtr);
      
      console.log("Unity game reporting unlock:", jsonString);
      
      var response = JSON.parse(jsonString);
      
      if (window.parent && window.parent.handleUnityGameComplete) {
        console.log("Calling parent window handleUnityGameComplete");
        window.parent.handleUnityGameComplete(response);
      } else {
        console.warn("Parent window handleUnityGameComplete not found");
      }
    } catch (e) {
      console.error("Failed to report unlock:", e);
    }
  },
});
