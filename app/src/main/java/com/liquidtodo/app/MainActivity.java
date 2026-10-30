package com.liquidtodo.app;

import android.annotation.SuppressLint;
import android.annotation.TargetApi;
import android.app.Activity;
import android.app.ActivityManager;
import android.content.Context;
import android.content.Intent;
import android.content.SharedPreferences;
import android.content.pm.ApplicationInfo;
import android.content.pm.PackageInfo;
import android.net.Uri;
import android.content.res.Configuration;
import android.graphics.Color;
import android.graphics.drawable.GradientDrawable;
import android.os.Build;
import android.os.Bundle;
import android.os.Handler;
import android.os.Looper;
import android.os.VibrationEffect;
import android.os.Vibrator;
import android.util.TypedValue;
import android.view.Gravity;
import android.view.HapticFeedbackConstants;
import android.view.View;
import android.view.ViewGroup;
import android.view.Window;
import android.view.WindowInsets;
import android.view.WindowManager;
import android.view.inputmethod.InputMethodManager;
import android.webkit.JavascriptInterface;
import android.webkit.RenderProcessGoneDetail;
import android.webkit.WebChromeClient;
import android.webkit.WebResourceError;
import android.webkit.WebResourceRequest;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import android.widget.Button;
import android.widget.FrameLayout;
import android.widget.ImageView;
import android.widget.LinearLayout;
import android.widget.TextView;
import android.widget.Toast;

import com.liquidtodo.app.data.TodoRepository;

import org.json.JSONObject;

import java.io.ByteArrayOutputStream;
import java.io.InputStream;
import java.io.OutputStream;
import java.text.SimpleDateFormat;
import java.util.Date;
import java.util.Locale;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;

/**
 * Offline WebView host for 流光待办 / Liquid Todo.
 *
 * Stability notes:
 *  - API 30+ classes are isolated in a nested class so Android 8-10 never has
 *    to resolve WindowInsetsController / Insets during class verification.
 *  - A renderer crash is caught with onRenderProcessGone, instead of killing
 *    the whole app. The next launch uses a reduced-effects "safe mode".
 *  - Any startup / load failure is shown as a native recovery screen, so the
 *    user never gets a silent flash-exit.
 *
 * The app requests no INTERNET permission. All data stays in SharedPreferences.
 */
@SuppressLint("ApplySharedPref")
public class MainActivity extends Activity {

    private static final String PREFS = "liquid_todo_prefs";
    private static final String SAFE_MODE_KEY = "safe_mode";
    private static final String LOW_POWER_KEY = "low_power_mode";
    private static final String PRIVACY_KEY = "privacy_accepted";
    private static final String PAGE_URL = "file:///android_asset/www/index.html";
    private static final int REQUEST_BACKUP = 2001;
    private static final int REQUEST_RESTORE = 2002;

    private WebView webView;
    private FrameLayout root;
    private View fallbackView;
    private View launchOverlay;
    private SharedPreferences prefs;
    private TodoRepository repository;

    private final Handler mainHandler = new Handler(Looper.getMainLooper());
    private final ExecutorService ioExecutor = Executors.newSingleThreadExecutor();
    private Runnable watchdog;
    private Runnable autoRetry;

    private volatile String pendingPassword;
    private volatile String pendingRestoreJson;
    private volatile String pendingRestoreSummary;
    private volatile String pendingBackupJson;

    private volatile boolean backGuard;
    private boolean darkMode;
    private boolean safeMode;
    private boolean lowPower;
    private volatile boolean pageReady;

    private int lastTopDp;
    private int lastBottomDp;
    private int lastImeDp;

    @SuppressLint("SetJavaScriptEnabled")
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

        prefs = getSharedPreferences(PREFS, Context.MODE_PRIVATE);
        repository = new TodoRepository(this, prefs);
        // Explicit user / crash-recovery choice wins. On a weak device the
        // initial automatic choice is written once, so later launches remember
        // it instead of asking again.
        boolean hasExplicitChoice = prefs.contains(SAFE_MODE_KEY);
        safeMode = hasExplicitChoice
                ? prefs.getBoolean(SAFE_MODE_KEY, false)
                : shouldStartInSafeMode();
        if (!hasExplicitChoice && safeMode) {
            prefs.edit().putBoolean(SAFE_MODE_KEY, true).commit();
        }
        lowPower = prefs.getBoolean(LOW_POWER_KEY, true);
        darkMode = (getResources().getConfiguration().uiMode
                & Configuration.UI_MODE_NIGHT_MASK) == Configuration.UI_MODE_NIGHT_YES;

