# Hackatone Mobile App Plan

This document explains how the Hackatone mobile app should work and what is needed to build and test it.

---

# 1. Mobile App Purpose

The mobile app is mainly for participants.

Participants use it to:

- Sign in with the same email used during web registration.
- See hackathons they registered for.
- See whether they are pending, accepted, or rejected.
- Access accepted hackathons.
- View schedule and announcements.
- Show QR code for event check-in.
- See assigned team or create/join a team if allowed.
- Chat with team members.
- Submit project from phone.
- View published results and leaderboard.

---

# 2. Recommended Technology

Use:

- Expo React Native.
- TypeScript.
- Supabase Auth.
- Supabase database.
- Supabase Realtime for chat.
- Expo Camera for QR scanning if participant scanning is needed.
- QR code rendering library for participant QR.
- Expo Notifications later for push notifications.

Why Expo:

- Runs on iOS and Android.
- Fast to test with Expo Go.
- Can build Android and iOS later with EAS Build.
- Good for first mobile apps.

---

# 3. Testing Path

Recommended path:

1. Use Expo Go for the first MVP.
2. Build EAS internal distribution when the MVP is stable.
3. Use TestFlight for iOS after you have an Apple Developer account and App Store Connect setup.
4. Build Android APK or internal testing when needed.

Important:

- iOS does not use APK files. APK is Android only.
- iOS testing options are Expo Go, simulator, EAS internal distribution, or TestFlight.
- TestFlight usually requires Apple Developer Program membership.

---

# 4. App Identity

App name:

```text
Hackatone
```

Recommended identifiers:

```text
iOS bundle ID: dev.alaasi.hackatone
Android package: dev.alaasi.hackatone
```

Temporary icon:

- Rounded orange/yellow icon.
- Letter `H`.
- Replace later with real logo.

---

# 5. Mobile Screens

## 5.1 Auth

Screens:

- Welcome.
- Sign in.
- Sign up if needed.
- Forgot password.

Behavior:

- Participant signs in with same email used on web registration.
- App links user to existing registrations by email.

## 5.2 My Hackathons

Shows:

- Accepted hackathons.
- Pending hackathons.
- Rejected hackathons.

Card information:

- Hackathon name.
- Organization.
- Date.
- Status badge.
- Team status if accepted.

## 5.3 Hackathon Details

Shows:

- Description.
- Dates.
- Location.
- Tracks.
- Rules.
- Prizes.
- Registration status.
- Submission deadline.
- Quick actions.

## 5.4 Schedule

Shows:

- Event timeline.
- Sessions.
- Deadlines.
- Important milestones.

MVP:

- Simple list of event schedule items.

## 5.5 My QR Code

Shows:

- Participant name.
- Team name if assigned.
- Hackathon name.
- QR code for check-in token.

Rules:

- Only visible after participant is accepted.
- If pending/rejected, show status message instead.

## 5.6 Team

Shows:

- Team name.
- Team members.
- Team status.
- Team formation rules.
- Team code if enabled.
- Project submission status.

If organizer assigns teams:

- Participant cannot create/join team manually.

If participant team creation is enabled:

- Participant can create team or join based on selected method.

## 5.7 Team Chat

Shows:

- Messages from team members.
- Message input.
- Sender name/avatar.
- Timestamp.

Rules:

- Only team members can access.
- Realtime updates if possible.

## 5.8 Hackathon Chat

Shows:

- Messages from accepted participants in same hackathon.
- Message input.

Rules:

- Only available if organizer enables chat.
- Organizer can disable later.

## 5.9 Project Submission

Fields:

- Project title.
- Description.
- Track/category.
- GitHub link.
- Demo link.
- Presentation link.
- Video link.
- Screenshots.

Behavior:

- Team can submit from mobile.
- Team can edit until deadline.
- Updated submission appears for all team members.
- If submissions are closed, show locked state.

## 5.10 Announcements

Shows:

- Organizer announcements.
- Deadline reminders.
- Acceptance/rejection if represented as notification.

## 5.11 Results

Shows:

- Leaderboard after published.
- Winners.
- Team/project scores if organizer allows.

Before publish:

- Show message: results are not published yet.

## 5.12 Profile

Fields:

- Name.
- Email.
- Phone.
- University/company.
- Major/job title.
- Skills.
- GitHub/portfolio link.
- Bio.
- Avatar.

---

# 6. Mobile Navigation

Bottom tabs:

- Home.
- Events.
- QR.
- Team.
- Profile.

Inside hackathon:

- Overview.
- Schedule.
- Team.
- Submission.
- Chat.
- Announcements.
- Results.

---

# 7. Mobile MVP Build Order

1. Expo project setup.
2. Supabase client setup.
3. Auth screens.
4. My Hackathons screen.
5. Hackathon Details screen.
6. QR Code screen.
7. Team screen.
8. Project Submission screen.
9. Team Chat screen.
10. Announcements screen.
11. Results screen.

---

# 8. Mobile Dependencies

Likely packages:

```text
expo
expo-router
@supabase/supabase-js
react-native-url-polyfill
expo-secure-store
expo-camera
expo-notifications
react-native-qrcode-svg
nativewind
```

Push notifications can be installed later when the core app is stable.

---

# 9. Mobile Acceptance Criteria

The mobile app is successful when:

- Participant can sign in.
- Participant can see registrations by status.
- Accepted participant can open hackathon.
- Participant can see QR code.
- Participant can see team information.
- Participant can chat with team.
- Participant can submit project.
- Participant can view announcements.
- Participant can view published results.

