package com.kumbar.karn.ui.theme

import androidx.compose.foundation.isSystemInDarkTheme
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.TextStyle
import androidx.compose.ui.text.font.Font
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp

// ─── Typography ──────────────────────────────────────────────────────────────
// Fraunces (soft chunky serif) → system Serif as closest built-in substitute.
// Open Sans (friendly body) → system SansSerif.
// In a real app, bundle the TTF files in res/font/ and reference them via Font().

val FrauncesFamily: FontFamily = FontFamily.Serif      // → substitute for Fraunces
val OpenSansFamily: FontFamily = FontFamily.SansSerif  // → substitute for Open Sans

val KumbaraKalaTypography = Typography(
    // ── Display / Headings – Fraunces ──
    displayLarge = TextStyle(
        fontFamily = FrauncesFamily,
        fontWeight = FontWeight.Bold,
        fontSize = 36.sp,
        lineHeight = 44.sp,
        letterSpacing = (-0.5).sp
    ),
    headlineLarge = TextStyle(
        fontFamily = FrauncesFamily,
        fontWeight = FontWeight.Bold,
        fontSize = 30.sp,
        lineHeight = 38.sp,
        letterSpacing = 0.sp
    ),
    headlineMedium = TextStyle(
        fontFamily = FrauncesFamily,
        fontWeight = FontWeight.SemiBold,
        fontSize = 24.sp,
        lineHeight = 32.sp
    ),
    titleLarge = TextStyle(
        fontFamily = FrauncesFamily,
        fontWeight = FontWeight.Medium,
        fontSize = 20.sp,
        lineHeight = 28.sp
    ),
    titleMedium = TextStyle(
        fontFamily = FrauncesFamily,
        fontWeight = FontWeight.Medium,
        fontSize = 18.sp,
        lineHeight = 24.sp
    ),

    // ── Body – Open Sans ──
    bodyLarge = TextStyle(
        fontFamily = OpenSansFamily,
        fontWeight = FontWeight.Normal,
        fontSize = 16.sp,
        lineHeight = 26.sp,
        letterSpacing = 0.15.sp
    ),
    bodyMedium = TextStyle(
        fontFamily = OpenSansFamily,
        fontWeight = FontWeight.Normal,
        fontSize = 14.sp,
        lineHeight = 22.sp,
        letterSpacing = 0.25.sp
    ),
    bodySmall = TextStyle(
        fontFamily = OpenSansFamily,
        fontWeight = FontWeight.Normal,
        fontSize = 12.sp,
        lineHeight = 18.sp
    ),
    labelLarge = TextStyle(
        fontFamily = OpenSansFamily,
        fontWeight = FontWeight.SemiBold,
        fontSize = 14.sp,
        lineHeight = 20.sp,
        letterSpacing = 0.1.sp
    ),
    labelMedium = TextStyle(
        fontFamily = OpenSansFamily,
        fontWeight = FontWeight.Medium,
        fontSize = 12.sp,
        lineHeight = 16.sp,
        letterSpacing = 0.5.sp
    ),
    labelSmall = TextStyle(
        fontFamily = OpenSansFamily,
        fontWeight = FontWeight.Medium,
        fontSize = 10.sp,
        lineHeight = 14.sp,
        letterSpacing = 0.5.sp
    )
)

// ─── Shapes – large border-radii, warm and approachable ──────────────────────
val KumbaraKalaShapes = Shapes(
    extraSmall = RoundedCornerShape(8.dp),
    small      = RoundedCornerShape(12.dp),
    medium     = RoundedCornerShape(16.dp),
    large      = RoundedCornerShape(24.dp),
    extraLarge = RoundedCornerShape(32.dp)
)

// ─── Color Schemes ───────────────────────────────────────────────────────────
private val LightColorScheme = lightColorScheme(
    primary            = KKPrimary,
    onPrimary          = KKOnPrimary,
    primaryContainer   = KKPrimaryContainer,
    onPrimaryContainer = ForestGreen,

    secondary            = KKSecondary,
    onSecondary          = KKOnSecondary,
    secondaryContainer   = KKSecondaryContainer,
    onSecondaryContainer = Terracotta,

    // WhatsApp green as tertiary (share actions)
    tertiary             = WhatsAppGreen,
    onTertiary           = PureWhite,
    tertiaryContainer    = Color(0xFFD4F8E4),
    onTertiaryContainer  = WhatsAppGreenDark,

    background   = KKBackground,
    onBackground = KKOnBackground,
    surface      = KKSurface,
    onSurface    = KKOnSurface,

    surfaceVariant   = PaperSurface,
    onSurfaceVariant = InkMedium,

    outline        = KKOutline,
    outlineVariant = DividerColor,

    error    = KKError,
    onError  = PureWhite,

    // Subtle elevation tint
    surfaceTint = ForestGreenLight
)

// Dark variant kept functional but toned to earthy night colors
private val DarkColorScheme = darkColorScheme(
    primary            = ForestGreenPastel,
    onPrimary          = ForestGreen,
    primaryContainer   = ForestGreen,
    onPrimaryContainer = ForestGreenPastel,

    secondary            = TerracottaLight,
    onSecondary          = InkDark,
    secondaryContainer   = Terracotta,
    onSecondaryContainer = TerracottaPastel,

    tertiary             = WhatsAppGreen,
    onTertiary           = InkDark,

    background   = Color(0xFF1A1E16),   // dark olive-black
    onBackground = Color(0xFFE8EDE0),

    surface      = Color(0xFF232819),
    onSurface    = Color(0xFFE8EDE0),

    surfaceVariant   = Color(0xFF2E3420),
    onSurfaceVariant = Color(0xFFBDC8A8),

    outline        = Color(0xFF3E5622).copy(alpha = 0.4f),
    outlineVariant = Color(0xFF3E5622).copy(alpha = 0.2f),

    error   = Color(0xFFE57373),
    onError = InkDark
)

// ─── Theme Entry Point ────────────────────────────────────────────────────────
@Composable
fun KumbaraKalaTheme(
    darkTheme: Boolean = isSystemInDarkTheme(),
    content: @Composable () -> Unit
) {
    val colorScheme = if (darkTheme) DarkColorScheme else LightColorScheme

    MaterialTheme(
        colorScheme = colorScheme,
        typography  = KumbaraKalaTypography,
        shapes      = KumbaraKalaShapes,
        content     = content
    )
}
