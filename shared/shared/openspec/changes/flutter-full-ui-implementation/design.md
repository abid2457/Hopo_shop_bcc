# Design: Flutter Full UI

## Architecture
- Feature-first module structure (already scaffolded)
- Riverpod for state management (providers per feature)
- GoRouter for navigation (routes.dart already configured)
- Dio ApiClient for all network calls (already built with auth interceptor)
- Shared widgets for reusable UI components

## Decisions
- Each feature gets: providers/ (state), presentation/screens/ (UI), presentation/widgets/ (feature-specific widgets)
- Use existing HopoTheme, HopoColors, HopoDimensions for consistent styling
- Match React prototype pixel-perfect where practical
- Hosting target: MilesWeb PHP 8.2 + MySQL — backend will be Laravel eventually, but API contracts stay the same

## Screen Priority
Phase 1 (Critical Path): Splash → Onboarding → Home → Categories → Listing → Product Detail → Cart → Checkout → Orders
Phase 2 (User Features): Wishlist, Search, Profile, Addresses, Notifications
Phase 3 (Engagement): Reviews, Rewards, Coupons, Support, Returns
