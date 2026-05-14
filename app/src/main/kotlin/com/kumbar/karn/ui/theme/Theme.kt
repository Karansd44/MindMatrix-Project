package com.kumbar.karn.ui.theme

import androidx.compose.foundation.isSystemInDarkTheme
import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.TextStyle
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp

private val DarkColorScheme = darkColorScheme(
    primary = HeritageParchment,
    secondary = HeritageSienna,
    tertiary = HeritageGold,
    background = HeritageMidnight,
    surface = Color(0xFF1A252F),
    onPrimary = HeritageMidnight,
    onSecondary = HeritageWhite,
    onTertiary = HeritageMidnight,
    onBackground = HeritageParchment,
    onSurface = HeritageParchment,
)

private val LightColorScheme = lightColorScheme(
    primary = HeritagePrimary,
    secondary = HeritageSecondary,
    tertiary = HeritageAccent,
    background = HeritageBackground,
    surface = HeritageSurface,
    onPrimary = HeritageOnPrimary,
    onSecondary = HeritageOnSecondary,
    onTertiary = HeritageMidnight,
    onBackground = HeritageOnBackground,
    onSurface = HeritageOnSurface,
    outlineVariant = HeritageOutline
)

val HeritageTypography = Typography(
    headlineLarge = TextStyle(
        fontFamily = FontFamily.Serif,
        fontWeight = FontWeight.Bold,
        fontSize = 34.sp,
        lineHeight = 42.sp,
        letterSpacing = 0.sp
    ),
    headlineMedium = TextStyle(
        fontFamily = FontFamily.Serif,
        fontWeight = FontWeight.SemiBold,
        fontSize = 28.sp,
        lineHeight = 36.sp
    ),
    titleLarge = TextStyle(
        fontFamily = FontFamily.Serif,
        fontWeight = FontWeight.Medium,
        fontSize = 22.sp,
        lineHeight = 28.sp
    ),
    bodyLarge = TextStyle(
        fontFamily = FontFamily.SansSerif,
        fontWeight = FontWeight.Normal,
        fontSize = 16.sp,
        lineHeight = 24.sp,
        letterSpacing = 0.5.sp
    ),
    bodyMedium = TextStyle(
        fontFamily = FontFamily.SansSerif,
        fontWeight = FontWeight.Normal,
        fontSize = 14.sp,
        lineHeight = 20.sp,
        letterSpacing = 0.25.sp
    ),
    labelMedium = TextStyle(
        fontFamily = FontFamily.SansSerif,
        fontWeight = FontWeight.Medium,
        fontSize = 12.sp,
        lineHeight = 16.sp,
        letterSpacing = 1.sp
    )
)

val HeritageShapes = Shapes(
    small = androidx.compose.foundation.shape.RoundedCornerShape(4.dp),
    medium = androidx.compose.foundation.shape.RoundedCornerShape(4.dp),
    large = androidx.compose.foundation.shape.RoundedCornerShape(4.dp)
)

@Composable
fun KumbaraKalaTheme(
    darkTheme: Boolean = isSystemInDarkTheme(),
    content: @Composable () -> Unit
) {
    val colorScheme = if (darkTheme) DarkColorScheme else LightColorScheme

    MaterialTheme(
        colorScheme = colorScheme,
        typography = HeritageTypography,
        shapes = HeritageShapes,
        content = content
    )
}
