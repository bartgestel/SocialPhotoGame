mergeInto(LibraryManager.library, {
  ReportUnlockToReact: function (jsonPtr) {
    try {
      // 1. Convert the pointer (int) to a string
      var jsonString = UTF8ToString(jsonPtr);
      
      console.log("Unity game reporting unlock:", jsonString);
      
      // 2. Parse the verification response from backend
      var response = JSON.parse(jsonString);
      
      // 3. Call the parent window's handler to show the unlocked picture
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
