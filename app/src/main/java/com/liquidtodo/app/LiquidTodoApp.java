package com.liquidtodo.app;

import android.annotation.SuppressLint;
import android.app.Application;
import android.content.Context;
import android.content.SharedPreferences;

import java.io.PrintWriter;
import java.io.StringWriter;

/**
 * Records the last uncaught exception locally. The next launch can use this
 * diagnostic to explain a failure without asking the user to run adb/logcat.
 */
@SuppressLint("ApplySharedPref")
public class LiquidTodoApp extends Application {

    @Override
    public void onCreate() {
        super.onCreate();

        final Thread.UncaughtExceptionHandler previous =
                Thread.getDefaultUncaughtExceptionHandler();

        Thread.setDefaultUncaughtExceptionHandler((thread, error) -> {
            try {
                StringWriter buffer = new StringWriter();
                error.printStackTrace(new PrintWriter(buffer));
                String trace = buffer.toString();
                if (trace.length() > 12000) trace = trace.substring(0, 12000);
                SharedPreferences prefs = getSharedPreferences(
                        "liquid_todo_prefs", Context.MODE_PRIVATE);
                prefs.edit()
                        .putString("last_crash", "uncaught | " + trace)
                        .commit();
            } catch (Throwable ignored) {
            }

            if (previous != null) {
                previous.uncaughtException(thread, error);
            } else {
                android.os.Process.killProcess(android.os.Process.myPid());
                System.exit(1);
            }
        });
    }
}
