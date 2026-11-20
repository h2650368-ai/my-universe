import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { dirname } from "node:path";

const manifestPath = "android/app/src/main/AndroidManifest.xml";
let xml = readFileSync(manifestPath, "utf8");

const permissions = [
  "android.permission.INTERNET",
  "android.permission.RECORD_AUDIO",
  "android.permission.MODIFY_AUDIO_SETTINGS",
  "android.permission.POST_NOTIFICATIONS",
  "android.permission.SYSTEM_ALERT_WINDOW"
];
for (const permission of permissions) {
  const tag = `<uses-permission android:name="${permission}" />`;
  if (!xml.includes(tag)) xml = xml.replace("<manifest", "<manifest\\n    " + tag);
}

const service = `
        <service
            android:name=".UniverseWallpaperService"
            android:label="MY UNIVERSE Live Wallpaper"
            android:permission="android.permission.BIND_WALLPAPER"
            android:exported="true">
            <intent-filter>
                <action android:name="android.service.wallpaper.WallpaperService" />
            </intent-filter>
            <meta-data
                android:name="android.service.wallpaper"
                android:resource="@xml/universe_wallpaper" />
        </service>
`;
if (!xml.includes("UniverseWallpaperService")) {
  xml = xml.replace("</application>", service + "\\n    </application>");
}
writeFileSync(manifestPath, xml);

const javaPath = "android/app/src/main/java/com/myuniverse/app/UniverseWallpaperService.java";
const java = `package com.myuniverse.app;

import android.service.wallpaper.WallpaperService;
import android.view.SurfaceHolder;
import android.graphics.Canvas;
import android.graphics.Paint;
import android.graphics.Color;
import android.graphics.LinearGradient;
import android.graphics.Shader;
import android.os.Handler;
import android.os.Looper;
import java.util.Random;

public class UniverseWallpaperService extends WallpaperService {
    @Override public Engine onCreateEngine() { return new UniverseEngine(); }

    private final class UniverseEngine extends Engine {
        private final Handler handler = new Handler(Looper.getMainLooper());
        private final Paint paint = new Paint(Paint.ANTI_ALIAS_FLAG);
        private final Random random = new Random(19);
        private final float[][] stars = new float[90][3];
        private boolean visible;
        private float phase = 0f;
        private final Runnable drawTask = new Runnable() {
            @Override public void run() {
                drawFrame();
                if (visible) handler.postDelayed(this, 40);
            }
        };

        UniverseEngine() {
            for (int i=0;i<stars.length;i++) {
                stars[i][0]=random.nextFloat();
                stars[i][1]=random.nextFloat();
                stars[i][2]=1f+random.nextFloat()*2.2f;
            }
        }

        @Override public void onVisibilityChanged(boolean v) {
            visible=v;
            handler.removeCallbacks(drawTask);
            if (visible) handler.post(drawTask);
        }

        @Override public void onSurfaceChanged(SurfaceHolder holder,int format,int width,int height) {
            super.onSurfaceChanged(holder,format,width,height);
            drawFrame();
        }

        @Override public void onSurfaceDestroyed(SurfaceHolder holder) {
            visible=false;
            handler.removeCallbacks(drawTask);
            super.onSurfaceDestroyed(holder);
        }

        private void drawFrame() {
            SurfaceHolder holder=getSurfaceHolder();
            Canvas canvas=null;
            try {
                canvas=holder.lockCanvas();
                if(canvas==null)return;
                int w=canvas.getWidth(), h=canvas.getHeight();
                paint.setShader(new LinearGradient(0,0,w,h,
                    new int[]{Color.rgb(3,7,24),Color.rgb(12,8,42),Color.rgb(2,12,28)},
                    null,Shader.TileMode.CLAMP));
                canvas.drawRect(0,0,w,h,paint);
                paint.setShader(null);
                float cx=w*(0.5f+0.12f*(float)Math.sin(phase*0.35f));
                float cy=h*0.42f;
                paint.setColor(Color.argb(28,80,120,255));
                canvas.drawCircle(cx,cy,Math.min(w,h)*0.34f,paint);
                paint.setColor(Color.argb(22,150,80,255));
                canvas.drawCircle(w*0.78f,h*0.72f,Math.min(w,h)*0.22f,paint);
                for(float[] s:stars) {
                    int alpha=90+(int)(100*(0.5+0.5*Math.sin(phase+s[0]*9)));
                    paint.setColor(Color.argb(alpha,190,215,255));
                    canvas.drawCircle(s[0]*w,s[1]*h,s[2],paint);
                }
                paint.setColor(Color.argb(150,120,170,255));
                paint.setTextSize(Math.max(18,w*0.045f));
                paint.setLetterSpacingSafe();
                canvas.drawText("MY UNIVERSE",w*0.08f,h*0.12f,paint);
                paint.setColor(Color.argb(90,170,190,230));
                paint.setTextSize(Math.max(10,w*0.022f));
                canvas.drawText("YOUR PERSONAL SPACE",w*0.085f,h*0.15f,paint);
                phase+=0.035f;
            } catch(Exception ignored) {
            } finally {
                if(canvas!=null) holder.unlockCanvasAndPost(canvas);
            }
        }
    }
}
`.replace("                paint.setLetterSpacingSafe();\\n","");
mkdirSync(dirname(javaPath), {recursive:true});
writeFileSync(javaPath, java);

const xmlPath = "android/app/src/main/res/xml/universe_wallpaper.xml";
mkdirSync(dirname(xmlPath), {recursive:true});
writeFileSync(xmlPath, `<?xml version="1.0" encoding="utf-8"?>
<wallpaper xmlns:android="http://schemas.android.com/apk/res/android"
    android:description="@string/app_name"
    android:thumbnail="@mipmap/ic_launcher" />
`);
console.log("Android permissions and MY UNIVERSE live wallpaper added.");