        try {
            configureWindow();

            root = new FrameLayout(this);
            root.setBackgroundColor(Color.TRANSPARENT);
            root.setFitsSystemWindows(false);
            setContentView(root);

            // The DecorView is guaranteed to exist after setContentView().
            // Calling getInsetsController() any earlier is what caused the
            // DecorView NPE on some Android 14/15 OEM builds.
            setupSystemBars();

            root.setOnApplyWindowInsetsListener((v, insets) -> {
                captureInsets(insets);
                return insets;
            });

            createWebView();
            createLaunchOverlay();
            loadPage();
            startWatchdog();
        } catch (Throwable error) {
            logCrash("startup", error);
            showFatal(error);
        }
    }

    /* ---------------- WebView creation ---------------- */

    @SuppressLint("SetJavaScriptEnabled")
    private void createWebView() {
        WebView view = new WebView(this);
        view.setBackgroundColor(Color.TRANSPARENT);
        view.setOverScrollMode(View.OVER_SCROLL_NEVER);
        view.setVerticalScrollBarEnabled(false);
        view.setHorizontalScrollBarEnabled(false);
        view.setHapticFeedbackEnabled(true);
        view.setFitsSystemWindows(false);

        WebSettings settings = view.getSettings();
        settings.setJavaScriptEnabled(true);
        settings.setDomStorageEnabled(true);
        settings.setAllowFileAccess(true);
        settings.setAllowContentAccess(false);
        settings.setAllowFileAccessFromFileURLs(false);
        settings.setAllowUniversalAccessFromFileURLs(false);
        settings.setJavaScriptCanOpenWindowsAutomatically(false);
        settings.setSupportZoom(false);
        settings.setBuiltInZoomControls(false);
        settings.setDisplayZoomControls(false);
        settings.setUseWideViewPort(true);
        settings.setLoadWithOverviewMode(false);
        settings.setTextZoom(100);
        settings.setMediaPlaybackRequiresUserGesture(true);
        settings.setGeolocationEnabled(false);
        settings.setSaveFormData(false);
        settings.setCacheMode(WebSettings.LOAD_NO_CACHE);

        if ((getApplicationInfo().flags & ApplicationInfo.FLAG_DEBUGGABLE) != 0) {
            WebView.setWebContentsDebuggingEnabled(true);
        }

        view.addJavascriptInterface(new Bridge(), "Android");
        view.setWebChromeClient(new WebChromeClient());
        view.setWebViewClient(new WebViewClient() {
            @Override
            public boolean shouldOverrideUrlLoading(WebView v, WebResourceRequest request) {
                return !request.getUrl().toString().startsWith("file:///android_asset/");
            }

            @Override
            @SuppressWarnings("deprecation")
            public boolean shouldOverrideUrlLoading(WebView v, String url) {
                return url == null || !url.startsWith("file:///android_asset/");
            }

            @Override
            public void onPageFinished(WebView v, String url) {
                super.onPageFinished(v, url);
                dispatchInsets();
                sendSystemTheme(getResources().getConfiguration());
                applySystemBars();
            }

            @Override
            public void onReceivedError(WebView v, WebResourceRequest request,
                                        WebResourceError error) {
                if (request != null && request.isForMainFrame()) {
                    String detail = error == null ? "未知错误"
                            : String.valueOf(error.getDescription());
                    showFallback("页面加载失败",
                            "本地界面没有成功载入。\n" + detail,
                            "重新加载");
                }
            }

            @Override
            @SuppressWarnings("deprecation")
            public void onReceivedError(WebView v, int errorCode, String description,
                                        String failingUrl) {
                showFallback("页面加载失败",
                        "本地界面没有成功载入。\n" + description,
                        "重新加载");
            }

            @Override
            public boolean onRenderProcessGone(WebView v, RenderProcessGoneDetail detail) {
                // Returning true keeps this Activity alive. The default behaviour
                // is to crash the app, which looks like a flash-exit to the user.
                boolean wasAlreadySafe = safeMode;
                setSafeMode(true);
                if (root != null && v.getParent() == root) {
                    root.removeView(v);
                }
                try {
                    v.destroy();
                } catch (Throwable ignored) {
                }
                webView = null;
                pageReady = false;
                cancelWatchdog();
                showFallback(wasAlreadySafe ? "界面渲染进程异常" : "正在切换到兼容模式",
                        wasAlreadySafe
                                ? "兼容模式仍未能稳定渲染。\n可以稍后重试，或检查系统 WebView 更新。"
                                : "已降低背景模糊与光斑动画，玻璃质感与界面动效保留。\n即将自动重新加载。",
                        "立即重新加载");
                if (!wasAlreadySafe) {
                    if (autoRetry != null) mainHandler.removeCallbacks(autoRetry);
                    autoRetry = () -> {
                        autoRetry = null;
                        if (!isFinishing() && !isDestroyed()) {
                            recreate();
                        }
                    };
                    mainHandler.postDelayed(autoRetry, 1200);
                }
                return true;
            }
        });

        root.addView(view, new FrameLayout.LayoutParams(
                ViewGroup.LayoutParams.MATCH_PARENT,
                ViewGroup.LayoutParams.MATCH_PARENT));
        webView = view;
        root.requestApplyInsets();
    }

    private void loadPage() {
        if (webView == null) return;
        try {
            webView.loadUrl(safeMode ? PAGE_URL + "?safe=1" : PAGE_URL);
        } catch (Throwable error) {
            hideLaunchOverlayImmediately();
            showFatal(error);
        }
    }

    /**
     * Native launch surface. The WebView stays at alpha 0 until its first
     * complete frame, so there is no white flash between the system splash
     * and the actual UI. Cross-fade duration is intentionally gentle.
     */
    private void createLaunchOverlay() {
        if (root == null) return;
        try {
            FrameLayout overlay = new FrameLayout(this);
            overlay.setBackgroundResource(darkMode
                    ? R.drawable.launch_background_dark
                    : R.drawable.launch_background);

            LinearLayout content = new LinearLayout(this);
            content.setOrientation(LinearLayout.VERTICAL);
            content.setGravity(Gravity.CENTER_HORIZONTAL);

            ImageView icon = new ImageView(this);
            int size = dp(74);
            GradientDrawable mark = new GradientDrawable(
                    GradientDrawable.Orientation.TL_BR,
                    new int[]{Color.rgb(91, 140, 255), Color.rgb(154, 107, 255)});
            mark.setCornerRadius(dp(23));
            icon.setBackground(mark);
            icon.setImageResource(R.drawable.ic_splash_mark);
            icon.setScaleType(ImageView.ScaleType.CENTER_INSIDE);
            icon.setPadding(dp(17), dp(17), dp(17), dp(17));
            content.addView(icon, new LinearLayout.LayoutParams(size, size));

            int ink = darkMode ? Color.rgb(244, 246, 255) : Color.rgb(16, 24, 44);
            int muted = darkMode ? Color.rgb(156, 167, 195) : Color.rgb(105, 117, 141);
            int faint = darkMode ? Color.rgb(125, 137, 165) : Color.rgb(143, 154, 178);

            TextView title = new TextView(this);
            title.setText("流光待办");
            title.setTextSize(TypedValue.COMPLEX_UNIT_SP, 19);
            title.setTextColor(ink);
            title.setTypeface(null, android.graphics.Typeface.BOLD);
            title.setLetterSpacing(0.14f);
            title.setGravity(Gravity.CENTER);
            LinearLayout.LayoutParams titleLp = new LinearLayout.LayoutParams(
                    ViewGroup.LayoutParams.WRAP_CONTENT, ViewGroup.LayoutParams.WRAP_CONTENT);
            titleLp.topMargin = dp(18);
            content.addView(title, titleLp);

            TextView sub = new TextView(this);
            sub.setText("L I Q U I D   T O D O");
            sub.setTextSize(TypedValue.COMPLEX_UNIT_SP, 8);
            sub.setTextColor(faint);
            sub.setLetterSpacing(0.24f);
            sub.setGravity(Gravity.CENTER);
            LinearLayout.LayoutParams subLp = new LinearLayout.LayoutParams(
                    ViewGroup.LayoutParams.WRAP_CONTENT, ViewGroup.LayoutParams.WRAP_CONTENT);
            subLp.topMargin = dp(5);
            content.addView(sub, subLp);

            TextView tagline = new TextView(this);
            tagline.setText("把重要的事，放在光里。");
            tagline.setTextSize(TypedValue.COMPLEX_UNIT_SP, 10.5f);
            tagline.setTextColor(muted);
            tagline.setGravity(Gravity.CENTER);
            LinearLayout.LayoutParams taglineLp = new LinearLayout.LayoutParams(
                    ViewGroup.LayoutParams.WRAP_CONTENT, ViewGroup.LayoutParams.WRAP_CONTENT);
            taglineLp.topMargin = dp(16);
            content.addView(tagline, taglineLp);

            overlay.addView(content, new FrameLayout.LayoutParams(
                    ViewGroup.LayoutParams.WRAP_CONTENT,
                    ViewGroup.LayoutParams.WRAP_CONTENT,
                    Gravity.CENTER));
            root.addView(overlay, new FrameLayout.LayoutParams(
                    ViewGroup.LayoutParams.MATCH_PARENT,
                    ViewGroup.LayoutParams.MATCH_PARENT));
            launchOverlay = overlay;
            if (webView != null) webView.setAlpha(0f);
        } catch (Throwable ignored) {
            if (webView != null) webView.setAlpha(1f);
        }
    }

    private void dismissLaunchOverlay() {
        if (launchOverlay == null) {
            if (webView != null) webView.setAlpha(1f);
            return;
        }
        final View overlay = launchOverlay;
        launchOverlay = null;
        if (webView != null) {
            webView.animate().alpha(1f).setDuration(360).start();
        }
        overlay.animate()
                .alpha(0f)
                .setDuration(480)
                .withEndAction(() -> {
                    if (overlay.getParent() == root) root.removeView(overlay);
                })
                .start();
    }

    private void hideLaunchOverlayImmediately() {
        if (launchOverlay != null && launchOverlay.getParent() == root) {
            root.removeView(launchOverlay);
        }
        launchOverlay = null;
        if (webView != null) webView.setAlpha(1f);
    }

    private void startWatchdog() {
        cancelWatchdog();
        watchdog = () -> {
            if (!pageReady && webView != null && !isFinishing()) {
                setSafeMode(true);
                showFallback("界面加载超时",
                        "可能是系统 WebView 版本过旧，或渲染被系统中断。\n"
                                + "点击下方按钮以兼容模式重新加载。",
                        "以兼容模式重载");
            }
        };
        mainHandler.postDelayed(watchdog, 9000);
    }

    private void cancelWatchdog() {
        if (watchdog != null) {
            mainHandler.removeCallbacks(watchdog);
            watchdog = null;
        }
    }

    private void setSafeMode(boolean enabled) {
        safeMode = enabled;
        try {
            // commit() is intentional: onRenderProcessGone may recreate the
            // Activity immediately afterwards and must see this value.
            prefs.edit().putBoolean(SAFE_MODE_KEY, enabled).commit();
        } catch (Throwable ignored) {
        }
    }

    private void setLowPower(boolean enabled) {
        lowPower = enabled;
        try {
            prefs.edit().putBoolean(LOW_POWER_KEY, enabled).apply();
        } catch (Throwable ignored) {
        }
    }

    /**
     * Old WebViews, low-RAM devices and Android 9-and-below get the flat
     * (no blur/animation) presentation from the very first frame. This avoids
     * GPU/driver crashes before the renderer-crash callback has a chance to run.
     */
    private boolean shouldStartInSafeMode() {
        if (Build.VERSION.SDK_INT <= Build.VERSION_CODES.P) return true;
        try {
            ActivityManager am = (ActivityManager) getSystemService(Context.ACTIVITY_SERVICE);
            if (am != null && am.isLowRamDevice()) return true;
        } catch (Throwable ignored) {
        }
        try {
            PackageInfo info = WebView.getCurrentWebViewPackage();
            if (info != null && info.versionName != null) {
                String[] parts = info.versionName.split("\\.");
                int major = Integer.parseInt(parts[0]);
                if (major < 90) return true;
            }
        } catch (Throwable ignored) {
        }
        return false;
    }

    /* ---------------- Native recovery view ---------------- */

    private void showFatal(Throwable error) {
        String detail = error == null ? "未知错误"
                : error.getClass().getSimpleName() + ": " + String.valueOf(error.getMessage());
        try {
            if (root == null) {
                root = new FrameLayout(this);
                root.setBackgroundColor(Color.rgb(243, 246, 255));
                setContentView(root);
            }
            showFallback("应用启动遇到问题",
                    "错误已记录。可尝试以兼容模式重新进入。\n" + detail,
                    "以兼容模式重试");
        } catch (Throwable ignored) {
            finish();
        }
    }

    private void showFallback(String title, String detail, String buttonText) {
        if (root == null || isFinishing()) return;
        hideLaunchOverlayImmediately();
        if (fallbackView != null && fallbackView.getParent() == root) {
            root.removeView(fallbackView);
        }

        int pad = dp(26);
        LinearLayout panel = new LinearLayout(this);
        panel.setOrientation(LinearLayout.VERTICAL);
        panel.setGravity(Gravity.CENTER_HORIZONTAL);
        panel.setPadding(pad, dp(46), pad, pad);
        panel.setBackgroundColor(darkMode ? Color.rgb(8, 13, 26) : Color.rgb(246, 248, 255));

        TextView brand = new TextView(this);
        brand.setText("流光待办");
        brand.setTextSize(TypedValue.COMPLEX_UNIT_SP, 12);
        brand.setTextColor(darkMode ? Color.rgb(154, 169, 205) : Color.rgb(105, 117, 144));
        brand.setLetterSpacing(0.18f);
        brand.setGravity(Gravity.CENTER);
        panel.addView(brand, new LinearLayout.LayoutParams(
                ViewGroup.LayoutParams.WRAP_CONTENT, ViewGroup.LayoutParams.WRAP_CONTENT));

        TextView heading = new TextView(this);
        heading.setText(title);
        heading.setTextSize(TypedValue.COMPLEX_UNIT_SP, 23);
        heading.setTextColor(darkMode ? Color.WHITE : Color.rgb(16, 24, 47));
        heading.setGravity(Gravity.CENTER);
        heading.setTypeface(null, android.graphics.Typeface.BOLD);
        LinearLayout.LayoutParams headingLp = new LinearLayout.LayoutParams(
                ViewGroup.LayoutParams.WRAP_CONTENT, ViewGroup.LayoutParams.WRAP_CONTENT);
        headingLp.topMargin = dp(46);
        panel.addView(heading, headingLp);

        TextView body = new TextView(this);
        body.setText(detail);
        body.setTextSize(TypedValue.COMPLEX_UNIT_SP, 13);
        body.setTextColor(darkMode ? Color.rgb(183, 194, 220) : Color.rgb(91, 103, 128));
        body.setGravity(Gravity.CENTER);
        body.setLineSpacing(dp(5), 1f);
        LinearLayout.LayoutParams bodyLp = new LinearLayout.LayoutParams(
                ViewGroup.LayoutParams.MATCH_PARENT, ViewGroup.LayoutParams.WRAP_CONTENT);
        bodyLp.topMargin = dp(12);
        panel.addView(body, bodyLp);

        TextView note = new TextView(this);
        note.setText("兼容模式会关闭毛玻璃与动效，优先保证稳定运行。\n你的待办数据不会被清除。");
        note.setTextSize(TypedValue.COMPLEX_UNIT_SP, 11);
        note.setTextColor(darkMode ? Color.rgb(126, 140, 172) : Color.rgb(139, 150, 174));
        note.setGravity(Gravity.CENTER);
        note.setLineSpacing(dp(3), 1f);
        LinearLayout.LayoutParams noteLp = new LinearLayout.LayoutParams(
                ViewGroup.LayoutParams.MATCH_PARENT, ViewGroup.LayoutParams.WRAP_CONTENT);
        noteLp.topMargin = dp(18);
        panel.addView(note, noteLp);

        Button retry = new Button(this);
        retry.setText(buttonText);
        retry.setAllCaps(false);
        retry.setTextSize(TypedValue.COMPLEX_UNIT_SP, 14);
        retry.setTextColor(Color.WHITE);
        GradientDrawable shape = new GradientDrawable(
                GradientDrawable.Orientation.LEFT_RIGHT,
                new int[]{Color.rgb(91, 140, 255), Color.rgb(154, 107, 255)});
        shape.setCornerRadius(dp(16));
        retry.setBackground(shape);
        retry.setStateListAnimator(null);
        retry.setPadding(dp(24), 0, dp(24), 0);
        LinearLayout.LayoutParams buttonLp = new LinearLayout.LayoutParams(
                ViewGroup.LayoutParams.MATCH_PARENT, dp(52));
        buttonLp.topMargin = dp(26);
        panel.addView(retry, buttonLp);
        retry.setOnClickListener(v -> {
            if (autoRetry != null) {
                mainHandler.removeCallbacks(autoRetry);
                autoRetry = null;
            }
            setSafeMode(true);
            recreate();
        });

        fallbackView = panel;
        root.addView(panel, new FrameLayout.LayoutParams(
                ViewGroup.LayoutParams.MATCH_PARENT,
                ViewGroup.LayoutParams.MATCH_PARENT));
    }

    private void dismissFallback() {
        if (fallbackView != null && fallbackView.getParent() == root) {
            root.removeView(fallbackView);
        }
        fallbackView = null;
    }

    private int dp(int value) {
        return Math.round(value * getResources().getDisplayMetrics().density);
    }

    private void logCrash(String stage, Throwable error) {
        try {
            prefs.edit().putString("last_crash",
                    stage + " | " + error.getClass().getName() + ": " + error.getMessage()).apply();
        } catch (Throwable ignored) {
        }
    }

    /* ---------------- Window / edge-to-edge ---------------- */

    private void configureWindow() {
        try {
            Window window = getWindow();
            window.addFlags(WindowManager.LayoutParams.FLAG_DRAWS_SYSTEM_BAR_BACKGROUNDS);
            window.setStatusBarColor(Color.TRANSPARENT);
            window.setNavigationBarColor(Color.TRANSPARENT);
            window.setBackgroundDrawableResource(darkMode
                    ? R.drawable.launch_background_dark
                    : R.drawable.launch_background);
            // Do NOT touch DecorView / WindowInsetsController here. On several
            // Android 14/15 devices the DecorView is still null before
            // setContentView(), which produces:
            //   NullPointerException: DecorView.getWindowInsetsController() ...
        } catch (Throwable ignored) {
        }
    }

    private void setupSystemBars() {
        Window window = getWindow();
        View decor = window.getDecorView();
        if (decor == null) return;

        try {
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {
                Api29.disableContrast(window);
            }
        } catch (Throwable ignored) {
        }
        try {
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.R) {
                Api30.enableEdgeToEdge(window, decor);
            } else {
                decor.setSystemUiVisibility(edgeFlags());
            }
        } catch (Throwable ignored) {
            // Edge-to-edge is cosmetic. A failed OEM implementation must never
            // block the task list from launching.
        }
        applySystemBars();
    }

    private int edgeFlags() {
        int flags = View.SYSTEM_UI_FLAG_LAYOUT_STABLE
                | View.SYSTEM_UI_FLAG_LAYOUT_FULLSCREEN
                | View.SYSTEM_UI_FLAG_LAYOUT_HIDE_NAVIGATION;
        if (!darkMode) {
            flags |= View.SYSTEM_UI_FLAG_LIGHT_STATUS_BAR;
            flags |= View.SYSTEM_UI_FLAG_LIGHT_NAVIGATION_BAR;
        }
        return flags;
    }

    private void applySystemBars() {
        try {
            Window window = getWindow();
            View decor = window == null ? null : window.getDecorView();
            if (decor == null) return;
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.R) {
                Api30.applyBars(decor, darkMode);
            } else {
                decor.setSystemUiVisibility(edgeFlags());
            }
        } catch (Throwable ignored) {
        }
    }

    private void captureInsets(WindowInsets insets) {
        float density = getResources().getDisplayMetrics().density;
        try {
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.R) {
                int[] values = Api30.insets(insets, density);
                lastTopDp = values[0];
                lastBottomDp = values[1];
                lastImeDp = values[2];
            } else {
                lastTopDp = Math.max(0, Math.round(insets.getSystemWindowInsetTop() / density));
                lastBottomDp = Math.max(0,
                        Math.round(insets.getSystemWindowInsetBottom() / density));
                lastImeDp = 0;
            }
            dispatchInsets();
        } catch (Throwable ignored) {
        }
    }

    private void dispatchInsets() {
        if (webView == null) return;
        final String js = "window.setSafeArea(" + lastTopDp + "," + lastBottomDp + ");"
                + "window.setKeyboardInset(" + lastImeDp + ");";
        webView.post(() -> {
            if (webView != null) {
                try {
                    webView.evaluateJavascript(js, null);
                } catch (Throwable ignored) {
                }
            }
        });
    }

    private boolean isSystemDark(Configuration configuration) {
        if (configuration == null) configuration = getResources().getConfiguration();
        return (configuration.uiMode & Configuration.UI_MODE_NIGHT_MASK)
                == Configuration.UI_MODE_NIGHT_YES;
    }

    /**
     * HyperOS can keep the Activity alive while the system theme changes, and
     * some WebView builds do not refresh prefers-color-scheme. Push the native
     * configuration flag to the page instead of relying on matchMedia alone.
     */
    private void sendSystemTheme(Configuration configuration) {
        if (webView == null) return;
        final boolean dark = isSystemDark(configuration);
        webView.post(() -> {
            if (webView == null) return;
            try {
                webView.evaluateJavascript(
                        "window.setSystemTheme && window.setSystemTheme(" + dark + ")", null);
            } catch (Throwable ignored) {
            }
        });
    }

    @Override
    public void onConfigurationChanged(Configuration newConfig) {
        super.onConfigurationChanged(newConfig);
        sendSystemTheme(newConfig);
        if (root != null) {
            root.requestApplyInsets();
        }
    }

    @Override
    public void onWindowFocusChanged(boolean hasFocus) {
        super.onWindowFocusChanged(hasFocus);
        // HyperOS may change the system theme from Control Center while this
        // Activity stays resumed. Re-check on focus gain as a second path.
        if (hasFocus) {
            sendSystemTheme(getResources().getConfiguration());
        }
    }

    /* ---------------- Back handling ---------------- */

    @Override
    @SuppressWarnings("deprecation")
    public void onBackPressed() {
        if (backGuard && webView != null) {
            try {
                webView.evaluateJavascript(
                        "window.closeTopLayer ? window.closeTopLayer() : false", null);
                return;
            } catch (Throwable ignored) {
            }
        }
        super.onBackPressed();
    }

    /* ---------------- Haptics / keyboard ---------------- */

    @SuppressWarnings("deprecation")
    private void performHaptic(String type) {
        try {
            Vibrator vibrator = (Vibrator) getSystemService(Context.VIBRATOR_SERVICE);
            if (vibrator != null && vibrator.hasVibrator()) {
                long[] pattern;
                if ("success".equals(type)) {
                    pattern = new long[]{0, 12, 36, 16};
                } else if ("medium".equals(type)) {
                    pattern = new long[]{0, 18};
                } else {
                    pattern = new long[]{0, 8};
                }
                vibrator.vibrate(VibrationEffect.createWaveform(pattern, -1));
            } else if (webView != null) {
                webView.performHapticFeedback(HapticFeedbackConstants.KEYBOARD_TAP);
            }
        } catch (Throwable ignored) {
            if (webView != null) {
                webView.performHapticFeedback(HapticFeedbackConstants.KEYBOARD_TAP);
            }
        }
    }

    private void hideKeyboard() {
        try {
            InputMethodManager imm =
                    (InputMethodManager) getSystemService(Context.INPUT_METHOD_SERVICE);
            if (imm != null && webView != null) {
                imm.hideSoftInputFromWindow(webView.getWindowToken(), 0);
            }
            if (webView != null) webView.clearFocus();
        } catch (Throwable ignored) {
        }
    }

    /* ---------------- Encrypted backup / restore ---------------- */

    private void startBackup(String password) {
        startBackup(password, null);
    }

    private void startBackup(String password, String stateJson) {
        if (password == null || password.length() < 6) {
            callResult(true, false, "备份密码至少需要 6 个字符");
            return;
        }
        pendingPassword = password;
        pendingBackupJson = null;
        if (stateJson != null && repository.isValidState(stateJson)) {
            pendingBackupJson = stateJson;
        }
        String stamp = new SimpleDateFormat("yyyyMMdd-HHmm", Locale.US).format(new Date());
        Intent intent = new Intent(Intent.ACTION_CREATE_DOCUMENT);
        intent.addCategory(Intent.CATEGORY_OPENABLE);
        intent.setType("application/octet-stream");
        intent.putExtra(Intent.EXTRA_TITLE, "流光待办-" + stamp + ".liquidbackup");
        try {
            startActivityForResult(intent, REQUEST_BACKUP);
        } catch (Throwable error) {
            pendingPassword = null;
            callResult(true, false, "没有找到可用的文件选择器");
        }
    }

    private void startRestore(String password) {
        if (password == null || password.length() < 1) {
            callResult(false, false, "请输入备份密码");
            return;
        }
        pendingPassword = password;
        Intent intent = new Intent(Intent.ACTION_OPEN_DOCUMENT);
        intent.addCategory(Intent.CATEGORY_OPENABLE);
        intent.setType("*/*");
        try {
            startActivityForResult(intent, REQUEST_RESTORE);
        } catch (Throwable error) {
            pendingPassword = null;
            callResult(false, false, "没有找到可用的文件选择器");
        }
    }

    @Override
    protected void onActivityResult(int requestCode, int resultCode, Intent data) {
        super.onActivityResult(requestCode, resultCode, data);
        if (requestCode != REQUEST_BACKUP && requestCode != REQUEST_RESTORE) return;
        final boolean isBackup = requestCode == REQUEST_BACKUP;
        final String password = pendingPassword;
        pendingPassword = null;
        if (resultCode != RESULT_OK || data == null || data.getData() == null) {
            pendingBackupJson = null;
            callResult(isBackup, false, "已取消");
            return;
        }
        if (password == null) {
            pendingBackupJson = null;
            callResult(isBackup, false, "操作已失效，请重试");
            return;
        }
        final Uri uri = data.getData();
        try {
            ioExecutor.execute(() -> {
                if (isBackup) performBackup(uri, password);
                else performRestore(uri, password);
            });
        } catch (Throwable error) {
            callResult(isBackup, false, "操作已中断，请重试");
        }
    }

    private void performBackup(Uri uri, String password) {
        try {
            String supplied = pendingBackupJson;
            pendingBackupJson = null;
            String json = supplied != null ? supplied : repository.exportState();
            byte[] encrypted = BackupCrypto.encrypt(json, password);
            try (OutputStream output = getContentResolver().openOutputStream(uri, "wt")) {
                if (output == null) throw new IllegalStateException("无法写入文件");
                output.write(encrypted);
                output.flush();
            }
            callResult(true, true, "备份完成 · " + (encrypted.length / 1024 + 1) + " KB");
        } catch (Throwable error) {
            callResult(true, false, "备份失败，请检查存储位置后重试");
        }
    }

    private void performRestore(Uri uri, String password) {
        try {
            byte[] data;
            try (InputStream input = getContentResolver().openInputStream(uri)) {
                if (input == null) throw new IllegalStateException("无法读取文件");
                ByteArrayOutputStream buffer = new ByteArrayOutputStream();
                byte[] chunk = new byte[8192];
                int read;
                int total = 0;
                while ((read = input.read(chunk)) != -1) {
                    total += read;
                    if (total > 2 * 1024 * 1024) {
                        throw new IllegalArgumentException("文件过大");
                    }
                    buffer.write(chunk, 0, read);
                }
                data = buffer.toByteArray();
            }
            String json = BackupCrypto.decrypt(data, password);
            if (!repository.isValidState(json)) {
                callResult(false, false, "备份内容无法识别");
                return;
            }
            pendingRestoreJson = json;
            pendingRestoreSummary = repository.describe(json);
            callJs("window.onRestoreReady && window.onRestoreReady(" +
                    JSONObject.quote(pendingRestoreSummary) + "," +
                    JSONObject.quote(json) + ");");
        } catch (Throwable error) {
            callResult(false, false, "密码错误，或备份文件已损坏");
        }
    }

    private void applyPendingRestore(boolean merge) {
        final String json = pendingRestoreJson;
        pendingRestoreJson = null;
        pendingRestoreSummary = null;
        if (json == null) {
            callResult(false, false, "没有待恢复的备份");
            return;
        }
        try {
            ioExecutor.execute(() -> {
                boolean ok = merge ? repository.mergeState(json) : repository.importState(json);
                if (!ok) {
                    callResult(false, false, "恢复失败，请重试");
                    return;
                }
                callJs("window.onRestoreResult && window.onRestoreResult(true, '" +
                        (merge ? "已合并备份" : "恢复完成") + "');");
                runOnUiThread(() -> {
                    if (!isFinishing()) recreate();
                });
            });
        } catch (Throwable error) {
            callResult(false, false, "恢复失败，请重试");
        }
    }

    private void callResult(boolean backup, boolean ok, String message) {
        String function = backup ? "onBackupResult" : "onRestoreResult";
        callJs("window." + function + " && window." + function + "(" + ok + "," +
                JSONObject.quote(message) + ");");
    }

    private void callJs(String script) {
        if (webView == null) return;
        webView.post(() -> {
            if (webView == null) return;
            try {
                webView.evaluateJavascript(script, null);
            } catch (Throwable ignored) {
            }
        });
    }

    /* ---------------- WebView bridge ---------------- */

    private class Bridge {

        @JavascriptInterface
        public String loadState() {
            try {
                return repository.loadState();
            } catch (Throwable ignored) {
                return null;
            }
        }

        @JavascriptInterface
        public void saveState(String json) {
            if (json == null) return;
            try {
                repository.saveState(json);
            } catch (Throwable ignored) {
            }
        }

        @JavascriptInterface
        public void setBackGuard(boolean guard) {
            backGuard = guard;
        }

        @JavascriptInterface
        public void setDarkMode(boolean dark) {
            runOnUiThread(() -> {
                darkMode = dark;
                applySystemBars();
            });
        }

        @JavascriptInterface
        public void haptic(String type) {
            runOnUiThread(() -> performHaptic(type));
        }

        @JavascriptInterface
        public void hideKeyboard() {
            runOnUiThread(MainActivity.this::hideKeyboard);
        }

        @JavascriptInterface
        public void pageReady() {
            pageReady = true;
            runOnUiThread(() -> {
                cancelWatchdog();
                dismissFallback();
                dismissLaunchOverlay();
            });
        }

        @JavascriptInterface
        public void pageError(String message) {
            pageReady = false;
            setSafeMode(true);
            runOnUiThread(() -> showFallback("界面脚本异常",
                    "应用已阻止闪退，并切换到兼容模式。\n点击重新加载即可继续使用。",
                    "以兼容模式重载"));
        }

        @JavascriptInterface
        public boolean isSafeMode() {
            return safeMode;
        }

        @JavascriptInterface
        public boolean isSystemDark() {
            return MainActivity.this.isSystemDark(null);
        }

        @JavascriptInterface
        public boolean isLowPower() {
            return lowPower;
        }

        @JavascriptInterface
        public void setLowPowerEnabled(boolean enabled) {
            runOnUiThread(() -> setLowPower(enabled));
        }

        @JavascriptInterface
        public void startBackup(String password, String stateJson) {
            runOnUiThread(() -> MainActivity.this.startBackup(password, stateJson));
        }

        @JavascriptInterface
        public void startRestore(String password) {
            runOnUiThread(() -> MainActivity.this.startRestore(password));
        }

        @JavascriptInterface
        public void applyPendingRestore(boolean merge) {
            MainActivity.this.applyPendingRestore(merge);
        }

        @JavascriptInterface
        public boolean isPrivacyAccepted() {
            return prefs.getBoolean(PRIVACY_KEY, false);
        }

        @JavascriptInterface
        public void acceptPrivacy() {
            try {
                prefs.edit().putBoolean(PRIVACY_KEY, true).commit();
            } catch (Throwable ignored) {
            }
        }

        @JavascriptInterface
        public void setSafeModeEnabled(boolean enabled) {
            setSafeMode(enabled);
        }

        @JavascriptInterface
        public String getAppVersion() {
            try {
                PackageInfo info = getPackageManager()
                        .getPackageInfo(getPackageName(), 0);
                if (info.versionName != null && info.versionName.length() > 0) {
                    return info.versionName;
                }
            } catch (Throwable ignored) {
            }
            return "3.2.3";
        }

        @JavascriptInterface
        public void openUrl(String url) {
            runOnUiThread(() -> {
                try {
                    if (url == null || !(url.startsWith("https://") || url.startsWith("http://"))) {
                        return;
                    }
                    Intent intent = new Intent(Intent.ACTION_VIEW, Uri.parse(url));
                    startActivity(intent);
                } catch (Throwable ignored) {
                }
            });
        }

        @JavascriptInterface
        public void openEmail() {
            runOnUiThread(() -> {
                try {
                    Intent intent = new Intent(
                            Intent.ACTION_SENDTO,
                            Uri.parse("mailto:flicks.meek.3y@icloud.com"));
                    intent.putExtra(Intent.EXTRA_SUBJECT, "关于流光待办");
                    startActivity(Intent.createChooser(intent, "联系开发者"));
                } catch (Throwable error) {
                    Toast.makeText(MainActivity.this,
                            "未找到可用的邮件应用", Toast.LENGTH_SHORT).show();
                }
            });
        }
    }

    /* ---------------- API-isolated helpers ---------------- */

    @TargetApi(Build.VERSION_CODES.Q)
    private static final class Api29 {
        static void disableContrast(Window window) {
            if (window == null) return;
            window.setStatusBarContrastEnforced(false);
            window.setNavigationBarContrastEnforced(false);
        }
    }

    @TargetApi(Build.VERSION_CODES.R)
    private static final class Api30 {
        static void enableEdgeToEdge(Window window, View decor) {
            if (window == null || decor == null) return;
            window.setDecorFitsSystemWindows(false);
            android.view.WindowInsetsController controller =
                    decor.getWindowInsetsController();
            if (controller != null) {
                controller.setSystemBarsBehavior(
                        android.view.WindowInsetsController.BEHAVIOR_SHOW_TRANSIENT_BARS_BY_SWIPE);
            }
        }

        static void applyBars(View decor, boolean dark) {
            if (decor == null) return;
            android.view.WindowInsetsController controller =
                    decor.getWindowInsetsController();
            if (controller == null) return;
            int mask = android.view.WindowInsetsController.APPEARANCE_LIGHT_STATUS_BARS
                    | android.view.WindowInsetsController.APPEARANCE_LIGHT_NAVIGATION_BARS;
            controller.setSystemBarsAppearance(dark ? 0 : mask, mask);
        }

        static int[] insets(WindowInsets insets, float density) {
            android.graphics.Insets bars = insets.getInsets(
                    WindowInsets.Type.systemBars() | WindowInsets.Type.displayCutout());
            android.graphics.Insets ime = insets.getInsets(WindowInsets.Type.ime());
            return new int[]{
                    Math.max(0, Math.round(bars.top / density)),
                    Math.max(0, Math.round(bars.bottom / density)),
                    Math.max(0, Math.round(ime.bottom / density))
            };
        }
    }

    /* ---------------- Lifecycle ---------------- */

    @Override
    protected void onResume() {
        super.onResume();
        if (webView != null) {
            webView.onResume();
            sendSystemTheme(getResources().getConfiguration());
        }
        applySystemBars();
    }

    @Override
    protected void onPause() {
        if (webView != null) webView.onPause();
        super.onPause();
    }

    @Override
    protected void onDestroy() {
        cancelWatchdog();
        launchOverlay = null;
        pendingBackupJson = null;
        pendingRestoreJson = null;
        ioExecutor.shutdownNow();
        if (autoRetry != null) {
            mainHandler.removeCallbacks(autoRetry);
            autoRetry = null;
        }
        if (webView != null) {
            try {
                webView.removeJavascriptInterface("Android");
                webView.stopLoading();
                webView.loadUrl("about:blank");
                webView.destroy();
            } catch (Throwable ignored) {
            }
            webView = null;
        }
        super.onDestroy();
    }
}
