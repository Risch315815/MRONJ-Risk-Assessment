# Keep React Native classes
-keep class com.facebook.react.** { *; }
-keep class com.facebook.hermes.** { *; }
-keep class com.swmansion.reanimated.** { *; }

# Keep your app's classes
-keep class com.mronjriskassessment.** { *; }

# Keep source file names and line numbers for better crash reports
-keepattributes SourceFile,LineNumberTable

# Keep JavaScript callbacks
-keepclassmembers class * {
    @com.facebook.react.uimanager.annotations.ReactProp <methods>;
}

# Keep custom components
-keep public class * extends com.facebook.react.ReactPackage