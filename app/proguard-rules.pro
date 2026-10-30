# The app has no reflection-based libraries. Keep the JavaScript bridge entry points.
-keepclassmembers class com.liquidtodo.app.MainActivity$Bridge {
    @android.webkit.JavascriptInterface <methods>;
}
