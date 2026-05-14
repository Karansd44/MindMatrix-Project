# Product Requirements Document (PRD): Kumbara-Kala

**Version:** 1.0  
**Status:** Draft  
**Project Lead:** Gemini CLI  

---

## 1. Executive Summary
Kumbara-Kala is a specialized digital platform designed to empower rural pottery artisans by bridging the gap between traditional craftsmanship and modern digital marketing. Using Google’s Gemini AI, the platform enables artisans to generate "Digital Story Cards"—marketing assets that combine heritage narratives with the scientific and health benefits of clay pottery.

## 2. Problem Statement
Rural artisans possess immense skill and produce eco-friendly, health-positive products, but they face three primary barriers:
1.  **Marketing Gap:** Inability to articulate the scientific/health benefits of clay (e.g., alkalinity, mineral retention) to urban consumers.
2.  **Branding Literacy:** Lack of access to professional graphic design and copywriting tools.
3.  **Digital Isolation:** Difficulty in creating content that is easily shareable on modern social platforms like WhatsApp.

## 3. Goals & Objectives
*   **Empowerment:** Provide artisans with a professional digital identity.
*   **Education:** Use AI to translate traditional knowledge into consumer-friendly health and wellness facts.
*   **Sales Enablement:** Create high-quality, shareable marketing collateral (Story Cards) to drive direct-to-consumer sales.
*   **Sustainability:** Promote eco-friendly alternatives to plastic and aluminum cookware.

## 4. Target Audience
*   **Primary:** Rural pottery artisans (Potters/Kumbaras).
*   **Secondary:** Health-conscious urban consumers, eco-lifestyle enthusiasts.
*   **Stakeholders:** NGOs and cooperatives supporting rural livelihoods.

## 5. Functional Requirements

### 5.1 Authentication & Profile Management
*   **User Roles:** Support for `artisan`, `customer`, and `admin` roles.
*   **Artisan Profiles:** Capture details including name, village, years of experience, and heritage story.
*   **Localization:** Support for English, Hindi, Tamil, and Kannada.

### 5.2 AI Story Generator
*   **Core Engine:** Integration with Gemini-3-Flash to generate product descriptions.
*   **Tone Control:** Ability to select between 'Friendly Educator', 'Scientific', and 'Folk/Heritage' tones.
*   **Contextual Intelligence:** The AI must automatically include health facts (alkalinity, porosity, mineral content) based on the product type.
*   **Multi-language Output:** Generate stories in the artisan's preferred local language.

### 5.3 Digital Card Engine (Canvas)
*   **Visual Generation:** An HTML5 Canvas-based engine to merge product images, artisan details, and AI-generated text into a branded card.
*   **Templates:** Support for traditional-themed visual templates.
*   **Export:** Downloadable JPEG/PNG formats for offline use.

### 5.4 Product & Inventory Management
*   **Product Catalog:** Managed list of products (e.g., Vedic Curd Pot, Royal Kulhad Set, Ancient Cool Bottle).
*   **Attributes:** Tracking of price, eco-score, and "plastic reduced" impact.

### 5.5 Social Sharing
*   **WhatsApp Integration:** One-click sharing of the generated Story Card and caption to WhatsApp.
*   **Native Share:** Integration with mobile OS sharing sheets for other platforms.

## 6. Technical Requirements

### 6.1 Tech Stack
*   **Frontend:** React 19 (TypeScript) + Vite.
*   **Styling:** TailwindCSS 4 + Framer Motion for interactive UI.
*   **AI:** Google Generative AI SDK (Gemini API).
*   **Mobile:** Capacitor for cross-platform Android/Web deployment.
*   **Backend:** Firebase (Firestore for database, Firebase Auth for security).

### 6.2 Data Model (Key Entities)
*   **User:** `uid`, `name`, `role`, `village`, `experience`, `heritageStory`, `languagePreference`.
*   **Product:** `id`, `name`, `benefit`, `category`, `price`, `imageUrl`, `ecoScore`, `artisanId`.

## 7. Non-Functional Requirements
*   **Performance:** AI story generation should complete within 3-5 seconds.
*   **Offline Capability:** Basic UI and cached product viewing (via Capacitor).
*   **Security:** Firestore Security Rules to ensure artisans can only edit their own products and profiles.
*   **Accessibility:** High-contrast "Earth Tone" UI designed for readability in various lighting conditions.

