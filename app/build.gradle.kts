import java.util.Properties

// Load secrets from local.properties (never commit this file)
val localProps = Properties().apply {
    val f = rootProject.file("local.properties")
    if (f.exists()) load(f.inputStream())
}

plugins {
    id("com.android.application")
    id("org.jetbrains.kotlin.android")
    id("com.google.gms.google-services")
    id("kotlin-kapt")
    id("com.google.dagger.hilt.android")
}

android {
    namespace  = "com.kumbar.karn"
    compileSdk = 34   // keep at 34 – Compose 1.5.x does not support SDK 35

    defaultConfig {
        applicationId = "com.kumbar.karn"
        minSdk        = 24
        targetSdk     = 34
        versionCode   = 1
        versionName   = "1.0.0"

        testInstrumentationRunner = "androidx.test.runner.AndroidJUnitRunner"
        vectorDrawables {
            useSupportLibrary = true
        }

        // ── BuildConfig constants ─────────────────────────────────────────────
        buildConfigField("String",  "FIREBASE_PROJECT_ID",    "\"kumbarakala-e07de\"")
        buildConfigField("String",  "FIREBASE_STORAGE_BUCKET","\"kumbarakala-e07de.firebasestorage.app\"")
        buildConfigField("String",  "DEFAULT_LANGUAGE",       "\"en\"")
        buildConfigField("int",     "STORY_CARD_WIDTH",       "1080")   // lowercase = Java primitive
        buildConfigField("int",     "STORY_CARD_HEIGHT",      "1350")
    }

    // ── Signing ───────────────────────────────────────────────────────────────
    // Release signing is OPTIONAL during development.
    // Fill in RELEASE_* keys in local.properties before building a signed APK.
    val releaseStorePath = localProps["RELEASE_STORE_FILE"] as? String
    val hasReleaseSigning = !releaseStorePath.isNullOrEmpty()

    if (hasReleaseSigning) {
        signingConfigs {
            create("release") {
                storeFile     = file(releaseStorePath!!)
                storePassword = localProps["RELEASE_STORE_PASSWORD"] as? String
                keyAlias      = localProps["RELEASE_KEY_ALIAS"]     as? String
                keyPassword   = localProps["RELEASE_KEY_PASSWORD"]  as? String
            }
        }
    }

    buildTypes {
        debug {
            isDebuggable    = true
            isMinifyEnabled = false

            val key = localProps["GEMINI_API_KEY_DEBUG"] as? String ?: ""
            buildConfigField("String",  "GEMINI_API_KEY", "\"$key\"")
            buildConfigField("boolean", "IS_DEBUG",       "true")   // FIX: lowercase boolean
        }
        release {
            isDebuggable      = false
            isMinifyEnabled   = true
            isShrinkResources = true
            proguardFiles(
                getDefaultProguardFile("proguard-android-optimize.txt"),
                "proguard-rules.pro"
            )

            // Only attach signing config when keys are provided
            if (hasReleaseSigning) {
                signingConfig = signingConfigs.getByName("release")
            }

            val key = localProps["GEMINI_API_KEY_RELEASE"] as? String ?: ""
            buildConfigField("String",  "GEMINI_API_KEY", "\"$key\"")
            buildConfigField("boolean", "IS_DEBUG",       "false")  // FIX: lowercase boolean
        }
    }

    compileOptions {
        sourceCompatibility = JavaVersion.VERSION_17
        targetCompatibility = JavaVersion.VERSION_17
    }
    kotlinOptions {
        jvmTarget = "17"
    }
    buildFeatures {
        compose     = true
        buildConfig = true
    }
    composeOptions {
        kotlinCompilerExtensionVersion = "1.5.14"
    }
    packaging {
        resources {
            excludes += "/META-INF/{AL2.0,LGPL2.1}"
        }
    }
}

dependencies {
    // ── AndroidX Core ────────────────────────────────────────────────────────
    implementation("androidx.core:core-ktx:1.13.1")
    implementation("androidx.lifecycle:lifecycle-runtime-ktx:2.8.1")
    implementation("androidx.activity:activity-compose:1.9.0")

    // ── Jetpack Compose ───────────────────────────────────────────────────────
    implementation(platform("androidx.compose:compose-bom:2024.05.00"))
    implementation("androidx.compose.ui:ui")
    implementation("androidx.compose.ui:ui-graphics")
    implementation("androidx.compose.ui:ui-tooling-preview")
    implementation("androidx.compose.material3:material3")
    implementation("androidx.compose.material:material-icons-extended")

    // ── Firebase (BoM manages all versions) ──────────────────────────────────
    implementation(platform("com.google.firebase:firebase-bom:33.0.0"))
    implementation("com.google.firebase:firebase-auth")
    implementation("com.google.firebase:firebase-firestore")
    implementation("com.google.firebase:firebase-storage")
    implementation("com.google.firebase:firebase-analytics")

    // ── Google AI / Gemini ────────────────────────────────────────────────────
    implementation("com.google.ai.client.generativeai:generativeai:0.7.0")

    // ── Dependency Injection (Hilt) ───────────────────────────────────────────
    implementation("com.google.dagger:hilt-android:2.51.1")
    kapt("com.google.dagger:hilt-android-compiler:2.51.1")
    implementation("androidx.hilt:hilt-navigation-compose:1.2.0")

    // ── Navigation ────────────────────────────────────────────────────────────
    implementation("androidx.navigation:navigation-compose:2.7.7")

    // ── Image Loading ─────────────────────────────────────────────────────────
    implementation("io.coil-kt:coil-compose:2.5.0")

    // ── Testing ───────────────────────────────────────────────────────────────
    testImplementation("junit:junit:4.13.2")
    androidTestImplementation("androidx.test.ext:junit:1.1.5")
    androidTestImplementation("androidx.test.espresso:espresso-core:3.5.1")
    androidTestImplementation(platform("androidx.compose:compose-bom:2024.05.00"))
    androidTestImplementation("androidx.compose.ui:ui-test-junit4")
    debugImplementation("androidx.compose.ui:ui-tooling")
    debugImplementation("androidx.compose.ui:ui-test-manifest")
}

kapt {
    correctErrorTypes = true
}
