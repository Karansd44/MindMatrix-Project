import java.util.Properties

// Load secrets from local.properties (never commit this file)
val localProps = Properties().apply {
    val f = rootProject.file("local.properties")
    if (f.exists()) load(f.inputStream())
}

// Helper to safely read a non-blank string from local.properties
fun localProp(key: String): String? =
    (localProps[key] as? String)?.takeIf { it.isNotBlank() }

plugins {
    id("com.android.application")
    id("org.jetbrains.kotlin.android")
    id("com.google.gms.google-services")
    id("kotlin-kapt")
    id("com.google.dagger.hilt.android")
}

android {
    namespace  = "com.kumbar.karn"
    compileSdk = 34

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

        buildConfigField("String", "FIREBASE_PROJECT_ID",    "\"kumbarakala-e07de\"")
        buildConfigField("String", "FIREBASE_STORAGE_BUCKET","\"kumbarakala-e07de.firebasestorage.app\"")
        buildConfigField("String", "DEFAULT_LANGUAGE",       "\"en\"")
        buildConfigField("int",    "STORY_CARD_WIDTH",       "1080")
        buildConfigField("int",    "STORY_CARD_HEIGHT",      "1350")
    }

    // ── signingConfigs must ALWAYS be declared unconditionally inside android{}
    // Properties are nullable – AGP simply won't sign if storeFile is null.
    signingConfigs {
        create("release") {
            storeFile     = localProp("RELEASE_STORE_FILE")?.let { file(it) }
            storePassword = localProp("RELEASE_STORE_PASSWORD")
            keyAlias      = localProp("RELEASE_KEY_ALIAS")
            keyPassword   = localProp("RELEASE_KEY_PASSWORD")
        }
    }

    buildTypes {
        debug {
            isDebuggable    = true
            isMinifyEnabled = false

            val key = localProp("GEMINI_API_KEY_DEBUG") ?: ""
            buildConfigField("String",  "GEMINI_API_KEY", "\"$key\"")
            buildConfigField("boolean", "IS_DEBUG",       "true")
        }
        release {
            isDebuggable      = false
            isMinifyEnabled   = true
            isShrinkResources = true
            proguardFiles(
                getDefaultProguardFile("proguard-android-optimize.txt"),
                "proguard-rules.pro"
            )

            // Only wire the signing config when a keystore path is actually set
            if (localProp("RELEASE_STORE_FILE") != null) {
                signingConfig = signingConfigs.getByName("release")
            }

            val key = localProp("GEMINI_API_KEY_RELEASE") ?: ""
            buildConfigField("String",  "GEMINI_API_KEY", "\"$key\"")
            buildConfigField("boolean", "IS_DEBUG",       "false")
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

    // ── Firebase ─────────────────────────────────────────────────────────────
    implementation(platform("com.google.firebase:firebase-bom:33.0.0"))
    implementation("com.google.firebase:firebase-auth")
    implementation("com.google.firebase:firebase-database")
    implementation("com.google.firebase:firebase-storage")
    implementation("com.google.firebase:firebase-analytics")
    implementation("com.google.android.gms:play-services-auth:21.1.1")

    // ── Google AI / Gemini ────────────────────────────────────────────────────
    implementation("com.google.ai.client.generativeai:generativeai:0.7.0")

    // ── Hilt ─────────────────────────────────────────────────────────────────
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