## 8. Future Roadmap
*   **Voice-to-Story:** Allowing artisans to dictate their heritage story in local dialects.
*   **Marketplace Integration:** Direct "Buy Now" links embedded in Digital Story Cards.
*   **Community Feed:** A showcase where artisans can view and appreciate each other's crafts.

## 9. Customer Features

The Kumbara-Kala application is designed to provide customers with a smooth, interactive, and culturally rich digital shopping experience focused on handcrafted and artisan products. The application includes several customer-oriented features that improve product discovery, engagement, and convenience while promoting traditional craftsmanship through modern technology.

*   **Product Gallery:** Allows users to browse a wide variety of handcrafted products displayed in an attractive card-based layout. Each product card contains high-quality product images, product names, pricing details, artisan information, and short descriptions.
*   **User Authentication System:** Secure login/registration powered by Firebase Authentication. Customers can maintain personalized shopping experiences, save preferences, and manage profile details.
*   **Favorites and Wishlist System:** Customers can quickly add or remove products from their favorites list using simple interactive buttons for future viewing or purchase consideration.
*   **AI-Powered Product Storytelling:** Uses Gemini API to automatically generate creative and culturally meaningful product descriptions and artisan stories, detailing the history, craftsmanship, and materials.
*   **AI Chat Assistant:** An intelligent conversational interface for asking questions about products, artisan collections, product recommendations, and craft details.
*   **Responsive Multi-Device Interface:** Ensures smooth usability across smartphones, tablets, and desktop devices, automatically adapting to different screen sizes.
*   **Real-Time Product Updates:** Powered by Firebase Firestore, ensuring customers view the latest product information, stock availability, and artisan updates instantly without manual refreshes.
*   **Social Sharing Card Generator:** Generate visually appealing product cards that can be shared on social media platforms to promote artisan products digitally.
*   **Accessibility and Ease of Use:** Touch-friendly controls, intuitive navigation, readable fonts, high-contrast colour combinations, and simplified interaction flows.

## 10. Additional Artisan Features (Roadmap)

The Kumbara-Kala application can be further enhanced with several advanced artisan-focused features that improve product management, business growth, customer interaction, and digital empowerment for local craftsmen.

1. **Artisan Dashboard:** A complete overview displaying total products uploaded, total orders received, revenue summary, most viewed products, customer engagement statistics, and product performance analytics.
2. **Product Upload & Inventory Management:** Advanced system to add/edit products, upload multiple images, update stock quantity, mark availability, and categorize by craft type.
3. **Order Management System:** Track and manage purchases (view incoming, accept/reject, update status, track shipping, generate invoices, view history).
4. **Secure Online Payment Integration:** UPI, Google Pay, PhonePe, Razorpay, and Card integration for secure direct payments.
5. **AI-Based Product Description Generator:** Expanded Gemini AI module for SEO-friendly titles, social media captions, and marketing taglines.
6. **Multilingual Support:** Broad regional language support (Kannada, Hindi, Tamil, Telugu, English) for accessibility.
7. **Customer Review & Rating System:** Product ratings, written reviews, and feedback on craftsmanship to build credibility.
8. **Live Chat with Customers:** Real-time chat for custom requests, clarifications, negotiation, and delivery discussions.
9. **Personalized Artisan Profile Pages:** Dedicated pages with biography, specialization, experience, workshop photos, social links, and collections.
10. **AI-Based Product Recommendation System:** Suggestions for similar products, trending crafts, and personalized/seasonal recommendations.
11. **Product Analytics & Insights:** Data on most viewed/purchased items, demographics, peak times, and sales trends.
12. **Social Media Promotion Tools:** Automated generation of Instagram posts, WhatsApp cards, and Facebook banners.
13. **QR Code Product Sharing:** Unique QR codes for offline-to-online product promotion.
14. **Workshop & Event Booking Feature:** Platform for artisans to host and users to book craft workshops and live demonstrations.
15. **Voice Search & Voice Assistance:** Speech-based product search in regional languages.
16. **Offline Product Draft Saving:** Offline creation and automatic upload of product drafts for low-network areas.
17. **Delivery & Logistics Integration:** Shipment tracking, delivery estimates, labels, and returns management.
18. **Certification & Authenticity Verification:** Digital authenticity badges for handmade products to build trust.
19. **Community & Collaboration Forum:** A space for artisans to share experiences, collaborate, discuss techniques, and learn business strategies.
20. **Government Scheme & Training Notifications:** Alerts for subsidies, training programs, welfare schemes, and marketplace opportunities.
