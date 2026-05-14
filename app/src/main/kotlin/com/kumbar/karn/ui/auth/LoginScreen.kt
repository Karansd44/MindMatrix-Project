package com.kumbar.karn.ui.auth

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.shadow
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.input.PasswordVisualTransformation
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.kumbar.karn.ui.theme.ForestGreen
import com.kumbar.karn.ui.theme.Terracotta
import com.kumbar.karn.ui.theme.WhatsAppGreen
import com.kumbar.karn.ui.theme.PureWhite
import com.kumbar.karn.ui.theme.WarmOffWhite
import com.kumbar.karn.ui.theme.InkMedium
import com.kumbar.karn.ui.theme.DividerColor

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun LoginScreen(
    viewModel: AuthViewModel,
    onRegisterClick: () -> Unit,
    onForgotPasswordClick: () -> Unit = {}
) {
    var email by remember { mutableStateOf("") }
    var password by remember { mutableStateOf("") }
    val loading by viewModel.loading.collectAsState()
    val error by viewModel.error.collectAsState()

    // Warm earthy gradient background
    Box(
        modifier = Modifier
            .fillMaxSize()
            .background(
                Brush.verticalGradient(
                    colors = listOf(
                        Color(0xFFF0EDE6),   // warm off-white top
                        Color(0xFFE8E2D9)    // slightly deeper parchment bottom
                    )
                )
            )
    ) {
        Column(
            modifier = Modifier
                .fillMaxSize()
                .verticalScroll(rememberScrollState())
                .padding(horizontal = 28.dp, vertical = 48.dp),
            horizontalAlignment = Alignment.CenterHorizontally,
            verticalArrangement = Arrangement.Top
        ) {
            Spacer(modifier = Modifier.height(32.dp))

            // ── Brand Header ──────────────────────────────────────────────
            // Leaf / eco icon placeholder circle
            Box(
                modifier = Modifier
                    .size(72.dp)
                    .shadow(
                        elevation = 8.dp,
                        shape = RoundedCornerShape(36.dp),
                        ambientColor = ForestGreen.copy(alpha = 0.25f),
                        spotColor = ForestGreen.copy(alpha = 0.4f)
                    )
                    .background(ForestGreen, RoundedCornerShape(36.dp)),
                contentAlignment = Alignment.Center
            ) {
                Text(
                    text = "🏺",
                    fontSize = 32.sp
                )
            }

            Spacer(modifier = Modifier.height(20.dp))

            Text(
                text = "Kumbara-Kala",
                style = MaterialTheme.typography.headlineLarge,
                color = ForestGreen,
                textAlign = TextAlign.Center
            )

            Spacer(modifier = Modifier.height(6.dp))

            Text(
                text = "Handmade with love · Eco-friendly",
                style = MaterialTheme.typography.bodyMedium,
                color = Terracotta,
                textAlign = TextAlign.Center
            )

            Spacer(modifier = Modifier.height(48.dp))

            // ── Paper Card ────────────────────────────────────────────────
            Surface(
                modifier = Modifier
                    .fillMaxWidth()
                    .shadow(
                        elevation = 12.dp,
                        shape = RoundedCornerShape(24.dp),
                        ambientColor = Color(0xFF000000).copy(alpha = 0.08f),
                        spotColor   = Color(0xFF000000).copy(alpha = 0.12f)
                    ),
                shape = RoundedCornerShape(24.dp),
                color = PureWhite
            ) {
                Column(
                    modifier = Modifier.padding(horizontal = 24.dp, vertical = 32.dp),
                    horizontalAlignment = Alignment.CenterHorizontally
                ) {
                    Text(
                        text = "Welcome back",
                        style = MaterialTheme.typography.titleLarge,
                        color = ForestGreen
                    )

                    Spacer(modifier = Modifier.height(8.dp))

                    Text(
                        text = "Sign in to continue your artisan journey",
                        style = MaterialTheme.typography.bodyMedium,
                        color = InkMedium,
                        textAlign = TextAlign.Center
                    )

                    Spacer(modifier = Modifier.height(28.dp))

                    // Email field
                    OutlinedTextField(
                        value = email,
                        onValueChange = { email = it },
                        label = { Text("Email Address") },
                        modifier = Modifier.fillMaxWidth(),
                        shape = RoundedCornerShape(16.dp),
                        colors = OutlinedTextFieldDefaults.colors(
                            focusedBorderColor   = ForestGreen,
                            unfocusedBorderColor = DividerColor,
                            focusedLabelColor    = ForestGreen,
                            cursorColor          = ForestGreen
                        ),
                        singleLine = true
                    )

                    Spacer(modifier = Modifier.height(16.dp))

                    // Password field
                    OutlinedTextField(
                        value = password,
                        onValueChange = { password = it },
                        label = { Text("Password") },
                        visualTransformation = PasswordVisualTransformation(),
                        modifier = Modifier.fillMaxWidth(),
                        shape = RoundedCornerShape(16.dp),
                        colors = OutlinedTextFieldDefaults.colors(
                            focusedBorderColor   = ForestGreen,
                            unfocusedBorderColor = DividerColor,
                            focusedLabelColor    = ForestGreen,
                            cursorColor          = ForestGreen
                        ),
                        singleLine = true
                    )

                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.End
                    ) {
                        TextButton(
                            onClick = onForgotPasswordClick,
                            contentPadding = PaddingValues(vertical = 4.dp)
                        ) {
                            Text(
                                "Forgot password?",
                                style = MaterialTheme.typography.labelMedium,
                                color = Terracotta
                            )
                        }
                    }

                    if (error != null) {
                        Surface(
                            modifier = Modifier
                                .fillMaxWidth()
                                .padding(bottom = 12.dp),
                            color = Color(0xFFFDE8E8),
                            shape = RoundedCornerShape(12.dp)
                        ) {
                            Text(
                                text = error!!,
                                color = MaterialTheme.colorScheme.error,
                                style = MaterialTheme.typography.bodySmall,
                                modifier = Modifier.padding(12.dp),
                                textAlign = TextAlign.Center
                            )
                        }
                    }

                    Spacer(modifier = Modifier.height(24.dp))

                    // Primary CTA – Forest Green
                    Button(
                        onClick = { viewModel.login(email, password) },
                        modifier = Modifier
                            .fillMaxWidth()
                            .height(56.dp)
                            .shadow(
                                elevation = 6.dp,
                                shape = RoundedCornerShape(16.dp),
                                spotColor = ForestGreen.copy(alpha = 0.4f)
                            ),
                        enabled = !loading,
                        shape = RoundedCornerShape(16.dp),
                        colors = ButtonDefaults.buttonColors(
                            containerColor = ForestGreen,
                            contentColor   = PureWhite
                        )
                    ) {
                        if (loading) {
                            CircularProgressIndicator(
                                color = PureWhite,
                                modifier = Modifier.size(24.dp),
                                strokeWidth = 2.dp
                            )
                        } else {
                            Text(
                                "Sign In",
                                style = MaterialTheme.typography.labelLarge.copy(
                                    fontSize = 16.sp,
                                    fontWeight = FontWeight.SemiBold
                                )
                            )
                        }
                    }

                    Spacer(modifier = Modifier.height(12.dp))

                    // Secondary CTA – Terracotta outline
                    OutlinedButton(
                        onClick = { /* TODO: Google Login */ },
                        modifier = Modifier
                            .fillMaxWidth()
                            .height(52.dp),
                        shape = RoundedCornerShape(16.dp),
                        border = androidx.compose.foundation.BorderStroke(1.5.dp, Terracotta.copy(alpha = 0.6f)),
                        colors = ButtonDefaults.outlinedButtonColors(
                            contentColor = Terracotta
                        )
                    ) {
                        Text(
                            "Continue with Google",
                            style = MaterialTheme.typography.labelLarge
                        )
                    }
                }
            }

            Spacer(modifier = Modifier.height(28.dp))

            // ── Register Link ─────────────────────────────────────────────
            Row(
                verticalAlignment = Alignment.CenterVertically,
                horizontalArrangement = Arrangement.Center
            ) {
                Text(
                    "New to Kumbara-Kala? ",
                    style = MaterialTheme.typography.bodyMedium,
                    color = InkMedium
                )
                TextButton(onClick = onRegisterClick, contentPadding = PaddingValues(0.dp)) {
                    Text(
                        "Join the community",
                        style = MaterialTheme.typography.bodyMedium.copy(fontWeight = FontWeight.SemiBold),
                        color = ForestGreen
                    )
                }
            }

            Spacer(modifier = Modifier.height(16.dp))
        }
    }
}
